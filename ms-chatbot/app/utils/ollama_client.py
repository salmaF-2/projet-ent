"""
Client pour communiquer avec Ollama
"""
import httpx
import logging
import os
from typing import Optional

logger = logging.getLogger(__name__)

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://ent-ollama:11434")
DEFAULT_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2:3b")

async def ask_ollama(question: str, model: str = DEFAULT_MODEL) -> str:
    """
    Envoie une question à Ollama et retourne la réponse
    
    Args:
        question: La question à poser
        model: Le modèle Ollama à utiliser
    
    Returns:
        str: La réponse générée
    """
    logger.info(f"Question posée à Ollama [modèle: {model}]: {question[:50]}...")
    
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            payload = {
                "model": model,
                "prompt": question,
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "max_tokens": 250,
                    "top_p": 0.9,
                    "num_predict": 150
                }
            }
            
            response = await client.post(
                f"{OLLAMA_URL}/api/generate",
                json=payload
            )
            
            if response.status_code == 200:
                result = response.json()
                answer = result.get("response", "Désolé, je n'ai pas pu générer une réponse.")
                logger.info(f"Réponse reçue ({len(answer)} caractères)")
                return answer
            else:
                logger.error(f"Erreur Ollama: {response.status_code}")
                return f"⚠️ Erreur: Le service Ollama a répondu avec le code {response.status_code}"
    
    except httpx.ConnectError:
        logger.error("Impossible de se connecter à Ollama")
        return "❌ Erreur: Impossible de se connecter à Ollama. Vérifiez que le service est lancé avec `docker start ent-ollama`."
    except httpx.TimeoutException:
        logger.error("Timeout Ollama")
        return "⏱️ Erreur: Le service Ollama a mis trop de temps à répondre."
    except Exception as e:
        logger.error(f"Erreur inattendue: {e}")
        return f"❌ Erreur: {str(e)}"

async def ask_ollama_with_context(question: str, user_info: dict, model: str = DEFAULT_MODEL) -> str:
    """
    Envoie une question à Ollama avec le contexte de l'utilisateur connecté
    
    Args:
        question: La question à poser
        user_info: Informations de l'utilisateur (username, rôle)
        model: Le modèle Ollama à utiliser
    
    Returns:
        str: La réponse générée
    """
    # Enrichir la question avec le contexte utilisateur
    context_prompt = f"""L'utilisateur {user_info.get('username', 'inconnu')} qui a le rôle {user_info.get('role', 'visiteur')} pose la question suivante:
    
Question: {question}

Réponds de manière utile et adaptée à son rôle dans l'ENT (étudiant, enseignant ou administrateur)."""
    
    return await ask_ollama(context_prompt, model)

async def check_ollama_health() -> bool:
    """
    Vérifie si Ollama est accessible
    
    Returns:
        bool: True si Ollama répond, False sinon
    """
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{OLLAMA_URL}/api/tags")
            return response.status_code == 200
    except:
        return False

async def get_available_models() -> list:
    """
    Récupère la liste des modèles disponibles sur Ollama
    
    Returns:
        list: Liste des modèles avec leurs informations
    """
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{OLLAMA_URL}/api/tags")
            if response.status_code == 200:
                data = response.json()
                return data.get("models", [])
            return []
    except:
        return []
