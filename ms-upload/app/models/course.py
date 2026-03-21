"""
Modèles de données pour les cours
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid

class CourseBase(BaseModel):
    """Modèle de base pour un cours"""
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)

class CourseCreate(CourseBase):
    """Modèle pour création d'un cours"""
    pass

class CourseInDB(CourseBase):
    """Modèle pour cours en base de données"""
    course_id: uuid.UUID
    file_url: str
    file_name: str
    file_size: int
    content_type: str
    teacher_id: str
    teacher_name: str
    created_at: datetime
    updated_at: datetime
    
    def to_response(self):
        """Convertit en modèle de réponse"""
        return {
            "course_id": str(self.course_id),
            "title": self.title,
            "description": self.description,
            "file_url": self.file_url,
            "file_name": self.file_name,
            "file_size": self.file_size,
            "content_type": self.content_type,
            "teacher_id": self.teacher_id,
            "teacher_name": self.teacher_name,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

class CourseResponse(BaseModel):
    """Modèle pour réponse API"""
    course_id: str
    title: str
    description: Optional[str] = None
    file_url: str
    file_name: str
    file_size: int
    content_type: str
    teacher_id: str
    teacher_name: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
