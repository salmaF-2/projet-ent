from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from cassandra.cluster import Cluster
from pydantic import BaseModel
import httpx, uuid, os, logging, datetime, time

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Messages Service - ENT EST Salé")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://ms-auth:8000")
ADMIN_SERVICE_URL = os.getenv("ADMIN_SERVICE_URL", "http://ms-admin:8000")
CASSANDRA_HOST   = os.getenv("CASSANDRA_HOST",    "ent-cassandra")

# ── Connexion Cassandra avec retry ──
def connect_cassandra():
    for i in range(15):
        try:
            cluster = Cluster([CASSANDRA_HOST], connect_timeout=10)
            session = cluster.connect()
            session.execute("""
                CREATE KEYSPACE IF NOT EXISTS ent
                WITH replication = {'class': 'SimpleStrategy', 'replication_factor': '1'}
            """)
            session.set_keyspace('ent')
            session.execute("""
                CREATE TABLE IF NOT EXISTS messages (
                    message_id  uuid PRIMARY KEY,
                    sender      text,
                    receiver    text,
                    subject     text,
                    body        text,
                    created_at  timestamp,
                    is_read     boolean
                )
            """)
            session.execute("CREATE INDEX IF NOT EXISTS ON messages (receiver)")
            session.execute("CREATE INDEX IF NOT EXISTS ON messages (sender)")
            logger.info("Cassandra connecté et table messages prête")
            return session
        except Exception as e:
            logger.warning(f"Cassandra tentative {i+1}/15: {e}")
            time.sleep(4)
    raise RuntimeError("Cassandra inaccessible")

session = connect_cassandra()

# ── Modèles ──
class MessageCreate(BaseModel):
    receiver: str
    subject:  str
    body:     str

# ── Auth ──
async def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Token manquant")
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.get(f"{AUTH_SERVICE_URL}/verify", headers={"Authorization": authorization})
            if r.status_code == 200:
                return r.json()
        raise HTTPException(status_code=401, detail="Token invalide")
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail="Auth indisponible")

# ── Routes ──
@app.get("/health")
async def health():
    return {"status": "healthy", "service": "messages"}

@app.get("/messages/users")
async def get_users(user: dict = Depends(get_current_user)):
    """Liste des utilisateurs disponibles — via route interne ms-admin"""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.get(f"{ADMIN_SERVICE_URL}/internal/users")
            if r.status_code == 200:
                return [
                    {
                        "username":  u["username"],
                        "full_name": u.get("full_name", u["username"]),
                        "role":      u["role"],
                    }
                    for u in r.json()
                    if u["username"] != user.get("preferred_username")
                ]
    except Exception as e:
        logger.error(f"Erreur récupération users: {e}")
    return []

@app.get("/messages/inbox")
async def get_inbox(user: dict = Depends(get_current_user)):
    """Messages reçus par l'utilisateur connecté"""
    username = user.get("preferred_username")
    try:
        rows = session.execute(
            "SELECT message_id, sender, receiver, subject, body, created_at, is_read FROM messages WHERE receiver = %s",
            [username]
        )
        msgs = [{
            "id":         str(r.message_id),
            "sender":     r.sender,
            "receiver":   r.receiver,
            "subject":    r.subject,
            "body":       r.body,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "is_read":    r.is_read,
        } for r in rows]
        return sorted(msgs, key=lambda x: x["created_at"] or "", reverse=True)
    except Exception as e:
        logger.error(f"Erreur inbox: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/messages/sent")
async def get_sent(user: dict = Depends(get_current_user)):
    """Messages envoyés par l'utilisateur connecté"""
    username = user.get("preferred_username")
    try:
        rows = session.execute(
            "SELECT message_id, sender, receiver, subject, body, created_at, is_read FROM messages WHERE sender = %s",
            [username]
        )
        msgs = [{
            "id":         str(r.message_id),
            "sender":     r.sender,
            "receiver":   r.receiver,
            "subject":    r.subject,
            "body":       r.body,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "is_read":    r.is_read,
        } for r in rows]
        return sorted(msgs, key=lambda x: x["created_at"] or "", reverse=True)
    except Exception as e:
        logger.error(f"Erreur sent: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/messages/send")
async def send_message(msg: MessageCreate, user: dict = Depends(get_current_user)):
    """Envoyer un message"""
    sender = user.get("preferred_username")
    try:
        message_id = uuid.uuid4()
        session.execute(
            "INSERT INTO messages (message_id, sender, receiver, subject, body, created_at, is_read) VALUES (%s, %s, %s, %s, %s, %s, %s)",
            [message_id, sender, msg.receiver, msg.subject, msg.body, datetime.datetime.utcnow(), False]
        )
        logger.info(f"Message envoyé de {sender} à {msg.receiver}")
        return {"id": str(message_id), "status": "sent"}
    except Exception as e:
        logger.error(f"Erreur send: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/messages/{message_id}/read")
async def mark_read(message_id: str, user: dict = Depends(get_current_user)):
    """Marquer un message comme lu"""
    try:
        session.execute(
            "UPDATE messages SET is_read = true WHERE message_id = %s",
            [uuid.UUID(message_id)]
        )
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/messages/{message_id}")
async def delete_message(message_id: str, user: dict = Depends(get_current_user)):
    """Supprimer un message"""
    try:
        session.execute("DELETE FROM messages WHERE message_id = %s", [uuid.UUID(message_id)])
        return {"status": "deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
