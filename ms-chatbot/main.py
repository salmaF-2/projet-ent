"""
Microservice Chatbot (M4) - Interface avec Ollama
Routes publiques et privées
Date: 2026
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
import datetime
import os

from app.routes import chat

# ============================================
# Configuration logging
# ============================================

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# ============================================
# Initialisation de l'application
# ============================================

app = FastAPI(
    title="Service Chatbot - ENT EST Salé",
    description="Microservice pour le chatbot IA avec Ollama (M4)",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# ============================================
# Configuration CORS
# ============================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://192.168.1.11:3000",
        "http://192.168.11.119:3000",
        "http://192.168.11.123:3000",
        "http://172.18.0.9:3000",
        "*"  # Pour développement
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# Inclusion des routes
# ============================================

app.include_router(chat.router)

# ============================================
# Routes principales
# ============================================

@app.get("/")
async def root():
    auth_service = os.getenv("AUTH_SERVICE_URL", "http://ms-auth:8000")
    return {
        "service": "Chatbot (M4) avec Ollama",
        "version": "2.0.0",
        "status": "running",
        "auth_service": auth_service,
        "description": "Interface de chat IA avec routes publiques et privées",
        "documentation": "/docs",
        "timestamp": str(datetime.datetime.now())
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "chatbot",
        "timestamp": str(datetime.datetime.now())
    }

# ============================================
# Événement de démarrage
# ============================================

@app.on_event("startup")
async def startup_event():
    logger.info("Démarrage du service Chatbot")
    
    # Vérifier connexion à Ollama
    try:
        from app.utils.ollama_client import check_ollama_health
        if await check_ollama_health():
            logger.info("Connexion à Ollama établie")
        else:
            logger.warning("Ollama non accessible au démarrage")
    except Exception as e:
        logger.warning(f"Erreur vérification Ollama: {e}")

    # Vérifier connexion à Auth service
    try:
        import httpx  # ← AJOUTEZ CETTE LIGNE
        auth_service = os.getenv("AUTH_SERVICE_URL", "http://ms-auth:8001")
        async with httpx.AsyncClient(timeout=2.0) as client:
            response = await client.get(f"{auth_service}/health")
            if response.status_code == 200:
                logger.info(f"Connexion à Auth service établie sur {auth_service}")
            else:
                logger.warning(f"Auth service répond mais status: {response.status_code}")
    except Exception as e:
        logger.warning(f"Auth service non accessible au démarrage: {e}")

# ============================================
# Exécution directe
# ============================================

if __name__ == "__main__":
    import uvicorn

    print("Démarrage du service Chatbot sur http://localhost:8005")
    print("Documentation disponible sur http://localhost:8005/docs")

    uvicorn.run(app, host="0.0.0.0", port=8005)
