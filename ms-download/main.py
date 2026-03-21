from fastapi import FastAPI, HTTPException, Header, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from cassandra.cluster import Cluster
from minio import Minio
from datetime import timedelta
import httpx
import uuid
import os
import socket
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
MINIO_PORT       = os.getenv("MINIO_PORT",       "9000")

try:
    cluster = Cluster([CASSANDRA_HOST])
    session = cluster.connect('ent')
    logger.info(f"Connected to Cassandra at {CASSANDRA_HOST}")
except Exception as e:
    logger.error(f"Failed to connect to Cassandra: {e}")
    raise

minio_internal = Minio(
    MINIO_ENDPOINT,
    access_key=MINIO_ACCESS_KEY,
    secret_key=MINIO_SECRET_KEY,
    secure=False
)
logger.info(f"Connected to MinIO at {MINIO_ENDPOINT}")


def get_server_ip(request: Request) -> str:
    """
    Récupère l'IP du SERVEUR telle que vue par le navigateur.
    Le navigateur appelle http://192.168.11.123:8003
    → header Host = "192.168.11.123:8003"
    → on extrait "192.168.11.123"
    Fonctionne quelle que soit l'IP de la VM.
    """
    # 1. Header Host — c'est l'IP que le navigateur a utilisée pour joindre ce service
    host = request.headers.get("host", "")
    if host:
        server_ip = host.split(":")[0]
        if server_ip and server_ip not in ("localhost", "127.0.0.1", "::1"):
            logger.info(f"Server IP from Host header: {server_ip}")
            return server_ip

    # 2. Variable d'environnement explicite (priorité si définie)
    env_ip = os.getenv("MINIO_PUBLIC_IP", "")
    if env_ip:
        logger.info(f"Server IP from env MINIO_PUBLIC_IP: {env_ip}")
        return env_ip

    # 3. Détecter l'IP réseau de la machine automatiquement
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        logger.info(f"Server IP from socket: {ip}")
        return ip
    except Exception:
        pass

    # 4. Dernier recours
    try:
        return socket.gethostbyname(socket.gethostname())
    except Exception:
        return "localhost"


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
    except Exception:
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
            "SELECT course_id, title, description, file_name, teacher_name, created_at FROM courses"
        )
        return [{
            "id":          str(row.course_id),
            "title":       row.title,
            "description": row.description,
            "file_name":   row.file_name,
            "teacher":     row.teacher_name,
            "created_at":  str(row.created_at) if row.created_at else None,
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
            "created_at":  str(result.created_at) if result.created_at else None,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error fetching course")


@app.get("/cours/{course_id}/download")
async def get_download_link(
    course_id: str,
    request:   Request,
    user:      dict = Depends(get_current_user)
):
    try:
        result = session.execute(
            "SELECT file_name, file_url FROM courses WHERE course_id = %s",
            [uuid.UUID(course_id)]
        ).one()
        if not result:
            raise HTTPException(status_code=404, detail="Course not found")

        object_name = result.file_url.split('/')[-1] if result.file_url else result.file_name

        # Détecter l'IP du SERVEUR depuis le header Host de la requête
        server_ip       = get_server_ip(request)
        public_endpoint = f"{server_ip}:{MINIO_PORT}"

        logger.info(f"Generating presigned URL → public endpoint: {public_endpoint}")

        # Client MinIO avec l'IP publique détectée dynamiquement
        minio_public = Minio(
            public_endpoint,
            access_key=MINIO_ACCESS_KEY,
            secret_key=MINIO_SECRET_KEY,
            secure=False
        )

        url = minio_public.presigned_get_object(
            "cours",
            object_name,
            expires=timedelta(minutes=10)
        )

        logger.info(f"Download link for {course_id} by {user.get('preferred_username')}: {url[:60]}...")

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
