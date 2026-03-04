"""
Modèles de données pour les utilisateurs
"""
from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional
import re
import uuid
from datetime import datetime

class UserBase(BaseModel):
    """Modèle de base pour un utilisateur"""
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=100)
    role: str = Field(..., pattern="^(admin|teacher|student)$")
    
    @validator('username')
    def validate_username(cls, v):
        if not re.match("^[a-zA-Z0-9_]+$", v):
            raise ValueError('Le username ne peut contenir que des lettres, chiffres et _')
        return v

class UserCreate(UserBase):
    """Modèle pour création d'utilisateur"""
    pass

class UserUpdate(BaseModel):
    """Modèle pour mise à jour d'utilisateur"""
    email: Optional[EmailStr] = None
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    role: Optional[str] = Field(None, pattern="^(admin|teacher|student)$")

class UserResponse(UserBase):
    """Modèle pour réponse API"""
    user_id: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    
    class Config:
        from_attributes = True

class UserInDB(UserBase):
    """Modèle pour utilisateur en base de données"""
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    
    def to_response(self) -> UserResponse:
        """Convertit en modèle de réponse"""
        return UserResponse(
            user_id=str(self.user_id),
            username=self.username,
            email=self.email,
            full_name=self.full_name,
            role=self.role,
            created_at=self.created_at.isoformat() if self.created_at else None,
            updated_at=self.updated_at.isoformat() if self.updated_at else None
        )
