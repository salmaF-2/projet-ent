"""
Authentification pour le microservice Upload
Utilise le microservice Auth (M1) pour valider les tokens
"""
from fastapi import HTTPException, Header, Depends
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
    """
    if not authorization:
        logger.warning("Token manquant")
        raise HTTPException(
            status_code=401,
            detail="Token manquant. Authentification requise."
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
                logger.info(f"Token valide pour l'utilisateur: {user_info.get('preferred_username', user_info.get('username', 'inconnu'))}")
                
                # Adapter le format pour correspondre à ce qu'attend ms-upload
                # ms-upload s'attend à avoir 'user_id', 'username', 'role'
                adapted_info = {
                    "user_id": user_info.get("sub") or user_info.get("user_id"),
                    "username": user_info.get("preferred_username") or user_info.get("username"),
                    "role": user_info.get("role", "student")
                }
                return adapted_info
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


async def verify_teacher(token_info: dict = Depends(verify_token)):
    """
    Vérifie que l'utilisateur a le rôle 'teacher'
    """
    role = token_info.get("role")
    if role not in ["teacher", "admin"]:  # On permet aussi aux admins
        logger.warning(f"Accès refusé - rôle {role} n'est pas autorisé")
        raise HTTPException(
            status_code=403,
            detail="Cette action est réservée aux enseignants et administrateurs"
        )
    
    logger.info(f"Accès autorisé pour {token_info.get('username')} (rôle: {role})")
    return token_info
