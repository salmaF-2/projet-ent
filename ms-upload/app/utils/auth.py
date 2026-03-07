from fastapi import HTTPException, Header, Depends
import logging
from typing import Optional

logger = logging.getLogger(__name__)

MOCK_TOKENS = {
    "admin-token": {"user_id": "1", "username": "admin", "role": "admin"},
    "teacher-token": {"user_id": "2", "username": "teacher", "role": "teacher"},
    "student-token": {"user_id": "3", "username": "student", "role": "student"}
}

async def verify_token(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Token manquant")
    
    clean_token = authorization.replace("Bearer ", "")
    
    if clean_token in MOCK_TOKENS:
        return MOCK_TOKENS[clean_token]
    
    raise HTTPException(status_code=401, detail="Token invalide")

async def verify_teacher(token_info: dict = Depends(verify_token)):
    if token_info.get("role") != "teacher":
        raise HTTPException(status_code=403, detail="Réservé aux enseignants")
    return token_info
