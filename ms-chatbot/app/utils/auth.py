"""
Authentification pour le chatbot
Version MOCK (en attendant M1)
"""
from fastapi import HTTPException, Header
from typing import Optional
import logging

logger = logging.getLogger(__name__)

# Tokens factices pour le développement
MOCK_TOKENS = {
    "admin-token": {
        "user_id": "1",
        "username": "admin",
        "role": "admin",
        "valid": True
    },
    "teacher-token": {
        "user_id": "2",
        "username": "teacher",
        "role": "teacher",
        "valid": True
    },
    "student-token": {
        "user_id": "3",
        "username": "student",
        "role": "student",
        "valid": True
    }
}

async def verify_token(authorization: Optional[str] = Header(None)):
    """
    Vérifie la validité du token JWT.
    Pour les routes PRIVÉES uniquement.
    
    Args:
        authorization: Le header Authorization (ex: "Bearer admin-token")
    
    Returns:
        dict: Informations de l'utilisateur
    
    Raises:
        HTTPException 401: Si token manquant ou invalide
    """
    if not authorization:
        logger.warning("Token manquant")
        raise HTTPException(
            status_code=401,
            detail="Token manquant. Cette route nécessite une authentification."
        )
    
    logger.info(f"Vérification du token: {authorization[:20]}...")
    
    # Nettoyer le token (enlever "Bearer " si présent)
    clean_token = authorization.replace("Bearer ", "")
    
    # Vérifier si c'est un token factice
    if clean_token in MOCK_TOKENS:
        logger.info(f"Token factice reconnu: {clean_token}")
        return MOCK_TOKENS[clean_token]
    
    # TODO: Appeler le vrai service Auth (M1) quand il sera prêt
    """
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(
                f"{AUTH_SERVICE_URL}/auth/verify",
                headers={"Authorization": f"Bearer {clean_token}"}
            )
            if response.status_code == 200:
                return response.json()
    except Exception as e:
        logger.error(f"Erreur appel Auth: {e}")
    """
    
    # Si aucun token valide
    logger.warning(f"Token invalide: {clean_token}")
    raise HTTPException(
        status_code=401,
        detail="Token invalide ou expiré"
    )

async def optional_auth(authorization: Optional[str] = Header(None)):
    """
    Vérifie le token si présent, mais ne bloque pas si absent.
    Utile pour les routes qui peuvent être utilisées avec ou sans auth.
    
    Args:
        authorization: Le header Authorization (optionnel)
    
    Returns:
        dict ou None: Informations de l'utilisateur si token valide, None sinon
    """
    if not authorization:
        return None
    
    try:
        return await verify_token(authorization)
    except HTTPException:
        return None
