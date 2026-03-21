"""
Routes pour l'upload de cours
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from typing import List, Optional
import logging
import os

from app.utils.auth import verify_token, verify_teacher
from app.utils.cassandra_client import cassandra_db
from app.utils.minio_client import minio_client

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/cours", tags=["Upload"])

# Taille maximale des fichiers (100 MB)
MAX_FILE_SIZE = 100 * 1024 * 1024

# Types MIME autorisés
ALLOWED_MIME_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/zip",
    "application/x-zip-compressed",
    "text/plain",
    "image/jpeg",
    "image/png",
    "image/jpg",
    "video/mp4",
    "video/x-msvideo",
    "video/quicktime"
]

@router.post("", status_code=201)
async def upload_cours(
    file: UploadFile = File(...),
    title: str = Form(...),
    description: Optional[str] = Form(None),
    teacher = Depends(verify_teacher)  # Vérifie que c'est un enseignant
):
    """
    Upload un nouveau cours
    🔒 ROUTE PROTÉGÉE - Réservée aux enseignants
    
    - **file**: Fichier du cours (PDF, DOC, PPT, etc.)
    - **title**: Titre du cours
    - **description**: Description optionnelle
    """
    logger.info(f"Tentative d'upload par {teacher['username']}: {title}")
    
    # 1. Vérifier que le fichier n'est pas vide
    if not file:
        raise HTTPException(
            status_code=400,
            detail="Aucun fichier fourni"
        )
    
    # 2. Vérifier le type MIME
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Type de fichier non autorisé: {file.content_type}. Types autorisés: PDF, DOC, PPT, ZIP, TXT, images, vidéos"
        )
    
    # 3. Upload vers MinIO (appel asynchrone avec await)
    try:
        file_url, file_size, object_name = await minio_client.upload_file(
            file_data=file,
            file_name=file.filename,
            content_type=file.content_type
        )
        
        # Vérifier la taille après upload
        if file_size > MAX_FILE_SIZE:
            # Si trop gros, supprimer le fichier de MinIO
            minio_client.delete_file(object_name)
            raise HTTPException(
                status_code=413,
                detail=f"Fichier trop volumineux. Taille max: {MAX_FILE_SIZE // (1024*1024)} MB"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur upload MinIO: {e}")
        raise HTTPException(
            status_code=500,
            detail="Erreur lors du stockage du fichier"
        )
    
    # 4. Sauvegarder les métadonnées dans Cassandra
    try:
        # Créer un dictionnaire simple au lieu d'utiliser l'objet Pydantic
        course_data = {
            "title": title,
            "description": description or ""
        }
        
        new_course = cassandra_db.create_course(
            course_data=course_data,
            teacher_id=teacher["user_id"],
            teacher_name=teacher["username"],
            file_url=file_url,
            file_name=file.filename,
            file_size=file_size,
            content_type=file.content_type
        )
        
        logger.info(f"Cours uploadé avec succès: {new_course['course_id']}")
        return new_course
        
    except Exception as e:
        # En cas d'erreur Cassandra, supprimer le fichier de MinIO
        logger.error(f"Erreur sauvegarde Cassandra: {e}")
        minio_client.delete_file(object_name)
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la sauvegarde des métadonnées: {str(e)}"
        )

@router.get("/teacher")
async def get_teacher_courses(
    teacher = Depends(verify_teacher)
):
    """
    Récupère tous les cours d'un enseignant
    🔒 ROUTE PROTÉGÉE - Réservée aux enseignants
    """
    logger.info(f"Récupération des cours pour {teacher['username']}")
    
    try:
        courses = cassandra_db.get_courses_by_teacher(teacher["user_id"])
        return courses
    except Exception as e:
        logger.error(f"Erreur récupération cours enseignant: {e}")
        raise HTTPException(
            status_code=500,
            detail="Erreur lors de la récupération des cours"
        )

@router.get("/all")
async def get_all_courses(
    user = Depends(verify_token)
):
    """
    Récupère tous les cours disponibles
    🔒 ROUTE PROTÉGÉE - Accessible à tous les utilisateurs connectés
    """
    logger.info(f"Récupération de tous les cours par {user['username']}")
    
    try:
        courses = cassandra_db.get_all_courses()
        return courses
    except Exception as e:
        logger.error(f"Erreur récupération tous les cours: {e}")
        raise HTTPException(
            status_code=500,
            detail="Erreur lors de la récupération des cours"
        )

@router.get("/{course_id}")
async def get_course(
    course_id: str,
    user = Depends(verify_token)
):
    """
    Récupère les détails d'un cours spécifique
    🔒 ROUTE PROTÉGÉE
    """
    logger.info(f"Récupération du cours {course_id} par {user['username']}")
    
    try:
        course = cassandra_db.get_course_by_id(course_id)
        if not course:
            raise HTTPException(
                status_code=404,
                detail="Cours non trouvé"
            )
        return course
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur récupération cours {course_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail="Erreur lors de la récupération du cours"
        )

@router.delete("/{course_id}")
async def delete_course(
    course_id: str,
    teacher = Depends(verify_teacher)
):
    """
    Supprime un cours (seulement par l'enseignant qui l'a créé)
    🔒 ROUTE PROTÉGÉE - Réservée aux enseignants
    """
    logger.info(f"Tentative de suppression cours {course_id} par {teacher['username']}")
    
    try:
        # Vérifier que le cours existe
        course = cassandra_db.get_course_by_id(course_id)
        if not course:
            raise HTTPException(
                status_code=404,
                detail="Cours non trouvé"
            )
        
        # Vérifier que l'enseignant est bien le propriétaire
        if course["teacher_id"] != teacher["user_id"]:
            raise HTTPException(
                status_code=403,
                detail="Vous ne pouvez supprimer que vos propres cours"
            )
        
        # Extraire le nom de l'objet MinIO depuis l'URL
        # L'URL est de la forme: http://172.18.0.7:9000/cours/uuid-fichier.txt
        file_url = course["file_url"]
        object_name = file_url.split('/')[-1]  # Prend le dernier élément après le dernier /
        
        # Supprimer de MinIO
        minio_client.delete_file(object_name)
        
        # Supprimer de Cassandra
        cassandra_db.delete_course(course_id)
        
        logger.info(f"Cours {course_id} supprimé avec succès")
        return {"message": "Cours supprimé avec succès"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur suppression cours {course_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail="Erreur lors de la suppression du cours"
        )

@router.get("/download/{course_id}")
async def download_course(
    course_id: str,
    user = Depends(verify_token)
):
    """
    Génère une URL temporaire pour télécharger un cours
    🔒 ROUTE PROTÉGÉE
    """
    logger.info(f"Téléchargement du cours {course_id} par {user['username']}")
    
    try:
        # Vérifier que le cours existe
        course = cassandra_db.get_course_by_id(course_id)
        if not course:
            raise HTTPException(
                status_code=404,
                detail="Cours non trouvé"
            )
        
        # Extraire le nom de l'objet MinIO depuis l'URL
        file_url = course["file_url"]
        object_name = file_url.split('/')[-1]
        
        # Générer URL temporaire (valable 1 heure)
        download_url = minio_client.get_file_url(object_name, expires=3600)
        
        if not download_url:
            raise HTTPException(
                status_code=500,
                detail="Erreur lors de la génération de l'URL de téléchargement"
            )
        
        return {
            "course_id": course_id,
            "title": course["title"],
            "download_url": download_url,
            "expires_in": "3600 secondes (1 heure)",
            "file_name": course["file_name"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur téléchargement cours {course_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail="Erreur lors du téléchargement du cours"
        )

@router.get("/health")
async def health_check():
    """Vérifie la santé du service"""
    try:
        # Vérifier connexion Cassandra
        cassandra_db.get_all_courses()
        
        # Vérifier connexion MinIO
        minio_client.bucket_exists()
        
        return {
            "status": "healthy",
            "service": "upload",
            "cassandra": "connected",
            "minio": "connected",
            "minio_endpoint": minio_client.endpoint,
            "bucket": minio_client.bucket_name
        }
    except Exception as e:
        return {
            "status": "degraded",
            "service": "upload",
            "error": str(e)
        }
