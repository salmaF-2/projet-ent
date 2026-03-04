"""
Client MinIO pour le stockage des fichiers
Version corrigée avec gestion asynchrone des fichiers FastAPI
"""
from minio import Minio
from minio.error import S3Error
import os
import logging
import uuid
from datetime import timedelta

logger = logging.getLogger(__name__)

class MinioClient:
    """Client pour interagir avec MinIO"""
    
    def __init__(self):
        # Récupérer les variables d'environnement ou utiliser les valeurs par défaut
        self.endpoint = os.getenv("MINIO_ENDPOINT", "172.18.0.7:9000")  # IP directe de MinIO
        self.access_key = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
        self.secret_key = os.getenv("MINIO_SECRET_KEY", "minioadmin123")
        self.bucket_name = os.getenv("MINIO_BUCKET", "cours")
        self.secure = False  # False pour développement (HTTP)
        
        self.client = None
        self._connect()
    
    def _connect(self):
        """Établit la connexion à MinIO"""
        try:
            logger.info(f"Connexion à MinIO sur {self.endpoint}")
            
            self.client = Minio(
                endpoint=self.endpoint,
                access_key=self.access_key,
                secret_key=self.secret_key,
                secure=self.secure
            )
            
            # Vérifier si le bucket existe, sinon le créer
            if not self.client.bucket_exists(self.bucket_name):
                self.client.make_bucket(self.bucket_name)
                logger.info(f"Bucket '{self.bucket_name}' créé avec succès")
            else:
                logger.info(f"Bucket '{self.bucket_name}' existe déjà")
            
            logger.info("Connexion à MinIO établie avec succès")
            
        except S3Error as e:
            logger.error(f"Erreur MinIO: {e}")
            raise
        except Exception as e:
            logger.error(f"Erreur de connexion à MinIO: {e}")
            raise
    
    async def upload_file(self, file_data, file_name: str, content_type: str):
        """
        Upload un fichier vers MinIO (version asynchrone)
        
        Args:
            file_data: Les données du fichier (UploadFile de FastAPI)
            file_name: Nom original du fichier
            content_type: Type MIME du fichier
            
        Returns:
            tuple: (file_url, file_size, object_name)
        """
        try:
            # Générer un nom unique pour le fichier
            object_name = f"{uuid.uuid4()}-{file_name}"
            
            # Lire le contenu du fichier (await car c'est une coroutine)
            content = await file_data.read()
            file_size = len(content)
            
            # Remettre le curseur au début pour les opérations futures
            await file_data.seek(0)
            
            logger.info(f"Upload du fichier: {file_name} ({file_size} octets) vers {object_name}")
            
            # Uploader le fichier vers MinIO
            # Note: file_data.file est le fichier original (sans await)
            self.client.put_object(
                bucket_name=self.bucket_name,
                object_name=object_name,
                data=file_data.file,
                length=file_size,
                content_type=content_type
            )
            
            # Générer l'URL directe du fichier
            if self.secure:
                protocol = "https"
            else:
                protocol = "http"
            
            # URL directe pour accéder au fichier
            file_url = f"{protocol}://{self.endpoint}/{self.bucket_name}/{object_name}"
            
            logger.info(f"Fichier uploadé avec succès: {object_name}")
            
            return file_url, file_size, object_name
            
        except Exception as e:
            logger.error(f"Erreur upload: {e}")
            raise
    
    async def upload_file_with_content(self, file_content, file_name: str, content_type: str):
        """
        Upload un fichier vers MinIO à partir de contenu binaire
        
        Args:
            file_content: Contenu binaire du fichier (bytes)
            file_name: Nom original du fichier
            content_type: Type MIME du fichier
            
        Returns:
            tuple: (file_url, file_size, object_name)
        """
        try:
            object_name = f"{uuid.uuid4()}-{file_name}"
            file_size = len(file_content)
            
            from io import BytesIO
            data_stream = BytesIO(file_content)
            
            self.client.put_object(
                bucket_name=self.bucket_name,
                object_name=object_name,
                data=data_stream,
                length=file_size,
                content_type=content_type
            )
            
            protocol = "https" if self.secure else "http"
            file_url = f"{protocol}://{self.endpoint}/{self.bucket_name}/{object_name}"
            
            logger.info(f"Fichier uploadé avec succès (binaire): {object_name}")
            
            return file_url, file_size, object_name
            
        except Exception as e:
            logger.error(f"Erreur upload binaire: {e}")
            raise
    
    def get_file_url(self, object_name: str, expires: int = 3600):
        """
        Génère une URL temporaire pour télécharger un fichier
        
        Args:
            object_name: Nom de l'objet dans MinIO
            expires: Durée de validité en secondes (défaut: 1 heure)
            
        Returns:
            str: URL temporaire
        """
        try:
            url = self.client.presigned_get_object(
                bucket_name=self.bucket_name,
                object_name=object_name,
                expires=timedelta(seconds=expires)
            )
            logger.info(f"URL générée pour {object_name} (valide {expires} secondes)")
            return url
        except S3Error as e:
            logger.error(f"Erreur génération URL: {e}")
            return None
    
    def delete_file(self, object_name: str):
        """
        Supprime un fichier de MinIO
        
        Args:
            object_name: Nom de l'objet à supprimer
            
        Returns:
            bool: True si succès, False sinon
        """
        try:
            self.client.remove_object(
                bucket_name=self.bucket_name,
                object_name=object_name
            )
            logger.info(f"Fichier supprimé: {object_name}")
            return True
        except S3Error as e:
            logger.error(f"Erreur suppression MinIO: {e}")
            return False
    
    def list_files(self, prefix: str = ""):
        """
        Liste tous les fichiers dans le bucket
        
        Args:
            prefix: Préfixe pour filtrer les fichiers
            
        Returns:
            list: Liste des objets
        """
        try:
            objects = self.client.list_objects(
                bucket_name=self.bucket_name,
                prefix=prefix,
                recursive=True
            )
            
            file_list = []
            for obj in objects:
                file_list.append({
                    "object_name": obj.object_name,
                    "size": obj.size,
                    "etag": obj.etag,
                    "last_modified": obj.last_modified.isoformat() if obj.last_modified else None
                })
            
            logger.info(f"Liste des fichiers: {len(file_list)} trouvés")
            return file_list
            
        except S3Error as e:
            logger.error(f"Erreur liste fichiers: {e}")
            return []
    
    def get_file_info(self, object_name: str):
        """
        Récupère les informations d'un fichier
        
        Args:
            object_name: Nom de l'objet
            
        Returns:
            dict: Informations du fichier ou None si non trouvé
        """
        try:
            info = self.client.stat_object(
                bucket_name=self.bucket_name,
                object_name=object_name
            )
            
            return {
                "object_name": info.object_name,
                "size": info.size,
                "etag": info.etag,
                "last_modified": info.last_modified.isoformat() if info.last_modified else None,
                "content_type": info.content_type,
                "metadata": info.metadata
            }
            
        except S3Error as e:
            if e.code == "NoSuchKey":
                logger.warning(f"Fichier non trouvé: {object_name}")
                return None
            logger.error(f"Erreur info fichier: {e}")
            return None
    
    def bucket_exists(self):
        """Vérifie si le bucket existe"""
        try:
            return self.client.bucket_exists(self.bucket_name)
        except Exception as e:
            logger.error(f"Erreur vérification bucket: {e}")
            return False

# Instance globale pour réutilisation
minio_client = MinioClient()
