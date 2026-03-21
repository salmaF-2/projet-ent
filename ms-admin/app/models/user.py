"""
Modèles de données pour les utilisateurs
"""
from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional
import re
import uuid
from datetime import datetime


class UserBase(BaseModel):
    username:  str      = Field(..., min_length=3, max_length=50)
    email:     EmailStr
    full_name: str      = Field(..., min_length=2, max_length=100)
    role:      str      = Field(..., pattern="^(admin|teacher|student)$")

    @validator('username')
    def validate_username(cls, v):
        if not re.match("^[a-zA-Z0-9_.]+$", v):
            raise ValueError('Le username ne peut contenir que des lettres, chiffres, _ et .')
        return v


class UserCreate(UserBase):
    """Modèle pour création d'utilisateur – inclut le mot de passe"""
    password: str = Field(..., min_length=6, max_length=100)


class UserUpdate(BaseModel):
    """Modèle pour mise à jour d'utilisateur"""
    email:     Optional[EmailStr] = None
    full_name: Optional[str]      = Field(None, min_length=2, max_length=100)
    role:      Optional[str]      = Field(None, pattern="^(admin|teacher|student)$")
    password:  Optional[str]      = Field(None, min_length=6, max_length=100)


class UserResponse(BaseModel):
    """Modèle pour réponse API – sans password"""
    user_id:    str
    username:   str
    email:      str
    full_name:  str
    role:       str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True


class UserInDB(UserBase):
    """Modèle pour utilisateur en base de données"""
    user_id:    uuid.UUID
    created_at: datetime
    updated_at: datetime

    def to_response(self) -> UserResponse:
        return UserResponse(
            user_id=str(self.user_id),
            username=self.username,
            email=self.email,
            full_name=self.full_name,
            role=self.role,
            created_at=self.created_at.isoformat() if self.created_at else None,
            updated_at=self.updated_at.isoformat() if self.updated_at else None,
        )
