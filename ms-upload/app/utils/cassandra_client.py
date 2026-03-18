"""
Client Cassandra pour le stockage des métadonnées des cours
Avec retry automatique au démarrage
"""
from cassandra.cluster import Cluster
from cassandra.query import SimpleStatement
import uuid
from datetime import datetime
import os
import time
import logging
from typing import Optional, List, Dict, Any

logger = logging.getLogger(__name__)


class CassandraClient:
    """Client pour interagir avec Cassandra"""

    def __init__(self):
        self.host = os.getenv("CASSANDRA_HOST", "ent-cassandra")
        self.keyspace = "ent"
        self.cluster = None
        self.session = None
        self._connect()

    def _connect(self):
        """Établit la connexion à Cassandra avec retry automatique"""
        max_retries = 15
        retry_delay = 5

        for attempt in range(max_retries):
            try:
                logger.info(f"Connexion à Cassandra sur {self.host} (tentative {attempt + 1}/{max_retries})")

                self.cluster = Cluster(
                    [self.host],
                    connect_timeout=10,
                    control_connection_timeout=10,
                )
                self.session = self.cluster.connect()

                # Créer le keyspace s'il n'existe pas
                self.session.execute(f"""
                    CREATE KEYSPACE IF NOT EXISTS {self.keyspace}
                    WITH replication = {{'class': 'SimpleStrategy', 'replication_factor': 1}}
                """)

                # Utiliser le keyspace
                self.session.set_keyspace(self.keyspace)

                # Créer la table courses si elle n'existe pas
                self.session.execute("""
                    CREATE TABLE IF NOT EXISTS courses (
                        course_id UUID PRIMARY KEY,
                        title TEXT,
                        description TEXT,
                        file_url TEXT,
                        file_name TEXT,
                        file_size BIGINT,
                        content_type TEXT,
                        teacher_id TEXT,
                        teacher_name TEXT,
                        created_at TIMESTAMP,
                        updated_at TIMESTAMP
                    )
                """)

                # Créer des index pour les recherches
                self.session.execute("CREATE INDEX IF NOT EXISTS ON courses (teacher_id)")
                self.session.execute("CREATE INDEX IF NOT EXISTS ON courses (title)")

                logger.info("✅ Connexion à Cassandra établie avec succès")
                return  # Succès, on sort de la boucle

            except Exception as e:
                logger.warning(f"Tentative {attempt + 1}/{max_retries} échouée: {e}")
                if self.cluster:
                    try:
                        self.cluster.shutdown()
                    except Exception:
                        pass
                    self.cluster = None
                    self.session = None

                if attempt < max_retries - 1:
                    logger.info(f"Nouvelle tentative dans {retry_delay} secondes...")
                    time.sleep(retry_delay)
                else:
                    logger.error(f"❌ Impossible de se connecter à Cassandra après {max_retries} tentatives")
                    raise

    def create_course(self, course_data: Dict[str, Any], teacher_id: str, teacher_name: str,
                      file_url: str, file_name: str, file_size: int, content_type: str) -> Dict[str, Any]:
        """Crée un nouveau cours"""
        course_id = uuid.uuid4()
        now = datetime.now()

        title = course_data.get('title', 'Sans titre')
        description = course_data.get('description', '')

        logger.info(f"Création cours: {title} par {teacher_name}")

        try:
            self.session.execute("""
                INSERT INTO courses (
                    course_id, title, description, file_url, file_name, file_size,
                    content_type, teacher_id, teacher_name, created_at, updated_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                course_id,
                title,
                description,
                file_url,
                file_name,
                file_size,
                content_type,
                teacher_id,
                teacher_name,
                now,
                now
            ))

            logger.info(f"Cours créé avec succès: {course_id}")

            return {
                "course_id": str(course_id),
                "title": title,
                "description": description,
                "file_url": file_url,
                "file_name": file_name,
                "file_size": file_size,
                "content_type": content_type,
                "teacher_id": teacher_id,
                "teacher_name": teacher_name,
                "created_at": now.isoformat(),
                "updated_at": now.isoformat()
            }

        except Exception as e:
            logger.error(f"Erreur création cours: {e}")
            raise

    def get_course_by_id(self, course_id: str) -> Optional[Dict[str, Any]]:
        """Récupère un cours par son ID"""
        try:
            rows = self.session.execute(
                "SELECT * FROM courses WHERE course_id = %s",
                (uuid.UUID(course_id),)
            )
            for row in rows:
                return {
                    "course_id": str(row.course_id),
                    "title": row.title,
                    "description": row.description,
                    "file_url": row.file_url,
                    "file_name": row.file_name,
                    "file_size": row.file_size,
                    "content_type": row.content_type,
                    "teacher_id": row.teacher_id,
                    "teacher_name": row.teacher_name,
                    "created_at": row.created_at.isoformat() if row.created_at else None,
                    "updated_at": row.updated_at.isoformat() if row.updated_at else None
                }
            return None
        except Exception as e:
            logger.error(f"Erreur récupération cours {course_id}: {e}")
            return None

    def get_courses_by_teacher(self, teacher_id: str) -> List[Dict[str, Any]]:
        """Récupère tous les cours d'un enseignant"""
        try:
            rows = self.session.execute(
                "SELECT * FROM courses WHERE teacher_id = %s ALLOW FILTERING",
                (teacher_id,)
            )
            courses = []
            for row in rows:
                courses.append({
                    "course_id": str(row.course_id),
                    "title": row.title,
                    "description": row.description,
                    "file_url": row.file_url,
                    "file_name": row.file_name,
                    "file_size": row.file_size,
                    "content_type": row.content_type,
                    "teacher_id": row.teacher_id,
                    "teacher_name": row.teacher_name,
                    "created_at": row.created_at.isoformat() if row.created_at else None,
                    "updated_at": row.updated_at.isoformat() if row.updated_at else None
                })
            return courses
        except Exception as e:
            logger.error(f"Erreur récupération cours pour teacher {teacher_id}: {e}")
            return []

    def get_all_courses(self) -> List[Dict[str, Any]]:
        """Récupère tous les cours"""
        try:
            rows = self.session.execute("SELECT * FROM courses")
            courses = []
            for row in rows:
                courses.append({
                    "course_id": str(row.course_id),
                    "title": row.title,
                    "description": row.description,
                    "file_url": row.file_url,
                    "file_name": row.file_name,
                    "file_size": row.file_size,
                    "content_type": row.content_type,
                    "teacher_id": row.teacher_id,
                    "teacher_name": row.teacher_name,
                    "created_at": row.created_at.isoformat() if row.created_at else None,
                    "updated_at": row.updated_at.isoformat() if row.updated_at else None
                })
            return courses
        except Exception as e:
            logger.error(f"Erreur récupération tous les cours: {e}")
            return []

    def delete_course(self, course_id: str) -> bool:
        """Supprime un cours"""
        try:
            self.session.execute(
                "DELETE FROM courses WHERE course_id = %s",
                (uuid.UUID(course_id),)
            )
            logger.info(f"Cours {course_id} supprimé de Cassandra")
            return True
        except Exception as e:
            logger.error(f"Erreur suppression cours {course_id}: {e}")
            return False

    def close(self):
        """Ferme la connexion"""
        if self.cluster:
            self.cluster.shutdown()
            logger.info("Connexion Cassandra fermée")


# Instance globale pour réutilisation
cassandra_db = CassandraClient()

