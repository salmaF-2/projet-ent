from fastapi import FastAPI, Depends, HTTPException, status, Header
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os
import base64
import json

app = FastAPI(title="ENT-ESTS Auth Microservice")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

KEYCLOAK_URL      = os.getenv("KEYCLOAK_URL",      "http://keycloak:8080")
REALM             = os.getenv("REALM",             "ests-realm")
CLIENT_ID         = os.getenv("CLIENT_ID",         "ent-client")
CLIENT_SECRET     = os.getenv("CLIENT_SECRET",     "votre-secret-client")
ADMIN_SERVICE_URL = os.getenv("ADMIN_SERVICE_URL", "http://ms-admin:8000")


@app.get("/")
def home():
    return {"message": "Auth microservice running", "realm": REALM}


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    token_url = f"{KEYCLOAK_URL}/realms/{REALM}/protocol/openid-connect/token"
    data = {
        "grant_type":    "password",
        "client_id":     CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "username":      form_data.username,
        "password":      form_data.password,
    }
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(token_url, data=data)
            print(f"Keycloak response status: {response.status_code}")
            if response.status_code == 200:
                return response.json()
            else:
                print(f"Keycloak error: {response.text}")
    except Exception as e:
        print(f"Exception: {e}")
        raise HTTPException(status_code=503, detail="Keycloak server not reachable")

    raise HTTPException(status_code=401, detail="Invalid credentials")


async def get_role_from_cassandra(username: str) -> str:
    """
    Récupère le rôle réel depuis ms-admin (Cassandra).
    Ne se base PAS sur le username — utilise le champ 'role' stocké en BDD.
    Fallback : student
    """
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            r = await client.get(
                f"{ADMIN_SERVICE_URL}/admin/users/by-username/{username}"
            )
            if r.status_code == 200:
                role = r.json().get("role", "student")
                print(f"Rôle Cassandra pour '{username}': {role}")
                return role
            else:
                print(f"Utilisateur '{username}' absent de Cassandra, fallback student")
    except Exception as e:
        print(f"Erreur récupération rôle depuis ms-admin: {e}")
    return "student"


@app.get("/verify")
async def verify_token(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Token manquant")

    token = authorization.replace("Bearer ", "")

    try:
        parts = token.split('.')
        if len(parts) != 3:
            raise HTTPException(status_code=401, detail="Token invalide")

        payload_b64 = parts[1]
        payload_b64 += '=' * (4 - len(payload_b64) % 4)
        payload_json = base64.urlsafe_b64decode(payload_b64).decode('utf-8')
        decoded = json.loads(payload_json)

        username = decoded.get("preferred_username", "unknown")

        # Récupérer le vrai rôle depuis Cassandra (basé sur le champ role, pas le username)
        role = await get_role_from_cassandra(username)

        print(f"Token vérifié: {username} ({role})")

        return {
            "sub":                decoded.get("sub"),
            "preferred_username": username,
            "email":              decoded.get("email", ""),
            "role":               role
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Erreur décodage: {e}")
        raise HTTPException(status_code=401, detail="Token invalide")
