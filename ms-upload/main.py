"""
Microservice Upload (M2) - Gestion des cours
Stockage des fichiers dans MinIO et métadonnées dans Cassandra
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
import datetime

from app.routes import upload

# Configuration logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialisation de l'application
app = FastAPI(
    title="Service Upload - ENT EST Salé",
    description="Microservice pour l'upload de cours (M2) avec MinIO et Cassandra",
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

# Inclusion des routes
app.include_router(upload.router)

@app.get("/")
async def root():
    """Route racine - informations sur le service"""
    return {
        "service": "Upload (M2)",
        "version": "1.0.0",
        "status": "running",
        "description": "Service d'upload de cours avec MinIO et Cassandra",
        "endpoints": {
            "POST /cours": "Upload un nouveau cours (enseignant)",
            "GET /cours/teacher": "Liste des cours de l'enseignant",
            "GET /cours/all": "Liste de tous les cours",
            "DELETE /cours/{course_id}": "Supprime un cours",
            "GET /cours/health": "Health check"
        },
        "documentation": "/docs",
        "timestamp": str(datetime.datetime.now())
    }

@app.get("/health")
async def health():
    """Health check simple"""
    return {
        "status": "healthy",
        "service": "upload",
        "timestamp": str(datetime.datetime.now())
    }

@app.on_event("startup")
async def startup_event():
    """Actions au démarrage"""
    logger.info("🚀 Démarrage du service Upload")
    
    # Vérifier les connexions
    try:
        from app.utils.cassandra_client import cassandra_db
        from app.utils.minio_client import minio_client
        logger.info("✅ Connexions établies avec Cassandra et MinIO")
    except Exception as e:
        logger.error(f"❌ Erreur de connexion: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    """Actions à l'arrêt"""
    logger.info("🛑 Arrêt du service Upload")
    from app.utils.cassandra_client import cassandra_db
    cassandra_db.close()

if __name__ == "__main__":
    import uvicorn
    print("🚀 Démarrage du service Upload sur http://localhost:8002")
    print("📚 Documentation disponible sur http://localhost:8002/docs")
    uvicorn.run(app, host="0.0.0.0", port=8002)
