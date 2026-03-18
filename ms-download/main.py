from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from cassandra.cluster import Cluster
from minio import Minio
from datetime import timedelta
import httpx
import uuid
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Download Service (M3)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://ms-auth:8000")
CASSANDRA_HOST   = os.getenv("CASSANDRA_HOST",   "ent-cassandra")
MINIO_ENDPOINT   = os.getenv("MINIO_ENDPOINT",   "ent-minio:9000")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY", "minioadmin123")

# ── IP publique pour les URLs presigned accessibles depuis le navigateur ──
# Doit être l'IP/host accessible par le navigateur client, PAS le hostname Docker
MINIO_PUBLIC_ENDPOINT = os.getenv("MINIO_PUBLIC_ENDPOINT", "192.168.11.123:9000")

try:
    cluster = Cluster([CASSANDRA_HOST])
    session = cluster.connect('ent')
    logger.info(f"Connected to Cassandra at {CASSANDRA_HOST}")
except Exception as e:
    logger.error(f"Failed to connect to Cassandra: {e}")
    raise

# Client MinIO interne (pour les opérations serveur-à-serveur)
try:
    minio_internal = Minio(
        MINIO_ENDPOINT,
        access_key=MINIO_ACCESS_KEY,
        secret_key=MINIO_SECRET_KEY,
        secure=False
    )
    logger.info(f"Connected to MinIO at {MINIO_ENDPOINT}")
except Exception as e:
    logger.error(f"Failed to connect to MinIO: {e}")
    raise

# Client MinIO public (pour générer les URLs presigned avec l'IP publique)
minio_public = Minio(
    MINIO_PUBLIC_ENDPOINT,
    access_key=MINIO_ACCESS_KEY,
    secret_key=MINIO_SECRET_KEY,
    secure=False
)

async def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Token manquant")
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(
                f"{AUTH_SERVICE_URL}/verify",
                headers={"Authorization": authorization}
            )
            if response.status_code == 200:
                user_info = response.json()
                logger.info(f"User authenticated: {user_info.get('preferred_username')}")
                return user_info
            raise HTTPException(status_code=401, detail="Token invalide")
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail="Service d'authentification indisponible")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail="Auth service unreachable")

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "download"}

@app.get("/")
async def root():
    return {"service": "Download (M3)"}

@app.get("/cours")
async def get_courses(user: dict = Depends(get_current_user)):
    try:
        rows = session.execute(
            "SELECT course_id, title, description, file_name, teacher_name FROM courses"
        )
        return [{
            "id":          str(row.course_id),
            "title":       row.title,
            "description": row.description,
            "file_name":   row.file_name,
            "teacher":     row.teacher_name
        } for row in rows]
    except Exception as e:
        logger.error(f"Error fetching courses: {e}")
        raise HTTPException(status_code=500, detail="Error fetching courses")

@app.get("/cours/{course_id}")
async def get_course_details(course_id: str, user: dict = Depends(get_current_user)):
    try:
        result = session.execute(
            "SELECT course_id, title, description, file_name, teacher_name, created_at FROM courses WHERE course_id = %s",
            [uuid.UUID(course_id)]
        ).one()
        if not result:
            raise HTTPException(status_code=404, detail="Course not found")
        return {
            "id":          str(result.course_id),
            "title":       result.title,
            "description": result.description,
            "file_name":   result.file_name,
            "teacher":     result.teacher_name,
            "created_at":  str(result.created_at) if result.created_at else None
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error fetching course")

@app.get("/cours/{course_id}/download")
async def get_download_link(course_id: str, user: dict = Depends(get_current_user)):
    try:
        result = session.execute(
            "SELECT file_name, file_url FROM courses WHERE course_id = %s",
            [uuid.UUID(course_id)]
        ).one()
        if not result:
            raise HTTPException(status_code=404, detail="Course not found")

        object_name = result.file_url.split('/')[-1] if result.file_url else result.file_name

        # Générer l'URL presigned avec le client PUBLIC
        # → la signature sera calculée avec 192.168.11.123:9000
        # → le navigateur peut accéder directement à cette URL
        url = minio_public.presigned_get_object(
            "cours",
            object_name,
            expires=timedelta(minutes=10)
        )

        logger.info(f"Download link generated for {course_id} by {user.get('preferred_username')}")

        return {
            "download_url": url,
            "expires_in":   "10 minutes",
            "file_name":    result.file_name,
            "course_id":    course_id,
            "requested_by": user.get('preferred_username')
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating download link for {course_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
