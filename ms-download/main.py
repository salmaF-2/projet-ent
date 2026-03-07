from fastapi import FastAPI, HTTPException, Header
from cassandra.cluster import Cluster
from minio import Minio
from datetime import timedelta
import uuid

app = FastAPI()

# --- Infrastructure Connections ---
cluster = Cluster(['127.0.0.1'])
session = cluster.connect('university')

minio_client = Minio(
    "127.0.0.1:9000",
    access_key="minioadmin", # Your working key
    secret_key="minioadmin", # Your working secret
    secure=False
)

# --- The "API" Endpoints ---

@app.get("/courses")
def get_courses(authorization: str = Header(None)):
    """The Frontend calls this to show the list of courses."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing JWT Token")
    
    rows = session.execute("SELECT course_id, title FROM courses")
    return [{"id": str(r.course_id), "title": r.title} for r in rows]

@app.get("/courses/{course_id}/download")
def get_download_link(course_id: str):
    """The Frontend calls this when a student clicks 'Download'."""
    try:
        # 1. Get metadata from Cassandra
        query = "SELECT minio_bucket, filename FROM courses WHERE course_id = %s"
        result = session.execute(query, [uuid.UUID(course_id)]).one()
        
        if not result:
            raise HTTPException(status_code=404, detail="Course not found")

        # 2. Generate the secure link from MinIO
        url = minio_client.get_presigned_url(
            "GET", result.minio_bucket, result.filename, expires=timedelta(minutes=10)
        )
        return {"download_url": url}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
