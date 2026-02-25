"""
Microservice Admin (M4) - Gestion des utilisateurs
"""

from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
import httpx
import uuid
import datetime
import os
from typing import Optional, List
import logging

# Configuration logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialisation de l'application
app = FastAPI(
    title="Service Administration - ENT EST Salé",
    description="Microservice pour la gestion des utilisateurs (M4)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Sécurité
security = HTTPBearer()

# Configuration des services
AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://ms-auth:8000")
CASSANDRA_HOST = os.getenv("CASSANDRA_HOST", "ent-cassandra")

# ============================================
# BASE DE DONNÉES SIMULÉE (en attendant Cassandra)
# ============================================

users_db = [
    {
        "user_id": "1",
        "username": "admin",
        "email": "admin@est.ma",
        "full_name": "Administrateur Système",
        "role": "admin",
        "created_at": str(datetime.datetime.now()),
        "updated_at": str(datetime.datetime.now())
    },
    {
        "user_id": "2",
        "username": "teacher",
        "email": "teacher@est.ma",
        "full_name": "Professeur Principal",
        "role": "teacher",
        "created_at": str(datetime.datetime.now()),
        "updated_at": str(datetime.datetime.now())
    },
    {
        "user_id": "3",
        "username": "student",
        "email": "student@est.ma",
        "full_name": "Étudiant Test",
        "role": "student",
        "created_at": str(datetime.datetime.now()),
        "updated_at": str(datetime.datetime.now())
    }
]

# ============================================
# FONCTIONS D'AUTHENTIFICATION
# ============================================

async def verify_token(token: str) -> dict:
    """
    Vérifie la validité du token JWT.
    Version MOCK pour développement sans M1.
    """
    logger.info(f"Vérification du token: {token[:20]}...")
    
    # Tokens factices pour le développement
    mock_tokens = {
        "admin-token": {
            "user_id": "1",
            "username": "admin",
            "role": "admin",
            "valid": True
        },
        "teacher-token": {
            "user_id": "2",
            "username": "teacher",
            "role": "teacher",
            "valid": True
        },
        "student-token": {
            "user_id": "3",
            "username": "student",
            "role": "student",
            "valid": True
        }
    }
    
    # Nettoyer le token (enlever "Bearer " si présent)
    clean_token = token.replace("Bearer ", "")
    
    # Vérifier si c'est un token factice
    if clean_token in mock_tokens:
        logger.info(f"Token factice reconnu: {clean_token}")
        return mock_tokens[clean_token]
    
    # TODO: Appeler le vrai service Auth (M1) quand il sera prêt
    """
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(
                f"{AUTH_SERVICE_URL}/auth/verify",
                headers={"Authorization": f"Bearer {clean_token}"}
            )
            if response.status_code == 200:
                return response.json()
    except Exception as e:
        logger.error(f"Erreur appel Auth: {e}")
    """
    
    # Si aucun token valide
    logger.warning(f"Token invalide: {clean_token}")
    raise HTTPException(
        status_code=401,
        detail="Token invalide ou expiré"
    )

async def verify_admin(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Vérifie que l'utilisateur est administrateur.
    À utiliser comme dépendance pour les routes admin.
    """
    token = credentials.credentials
    user_info = await verify_token(token)
    
    if user_info.get("role") != "admin":
        logger.warning(f"Tentative d'accès admin par {user_info.get('username')} (rôle: {user_info.get('role')})")
        raise HTTPException(
            status_code=403,
            detail="Accès réservé aux administrateurs"
        )
    
    logger.info(f"Accès admin autorisé pour {user_info.get('username')}")
    return user_info

# ============================================
# ROUTES PRINCIPALES
# ============================================

@app.get("/")
async def root():
    """Route racine - informations sur le service"""
    return {
        "service": "Administration (M4)",
        "version": "1.0.0",
        "status": "running",
        "description": "Gestion des utilisateurs de l'ENT",
        "endpoints": {
            "GET /health": "Vérification de santé",
            "GET /admin/users": "Liste tous les utilisateurs",
            "GET /admin/users/{user_id}": "Détail d'un utilisateur",
            "POST /admin/users": "Crée un utilisateur (params: username, email, full_name, role)",
            "PUT /admin/users/{user_id}": "Met à jour un utilisateur",
            "DELETE /admin/users/{user_id}": "Supprime un utilisateur",
            "GET /admin/stats": "Statistiques",
            "GET /admin/check-username/{username}": "Vérifie disponibilité username",
            "GET /admin/check-email/{email}": "Vérifie disponibilité email"
        },
        "documentation": "/docs"
    }

@app.get("/health")
async def health():
    """Health check pour Docker et monitoring"""
    return {
        "status": "healthy",
        "service": "admin",
        "timestamp": str(datetime.datetime.now())
    }

# ============================================
# ROUTES D'ADMINISTRATION
# ============================================

@app.get("/admin/users")
async def get_users(
    role: Optional[str] = Query(None, regex="^(admin|teacher|student)$"),
    admin: dict = Depends(verify_admin)
):
    """
    Récupère la liste des utilisateurs.
    Option: filtrer par rôle (admin/teacher/student)
    """
    logger.info(f"Liste des utilisateurs demandée par {admin['username']}")
    
    if role:
        filtered_users = [u for u in users_db if u["role"] == role]
        return {
            "total": len(filtered_users),
            "role_filter": role,
            "users": filtered_users
        }
    
    return {
        "total": len(users_db),
        "users": users_db
    }

@app.get("/admin/users/{user_id}")
async def get_user(
    user_id: str,
    admin: dict = Depends(verify_admin)
):
    """
    Récupère les détails d'un utilisateur spécifique.
    """
    logger.info(f"Détail utilisateur {user_id} demandé par {admin['username']}")
    
    for user in users_db:
        if user["user_id"] == user_id:
            return user
    
    raise HTTPException(
        status_code=404,
        detail=f"Utilisateur avec ID {user_id} non trouvé"
    )

@app.post("/admin/users")
async def create_user(
    username: str,
    email: str,
    full_name: str,
    role: str = Query(..., regex="^(admin|teacher|student)$"),
    admin: dict = Depends(verify_admin)
):
    """
    Crée un nouvel utilisateur.
    Paramètres requis:
    - username: nom d'utilisateur unique
    - email: email valide
    - full_name: nom complet
    - role: admin, teacher ou student
    """
    logger.info(f"Tentative de création utilisateur {username} par {admin['username']}")
    
    # Validation du rôle
    if role not in ["admin", "teacher", "student"]:
        raise HTTPException(
            status_code=400,
            detail="Rôle invalide. Choisir: admin, teacher, student"
        )
    
    # Vérifier si l'utilisateur existe déjà
    for user in users_db:
        if user["username"] == username:
            raise HTTPException(
                status_code=400,
                detail=f"Le nom d'utilisateur '{username}' est déjà pris"
            )
        if user["email"] == email:
            raise HTTPException(
                status_code=400,
                detail=f"L'email '{email}' est déjà utilisé"
            )
    
    # Créer le nouvel utilisateur
    new_user = {
        "user_id": str(uuid.uuid4()),
        "username": username,
        "email": email,
        "full_name": full_name,
        "role": role,
        "created_at": str(datetime.datetime.now()),
        "updated_at": str(datetime.datetime.now())
    }
    
    users_db.append(new_user)
    logger.info(f"Utilisateur {username} créé avec ID {new_user['user_id']}")
    
    return {
        "message": "Utilisateur créé avec succès",
        "user": new_user
    }

@app.put("/admin/users/{user_id}")
async def update_user(
    user_id: str,
    email: Optional[str] = None,
    full_name: Optional[str] = None,
    role: Optional[str] = Query(None, regex="^(admin|teacher|student)$"),
    admin: dict = Depends(verify_admin)
):
    """
    Met à jour un utilisateur existant.
    Seuls les champs fournis seront mis à jour.
    """
    logger.info(f"Mise à jour utilisateur {user_id} par {admin['username']}")
    
    for user in users_db:
        if user["user_id"] == user_id:
            # Mise à jour des champs
            if email:
                # Vérifier si le nouvel email n'est pas déjà pris
                for u in users_db:
                    if u["email"] == email and u["user_id"] != user_id:
                        raise HTTPException(
                            status_code=400,
                            detail=f"L'email '{email}' est déjà utilisé"
                        )
                user["email"] = email
            
            if full_name:
                user["full_name"] = full_name
            
            if role:
                user["role"] = role
            
            user["updated_at"] = str(datetime.datetime.now())
            
            logger.info(f"Utilisateur {user_id} mis à jour")
            return {
                "message": "Utilisateur mis à jour",
                "user": user
            }
    
    raise HTTPException(
        status_code=404,
        detail=f"Utilisateur avec ID {user_id} non trouvé"
    )

@app.delete("/admin/users/{user_id}")
async def delete_user(
    user_id: str,
    admin: dict = Depends(verify_admin)
):
    """
    Supprime un utilisateur.
    Un admin ne peut pas supprimer son propre compte.
    """
    logger.info(f"Tentative de suppression utilisateur {user_id} par {admin['username']}")
    
    # Empêcher la suppression de soi-même
    if user_id == admin.get("user_id"):
        raise HTTPException(
            status_code=400,
            detail="Vous ne pouvez pas supprimer votre propre compte"
        )
    
    for i, user in enumerate(users_db):
        if user["user_id"] == user_id:
            deleted_user = users_db.pop(i)
            logger.info(f"Utilisateur {deleted_user['username']} supprimé")
            return {
                "message": f"Utilisateur {deleted_user['username']} supprimé avec succès"
            }
    
    raise HTTPException(
        status_code=404,
        detail=f"Utilisateur avec ID {user_id} non trouvé"
    )

@app.get("/admin/stats")
async def get_stats(admin: dict = Depends(verify_admin)):
    """
    Statistiques sur les utilisateurs.
    """
    logger.info(f"Statistiques demandées par {admin['username']}")
    
    stats = {
        "total": len(users_db),
        "by_role": {
            "admin": 0,
            "teacher": 0,
            "student": 0
        },
        "recent_users": []
    }
    
    # Compter par rôle
    for user in users_db:
        stats["by_role"][user["role"]] += 1
    
    # Récupérer les 5 utilisateurs les plus récents
    recent = sorted(users_db, key=lambda x: x["created_at"], reverse=True)[:5]
    stats["recent_users"] = [
        {
            "user_id": u["user_id"],
            "username": u["username"],
            "role": u["role"],
            "created_at": u["created_at"]
        }
        for u in recent
    ]
    
    return stats

@app.get("/admin/check-username/{username}")
async def check_username(
    username: str,
    admin: dict = Depends(verify_admin)
):
    """
    Vérifie si un nom d'utilisateur est disponible.
    """
    for user in users_db:
        if user["username"] == username:
            return {
                "username": username,
                "available": False,
                "message": "Nom d'utilisateur déjà pris"
            }
    
    return {
        "username": username,
        "available": True,
        "message": "Nom d'utilisateur disponible"
    }

@app.get("/admin/check-email/{email}")
async def check_email(
    email: str,
    admin: dict = Depends(verify_admin)
):
    """
    Vérifie si un email est disponible.
    """
    for user in users_db:
        if user["email"] == email:
            return {
                "email": email,
                "available": False,
                "message": "Email déjà utilisé"
            }
    
    return {
        "email": email,
        "available": True,
        "message": "Email disponible"
    }

# ============================================
# POUR EXÉCUTION DIRECTE (python main.py)
# ============================================

if __name__ == "__main__":
    import uvicorn
    print("🚀 Démarrage du service Admin sur http://localhost:8004")
    print("📚 Documentation disponible sur http://localhost:8004/docs")
    uvicorn.run(app, host="0.0.0.0", port=8004)
