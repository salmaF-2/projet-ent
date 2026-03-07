"""
Microservice Admin (M4) - Gestion des utilisateurs avec Cassandra
Date: 2026
"""

from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
import httpx
import datetime
import os
from typing import Optional, List
import logging

from app.models.user import UserCreate, UserUpdate, UserResponse
from app.db.cassandra_client import cassandra_db

# Configuration logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialisation de l'application
app = FastAPI(
    title="Service Administration - ENT EST Salé",
    description="Microservice pour la gestion des utilisateurs (M4) avec Cassandra",
    version="2.0.0",
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
        "service": "Administration (M4) avec Cassandra",
        "version": "2.0.0",
        "status": "running",
        "description": "Gestion des utilisateurs de l'ENT avec base de données Cassandra",
        "database": "connected",
        "endpoints": {
            "GET /health": "Vérification de santé",
            "GET /admin/users": "Liste tous les utilisateurs",
            "GET /admin/users/{user_id}": "Détail d'un utilisateur",
            "POST /admin/users": "Crée un utilisateur",
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
    try:
        # Vérifier la connexion Cassandra
        users_count = len(cassandra_db.get_all_users())
        return {
            "status": "healthy",
            "service": "admin",
            "database": "connected",
            "users_count": users_count,
            "timestamp": str(datetime.datetime.now())
        }
    except Exception as e:
        return {
            "status": "degraded",
            "service": "admin",
            "database": "disconnected",
            "error": str(e),
            "timestamp": str(datetime.datetime.now())
        }

# ============================================
# ROUTES D'ADMINISTRATION
# ============================================

@app.get("/admin/users", response_model=List[UserResponse])
async def get_users(
    role: Optional[str] = Query(None, regex="^(admin|teacher|student)$"),
    admin: dict = Depends(verify_admin)
):
    """
    Récupère la liste des utilisateurs.
    Option: filtrer par rôle (admin/teacher/student)
    """
    logger.info(f"Liste des utilisateurs demandée par {admin['username']}")
    
    users = cassandra_db.get_all_users(role=role)
    return [user.to_response() for user in users]

@app.get("/admin/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    admin: dict = Depends(verify_admin)
):
    """
    Récupère les détails d'un utilisateur spécifique.
    """
    logger.info(f"Détail utilisateur {user_id} demandé par {admin['username']}")
    
    user = cassandra_db.get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail=f"Utilisateur avec ID {user_id} non trouvé"
        )
    
    return user.to_response()

@app.post("/admin/users", response_model=UserResponse, status_code=201)
async def create_user(
    user_data: UserCreate,
    admin: dict = Depends(verify_admin)
):
    """
    Crée un nouvel utilisateur.
    """
    logger.info(f"Tentative de création utilisateur {user_data.username} par {admin['username']}")
    
    # Vérifier si l'utilisateur existe déjà
    if cassandra_db.user_exists(username=user_data.username):
        raise HTTPException(
            status_code=400,
            detail=f"Le nom d'utilisateur '{user_data.username}' est déjà pris"
        )
    
    if cassandra_db.user_exists(email=user_data.email):
        raise HTTPException(
            status_code=400,
            detail=f"L'email '{user_data.email}' est déjà utilisé"
        )
    
    # Créer l'utilisateur
    new_user = cassandra_db.create_user(user_data)
    logger.info(f"Utilisateur {user_data.username} créé avec ID {new_user.user_id}")
    
    return new_user.to_response()

@app.put("/admin/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_update: UserUpdate,
    admin: dict = Depends(verify_admin)
):
    """
    Met à jour un utilisateur existant.
    """
    logger.info(f"Mise à jour utilisateur {user_id} par {admin['username']}")
    
    # Vérifier si l'utilisateur existe
    existing_user = cassandra_db.get_user_by_id(user_id)
    if not existing_user:
        raise HTTPException(
            status_code=404,
            detail=f"Utilisateur avec ID {user_id} non trouvé"
        )
    
    # Vérifier l'unicité de l'email si modifié
    if user_update.email and user_update.email != existing_user.email:
        user_with_email = cassandra_db.get_user_by_email(user_update.email)
        if user_with_email and str(user_with_email.user_id) != user_id:
            raise HTTPException(
                status_code=400,
                detail=f"L'email '{user_update.email}' est déjà utilisé"
            )
    
    # Mettre à jour
    success = cassandra_db.update_user(user_id, user_update)
    
    if not success:
        raise HTTPException(
            status_code=500,
            detail="Erreur lors de la mise à jour"
        )
    
    # Récupérer l'utilisateur mis à jour
    updated_user = cassandra_db.get_user_by_id(user_id)
    return updated_user.to_response()

@app.delete("/admin/users/{user_id}", status_code=204)
async def delete_user(
    user_id: str,
    admin: dict = Depends(verify_admin)
):
    """
    Supprime un utilisateur.
    Un admin ne peut pas supprimer son propre compte.
    """
    logger.info(f"Tentative de suppression utilisateur {user_id} par {admin['username']}")
    
    # Vérifier si l'utilisateur existe
    existing_user = cassandra_db.get_user_by_id(user_id)
    if not existing_user:
        raise HTTPException(
            status_code=404,
            detail=f"Utilisateur avec ID {user_id} non trouvé"
        )
    
    # Empêcher la suppression de soi-même
    if user_id == admin.get("user_id"):
        raise HTTPException(
            status_code=400,
            detail="Vous ne pouvez pas supprimer votre propre compte"
        )
    
    # Supprimer l'utilisateur
    success = cassandra_db.delete_user(user_id)
    
    if not success:
        raise HTTPException(
            status_code=500,
            detail="Erreur lors de la suppression"
        )
    
    logger.info(f"Utilisateur {existing_user.username} supprimé")
    return None  # 204 No Content

@app.get("/admin/stats")
async def get_stats(admin: dict = Depends(verify_admin)):
    """
    Statistiques sur les utilisateurs.
    """
    logger.info(f"Statistiques demandées par {admin['username']}")
    
    return cassandra_db.get_stats()

@app.get("/admin/check-username/{username}")
async def check_username(
    username: str,
    admin: dict = Depends(verify_admin)
):
    """
    Vérifie si un nom d'utilisateur est disponible.
    """
    user = cassandra_db.get_user_by_username(username)
    
    return {
        "username": username,
        "available": user is None,
        "message": "Nom d'utilisateur disponible" if user is None else "Nom d'utilisateur déjà pris"
    }

@app.get("/admin/check-email/{email}")
async def check_email(
    email: str,
    admin: dict = Depends(verify_admin)
):
    """
    Vérifie si un email est disponible.
    """
    user = cassandra_db.get_user_by_email(email)
    
    return {
        "email": email,
        "available": user is None,
        "message": "Email disponible" if user is None else "Email déjà utilisé"
    }

@app.on_event("shutdown")
def shutdown_event():
    """Ferme la connexion Cassandra à l'arrêt"""
    cassandra_db.close()
    logger.info("Service admin arrêté")

# ============================================
# POUR EXÉCUTION DIRECTE (python main.py)
# ============================================

if __name__ == "__main__":
    import uvicorn
    print("🚀 Démarrage du service Admin avec Cassandra sur http://localhost:8004")
    print("📚 Documentation disponible sur http://localhost:8004/docs")
    uvicorn.run(app, host="0.0.0.0", port=8004)
