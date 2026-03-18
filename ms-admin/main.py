"""
Microservice Admin - Gestion des utilisateurs
ENT EST Salé - 2026
Crée les users à la fois dans Keycloak ET dans Cassandra
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

# ============================================
# CONFIGURATION
# ============================================

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Service Administration - ENT EST Salé",
    description="Microservice gestion utilisateurs",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

AUTH_SERVICE_URL      = os.getenv("AUTH_SERVICE_URL",          "http://ms-auth:8000")
KEYCLOAK_URL          = os.getenv("KEYCLOAK_URL",              "http://keycloak:8080")
REALM                 = os.getenv("REALM",                     "ests-realm")
KEYCLOAK_ADMIN_USER   = os.getenv("KEYCLOAK_ADMIN",            "admin")
KEYCLOAK_ADMIN_PWD    = os.getenv("KEYCLOAK_ADMIN_PASSWORD",   "admin")


# ============================================
# KEYCLOAK HELPERS
# ============================================

async def get_keycloak_admin_token() -> str:
    """Obtenir un token admin Keycloak (realm master)"""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.post(
                f"{KEYCLOAK_URL}/realms/master/protocol/openid-connect/token",
                data={
                    "grant_type": "password",
                    "client_id":  "admin-cli",
                    "username":   KEYCLOAK_ADMIN_USER,
                    "password":   KEYCLOAK_ADMIN_PWD,
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            if r.status_code != 200:
                logger.error(f"Keycloak admin token error: {r.status_code} {r.text}")
                raise HTTPException(status_code=503, detail="Impossible d'obtenir le token admin Keycloak")
            return r.json()["access_token"]
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail="Keycloak inaccessible")


async def create_keycloak_user(username: str, email: str, full_name: str, password: str) -> str:
    """Créer un utilisateur dans Keycloak, retourne son ID Keycloak"""
    token = await get_keycloak_admin_token()
    parts = full_name.split(" ", 1)
    first = parts[0]
    last  = parts[1] if len(parts) > 1 else ""

    async with httpx.AsyncClient(timeout=10.0) as client:
        r = await client.post(
            f"{KEYCLOAK_URL}/admin/realms/{REALM}/users",
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
            json={
                "username":    username,
                "email":       email,
                "firstName":   first,
                "lastName":    last,
                "enabled":     True,
                "credentials": [{"type": "password", "value": password, "temporary": False}],
            },
        )

        if r.status_code == 409:
            raise HTTPException(status_code=400, detail="Cet utilisateur existe déjà dans Keycloak")

        if r.status_code not in (201, 200):
            logger.error(f"Keycloak create user error: {r.status_code} {r.text}")
            raise HTTPException(status_code=500, detail=f"Erreur Keycloak: {r.text}")

        # Récupérer l'ID Keycloak depuis le header Location
        location = r.headers.get("Location", "")
        kc_id = location.split("/")[-1] if location else ""
        logger.info(f"Utilisateur Keycloak créé: {username} (id={kc_id})")
        return kc_id


async def update_keycloak_user(username: str, updates: dict):
    """Mettre à jour un utilisateur dans Keycloak"""
    token = await get_keycloak_admin_token()

    # Trouver l'utilisateur par username
    async with httpx.AsyncClient(timeout=10.0) as client:
        r = await client.get(
            f"{KEYCLOAK_URL}/admin/realms/{REALM}/users",
            headers={"Authorization": f"Bearer {token}"},
            params={"username": username, "exact": True},
        )
        users = r.json()
        if not users:
            logger.warning(f"Utilisateur Keycloak introuvable: {username}")
            return

        kc_id = users[0]["id"]

        # Mettre à jour les infos de base
        patch = {}
        if "email" in updates:
            patch["email"] = updates["email"]
        if "full_name" in updates:
            parts = updates["full_name"].split(" ", 1)
            patch["firstName"] = parts[0]
            patch["lastName"]  = parts[1] if len(parts) > 1 else ""

        if patch:
            await client.put(
                f"{KEYCLOAK_URL}/admin/realms/{REALM}/users/{kc_id}",
                headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
                json=patch,
            )

        # Changer le mot de passe si fourni
        if "password" in updates and updates["password"]:
            await client.put(
                f"{KEYCLOAK_URL}/admin/realms/{REALM}/users/{kc_id}/reset-password",
                headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
                json={"type": "password", "value": updates["password"], "temporary": False},
            )

        logger.info(f"Utilisateur Keycloak mis à jour: {username}")


async def delete_keycloak_user(username: str):
    """Supprimer un utilisateur dans Keycloak"""
    try:
        token = await get_keycloak_admin_token()
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.get(
                f"{KEYCLOAK_URL}/admin/realms/{REALM}/users",
                headers={"Authorization": f"Bearer {token}"},
                params={"username": username, "exact": True},
            )
            users = r.json()
            if not users:
                logger.warning(f"Utilisateur Keycloak introuvable pour suppression: {username}")
                return

            kc_id = users[0]["id"]
            await client.delete(
                f"{KEYCLOAK_URL}/admin/realms/{REALM}/users/{kc_id}",
                headers={"Authorization": f"Bearer {token}"},
            )
            logger.info(f"Utilisateur Keycloak supprimé: {username}")
    except Exception as e:
        logger.error(f"Erreur suppression Keycloak {username}: {e}")


# ============================================
# AUTHENTIFICATION
# ============================================

async def verify_token(token: str) -> dict:
    clean_token = token.replace("Bearer ", "")
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(
                f"{AUTH_SERVICE_URL}/verify",
                headers={"Authorization": f"Bearer {clean_token}"}
            )
        if response.status_code == 200:
            return response.json()
    except Exception as e:
        logger.error(f"Erreur appel Auth Service: {e}")
    raise HTTPException(status_code=401, detail="Token invalide ou expiré")


async def verify_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    token = credentials.credentials
    user  = await verify_token(token)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Accès réservé aux administrateurs")
    return user


# ============================================
# ROUTES SYSTÈME
# ============================================

@app.get("/")
async def root():
    return {
        "service":   "Admin Microservice",
        "status":    "running",
        "version":   "2.0",
        "timestamp": str(datetime.datetime.now()),
    }


@app.get("/health")
async def health():
    try:
        users = cassandra_db.get_all_users()
        return {
            "status":      "healthy",
            "database":    "connected",
            "users_count": len(users),
            "timestamp":   str(datetime.datetime.now()),
        }
    except Exception as e:
        return {"status": "error", "database": "disconnected", "error": str(e)}


# ============================================
# ROUTES ADMIN
# ============================================

@app.get("/admin/users", response_model=List[UserResponse])
async def get_users(
    role:  Optional[str] = Query(None),
    admin: dict          = Depends(verify_admin),
):
    logger.info(f"Liste utilisateurs demandée par {admin.get('preferred_username')}")
    users = cassandra_db.get_all_users(role=role)
    return [u.to_response() for u in users]


@app.get("/admin/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: str, admin: dict = Depends(verify_admin)):
    user = cassandra_db.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return user.to_response()


@app.post("/admin/users", response_model=UserResponse)
async def create_user(user: UserCreate, admin: dict = Depends(verify_admin)):
    """
    Crée l'utilisateur dans Keycloak (avec password) ET dans Cassandra (sans password)
    """
    # Vérifier unicité dans Cassandra
    if cassandra_db.user_exists(username=user.username):
        raise HTTPException(status_code=400, detail="Username déjà utilisé")
    if cassandra_db.user_exists(email=user.email):
        raise HTTPException(status_code=400, detail="Email déjà utilisé")

    # 1. Créer dans Keycloak
    await create_keycloak_user(
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        password=user.password,
    )

    # 2. Créer dans Cassandra
    new_user = cassandra_db.create_user(user)
    logger.info(f"Utilisateur créé: {user.username} ({user.role})")
    return new_user.to_response()


@app.put("/admin/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id:     str,
    user_update: UserUpdate,
    admin:       dict = Depends(verify_admin),
):
    existing = cassandra_db.get_user_by_id(user_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    # 1. Mettre à jour dans Keycloak
    updates = {}
    if user_update.email:
        updates["email"] = user_update.email
    if user_update.full_name:
        updates["full_name"] = user_update.full_name
    if user_update.password:
        updates["password"] = user_update.password

    if updates:
        await update_keycloak_user(existing.username, updates)

    # 2. Mettre à jour dans Cassandra
    success = cassandra_db.update_user(user_id, user_update)
    if not success:
        raise HTTPException(status_code=500, detail="Erreur mise à jour Cassandra")

    updated = cassandra_db.get_user_by_id(user_id)
    return updated.to_response()


@app.delete("/admin/users/{user_id}")
async def delete_user(user_id: str, admin: dict = Depends(verify_admin)):
    existing = cassandra_db.get_user_by_id(user_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    # 1. Supprimer dans Keycloak
    await delete_keycloak_user(existing.username)

    # 2. Supprimer dans Cassandra
    cassandra_db.delete_user(user_id)
    logger.info(f"Utilisateur supprimé: {existing.username}")
    return {"message": "Utilisateur supprimé"}


# ============================================
# STATISTIQUES
# ============================================

@app.get("/admin/stats")
async def get_stats(admin: dict = Depends(verify_admin)):
    return cassandra_db.get_stats()


# ============================================
# SHUTDOWN
# ============================================

@app.on_event("shutdown")
def shutdown_event():
    cassandra_db.close()
    logger.info("Service Admin arrêté")


# ============================================
# EXÉCUTION
# ============================================
@app.get("/admin/users/by-username/{username}")
async def get_user_by_username_public(username: str):
    """
    Route publique — utilisée par ms-auth pour récupérer le rôle réel.
    Pas de vérification admin requise (appelée en interne entre microservices).
    """
    user = cassandra_db.get_user_by_username(username)
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return {
        "username": user.username,
        "role":     user.role,
        "email":    user.email,
    }

if __name__ == "__main__":
    import uvicorn
    print("Admin service running on http://localhost:8004")
    uvicorn.run(app, host="0.0.0.0", port=8004)

