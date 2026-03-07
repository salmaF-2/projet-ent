from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
import httpx

app = FastAPI(title="ENT-ESTS Auth Microservice")

KEYCLOAK_URL = "http://localhost:8080"
REALM = "ests-realm"
CLIENT_ID = "ent-client"

@app.get("/")
def home():
    return {"message": "Auth microservice running with Keycloak"}

@app.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    token_url = (
        f"{KEYCLOAK_URL}/realms/{REALM}"
        f"/protocol/openid-connect/token"
    )

    data = {
        "grant_type": "password",
        "client_id": CLIENT_ID,
        "username": form_data.username,
        "password": form_data.password,
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(token_url, data=data)
    except Exception:
        raise HTTPException(
            status_code=503,
            detail="Keycloak server not reachable"
        )

    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    return response.json()
