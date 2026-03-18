"""
Authentification pour le chatbot
Utilise le microservice Auth (M1) pour valider les tokens
"""
from fastapi import HTTPException, Header
import httpx
import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# URL du service d'authentification (M1)
AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://ms-auth:8000")

async def verify_token(authorization: Optional[str] = Header(None)):
    """
    Vérifie la validité du token JWT en appelant le service Auth (M1)
    
    Args:
        authorization: Le header Authorization (ex: "Bearer token123")
    
    Returns:
        dict: Informations de l'utilisateur
    
    Raises:
        HTTPException 401: Si token manquant ou invalide
        HTTPException 503: Si service Auth indisponible
    """
    if not authorization:
        logger.warning("Token manquant")
        raise HTTPException(
            status_code=401,
            detail="Token manquant. Cette route nécessite une authentification."
        )
    
    clean_token = authorization.replace("Bearer ", "")
    logger.info(f"Vérification du token avec le service Auth")
    
    try:
        # Appeler le service Auth (M1) pour vérifier le token
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(
                f"{AUTH_SERVICE_URL}/verify",
                headers={"Authorization": f"Bearer {clean_token}"}
            )
            
            if response.status_code == 200:
                user_info = response.json()
                logger.info(f"Token valide pour l'utilisateur: {user_info.get('preferred_username')}")
                
                # Adapter le format pour le chatbot
                return {
                    "user_id": user_info.get("sub"),
                    "username": user_info.get("preferred_username"),
                    "role": user_info.get("role", "student")
                }
            else:
                logger.warning(f"Token invalide: {response.status_code}")
                raise HTTPException(
                    status_code=401,
                    detail="Token invalide ou expiré"
                )
                
    except httpx.ConnectError:
        logger.error(f"Impossible de se connecter au service Auth sur {AUTH_SERVICE_URL}")
        raise HTTPException(
            status_code=503,
            detail="Service d'authentification indisponible"
        )
    except httpx.TimeoutException:
        logger.error("Timeout lors de l'appel au service Auth")
        raise HTTPException(
            status_code=504,
            detail="Timeout du service d'authentification"
        )
    except Exception as e:
        logger.error(f"Erreur inattendue: {e}")
        raise HTTPException(
            status_code=500,
            detail="Erreur lors de la vérification du token"
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


# Version de secours avec tokens mock (optionnel - peut être gardée pour développement)
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

async def verify_token_with_fallback(authorization: Optional[str] = Header(None)):
    """
    Version avec fallback sur les tokens mock si le service Auth n'est pas disponible
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Token manquant")
    
    clean_token = authorization.replace("Bearer ", "")
    
    # Essayer d'abord les tokens mock (pour développement)
    if clean_token in MOCK_TOKENS:
        logger.info(f"Token mock utilisé: {clean_token}")
        return MOCK_TOKENS[clean_token]
    
    # Sinon, appeler le vrai service Auth
    return await verify_token(authorization)
