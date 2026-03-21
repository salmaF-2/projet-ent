"""
Routes pour le chatbot
- Routes publiques : sans authentification
- Routes privées : avec authentification
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Optional, List
import logging

from app.utils.auth import verify_token, optional_auth
from app.utils.ollama_client import (
    ask_ollama,
    ask_ollama_with_context,
    check_ollama_health,
    get_available_models
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/chat", tags=["Chatbot"])


# ============================================
# MODÈLES Pydantic
# ============================================

class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=1000)
    model: Optional[str] = None


class ChatResponse(BaseModel):
    question: str
    answer: str
    user: str = "public"
    model_used: str
    authenticated: bool = False


class HealthResponse(BaseModel):
    status: str
    ollama_connected: bool
    message: Optional[str] = None
    available_models: Optional[List[str]] = None


# ============================================
# ROUTES PUBLIQUES
# ============================================

@router.get("/health", response_model=HealthResponse)
async def health_check():
    ollama_ok = await check_ollama_health()
    models = []

    if ollama_ok:
        models_data = await get_available_models()
        models = [m.get("name") for m in models_data]

    return HealthResponse(
        status="healthy" if ollama_ok else "degraded",
        ollama_connected=ollama_ok,
        message="Ollama connecté" if ollama_ok else "Ollama non accessible",
        available_models=models if models else None
    )


@router.post("/public/ask", response_model=ChatResponse)
async def ask_question_public(request: ChatRequest):

    if not request.question.strip():
        raise HTTPException(status_code=400, detail="La question ne peut pas être vide")

    if not await check_ollama_health():
        raise HTTPException(
            status_code=503,
            detail="Service Ollama indisponible"
        )

    model = request.model or "llama3.2:3b"
    answer = await ask_ollama(request.question, model)

    return ChatResponse(
        question=request.question,
        answer=answer,
        user="public",
        model_used=model,
        authenticated=False
    )


# ============================================
# ROUTES PRIVÉES
# ============================================

@router.post("/ask", response_model=ChatResponse)
async def ask_question_private(
    request: ChatRequest,
    user=Depends(verify_token)
):

    if not request.question.strip():
        raise HTTPException(status_code=400, detail="La question ne peut pas être vide")

    if not await check_ollama_health():
        raise HTTPException(
            status_code=503,
            detail="Service Ollama indisponible"
        )

    model = request.model or "llama3.2:3b"
    answer = await ask_ollama_with_context(request.question, user, model)

    return ChatResponse(
        question=request.question,
        answer=answer,
        user=user.get("username", "inconnu"),
        model_used=model,
        authenticated=True
    )


@router.get("/models")
async def list_models(user=Depends(optional_auth)):

    models = await get_available_models()

    if not user:
        return {
            "public": True,
            "models": [m.get("name") for m in models],
            "count": len(models)
        }

    return {
        "authenticated": True,
        "user": user.get("username"),
        "models": models,
        "count": len(models)
    }


@router.get("/history")
async def get_chat_history(
    limit: int = Query(10, ge=1, le=100),
    user=Depends(verify_token)
):

    return {
        "message": "Historique non implémenté",
        "user": user.get("username"),
        "limit": limit
    }
