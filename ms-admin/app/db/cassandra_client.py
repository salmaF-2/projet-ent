"""
Client Cassandra pour la gestion des utilisateurs
"""
from cassandra.cluster import Cluster
from cassandra.query import SimpleStatement
from cassandra import Unavailable
import uuid
from datetime import datetime
import os
import logging
from typing import Optional, List, Dict, Any

from app.models.user import UserInDB, UserCreate, UserUpdate

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
        """Établit la connexion à Cassandra"""
        try:
            logger.info(f"Connexion à Cassandra sur {self.host}")
            self.cluster = Cluster([self.host])
            self.session = self.cluster.connect()
            
            # Créer le keyspace s'il n'existe pas
            self.session.execute(f"""
                CREATE KEYSPACE IF NOT EXISTS {self.keyspace}
                WITH replication = {{'class': 'SimpleStrategy', 'replication_factor': 1}}
            """)
            
            # Utiliser le keyspace
            self.session.set_keyspace(self.keyspace)
            
            # Créer la table users si elle n'existe pas
            self.session.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    user_id UUID PRIMARY KEY,
                    username TEXT,
                    email TEXT,
                    full_name TEXT,
                    role TEXT,
                    created_at TIMESTAMP,
                    updated_at TIMESTAMP
                )
            """)
            
            # Créer des index pour les recherches fréquentes
            self.session.execute("CREATE INDEX IF NOT EXISTS ON users (username)")
            self.session.execute("CREATE INDEX IF NOT EXISTS ON users (email)")
            self.session.execute("CREATE INDEX IF NOT EXISTS ON users (role)")
            
            logger.info("Connexion à Cassandra établie avec succès")
            
        except Exception as e:
            logger.error(f"Erreur de connexion à Cassandra: {e}")
            raise
    
    def _row_to_user(self, row) -> Optional[UserInDB]:
        """Convertit une ligne Cassandra en objet UserInDB"""
        if not row:
            return None
        
        return UserInDB(
            user_id=row.user_id,
            username=row.username,
            email=row.email,
            full_name=row.full_name,
            role=row.role,
            created_at=row.created_at,
            updated_at=row.updated_at
        )
    
    # ===== CRUD Operations =====
    
    def create_user(self, user_data: UserCreate) -> UserInDB:
        """Crée un nouvel utilisateur"""
        user_id = uuid.uuid4()
        now = datetime.now()
        
        logger.info(f"Création utilisateur: {user_data.username}")
        
        self.session.execute("""
            INSERT INTO users (user_id, username, email, full_name, role, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            user_id, 
            user_data.username, 
            user_data.email, 
            user_data.full_name, 
            user_data.role,
            now, 
            now
        ))
        
        return UserInDB(
            user_id=user_id,
            username=user_data.username,
            email=user_data.email,
            full_name=user_data.full_name,
            role=user_data.role,
            created_at=now,
            updated_at=now
        )
    
    def get_user_by_id(self, user_id: str) -> Optional[UserInDB]:
        """Récupère un utilisateur par son ID"""
        try:
            rows = self.session.execute(
                "SELECT * FROM users WHERE user_id = %s",
                (uuid.UUID(user_id),)
            )
            
            for row in rows:
                return self._row_to_user(row)
            
            return None
            
        except Exception as e:
            logger.error(f"Erreur récupération utilisateur {user_id}: {e}")
            return None
    
    def get_user_by_username(self, username: str) -> Optional[UserInDB]:
        """Récupère un utilisateur par son nom d'utilisateur"""
        try:
            rows = self.session.execute(
                "SELECT * FROM users WHERE username = %s ALLOW FILTERING",
                (username,)
            )
            
            for row in rows:
                return self._row_to_user(row)
            
            return None
            
        except Exception as e:
            logger.error(f"Erreur récupération utilisateur {username}: {e}")
            return None
    
    def get_user_by_email(self, email: str) -> Optional[UserInDB]:
        """Récupère un utilisateur par son email"""
        try:
            rows = self.session.execute(
                "SELECT * FROM users WHERE email = %s ALLOW FILTERING",
                (email,)
            )
            
            for row in rows:
                return self._row_to_user(row)
            
            return None
            
        except Exception as e:
            logger.error(f"Erreur récupération utilisateur {email}: {e}")
            return None
    
    def get_all_users(self, role: Optional[str] = None) -> List[UserInDB]:
        """Récupère tous les utilisateurs, optionnellement filtrés par rôle"""
        try:
            if role:
                rows = self.session.execute(
                    "SELECT * FROM users WHERE role = %s ALLOW FILTERING",
                    (role,)
                )
            else:
                rows = self.session.execute("SELECT * FROM users")
            
            users = []
            for row in rows:
                users.append(self._row_to_user(row))
            
            return users
            
        except Exception as e:
            logger.error(f"Erreur récupération utilisateurs: {e}")
            return []
    
    def update_user(self, user_id: str, user_update: UserUpdate) -> bool:
        """Met à jour un utilisateur"""
        updates = []
        values = []
        
        if user_update.email:
            updates.append("email = %s")
            values.append(user_update.email)
        
        if user_update.full_name:
            updates.append("full_name = %s")
            values.append(user_update.full_name)
        
        if user_update.role:
            updates.append("role = %s")
            values.append(user_update.role)
        
        if not updates:
            return False
        
        try:
            # Ajouter updated_at et user_id
            values.append(datetime.now())
            values.append(uuid.UUID(user_id))
            
            query = f"""
                UPDATE users 
                SET {', '.join(updates)}, updated_at = %s 
                WHERE user_id = %s
            """
            
            self.session.execute(query, values)
            logger.info(f"Utilisateur {user_id} mis à jour")
            return True
            
        except Exception as e:
            logger.error(f"Erreur mise à jour utilisateur {user_id}: {e}")
            return False
    
    def delete_user(self, user_id: str) -> bool:
        """Supprime un utilisateur"""
        try:
            self.session.execute(
                "DELETE FROM users WHERE user_id = %s",
                (uuid.UUID(user_id),)
            )
            logger.info(f"Utilisateur {user_id} supprimé")
            return True
            
        except Exception as e:
            logger.error(f"Erreur suppression utilisateur {user_id}: {e}")
            return False
    
    def user_exists(self, username: Optional[str] = None, email: Optional[str] = None) -> bool:
        """Vérifie si un utilisateur existe déjà"""
        if username:
            user = self.get_user_by_username(username)
            if user:
                return True
        
        if email:
            user = self.get_user_by_email(email)
            if user:
                return True
        
        return False
    
    def get_stats(self) -> Dict[str, Any]:
        """Récupère des statistiques sur les utilisateurs"""
        users = self.get_all_users()
        
        stats = {
            "total": len(users),
            "by_role": {
                "admin": 0,
                "teacher": 0,
                "student": 0
            }
        }
        
        for user in users:
            stats["by_role"][user.role] += 1
        
        return stats
    
    def close(self):
        """Ferme la connexion"""
        if self.cluster:
            self.cluster.shutdown()
            logger.info("Connexion Cassandra fermée")

# Instance globale pour réutilisation
cassandra_db = CassandraClient()
