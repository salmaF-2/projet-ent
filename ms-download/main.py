from fastapi import FastAPI, HTTPException, Header, Depends
from cassandra.cluster import Cluster
from minio import Minio
from datetime import timedelta
import httpx
import uuid
import os

app = FastAPI()

# --- Configuration for Auth Service ---
# Use the teammate's service name or 127.0.0.1 if running on host network
AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://127.0.0.1:8001") 

# --- Infrastructure Connections ---
cluster = Cluster(['127.0.0.1'])
session = cluster.connect('ent')

minio_client = Minio(
    "127.0.0.1:9000",
    access_key="minioadmin",
    secret_key="minioadmin123",
    secure=False
)

# --- Internal Helper: Verify Token with Teammate's Service ---
async def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Token manquant")
    
    try:
        async with httpx.AsyncClient() as client:
            # We call your teammate's /verify endpoint
            response = await client.get(
                f"{AUTH_SERVICE_URL}/verify", 
                headers={"Authorization": authorization}
            )
            
            if response.status_code == 200:
                return response.json() # Returns user_id, username, role
            else:
                raise HTTPException(status_code=401, detail="Token invalide")
    except Exception:
        raise HTTPException(status_code=503, detail="Auth service unreachable")

# --- Updated API Endpoints ---

@app.get("/courses")
async def get_courses(user: dict = Depends(get_current_user)):
    """Only authenticated users can see this now."""
    rows = session.execute("SELECT course_id, title FROM courses")
    return [{"id": str(r.course_id), "title": r.title} for r in rows]

@app.get("/courses/{course_id}/download")
async def get_download_link(course_id: str, user: dict = Depends(get_current_user)):
    """Only authenticated users can download."""
    try:
        query = "SELECT file_name FROM courses WHERE course_id = %s"
        result = session.execute(query, [uuid.UUID(course_id)]).one()
        
        if not result:
            raise HTTPException(status_code=404, detail="Course not found")

        url = minio_client.get_presigned_url(
            "GET", "cours", result.file_name, expires=timedelta(minutes=10)
        )
        return {"download_url": url, "requested_by": user['username']}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))