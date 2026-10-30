from typing import Optional

from pydantic import BaseModel


class ChatbotRequest(BaseModel):
    message: str
    patient_id: Optional[str] = None
    session_id: Optional[str] = None
    emotion: Optional[str] = None
    language: str = "en-IN"


class ChatbotResponse(BaseModel):
    session_id: str
    response: str
    language: str
    triage_level: Optional[str] = None
    confidence: Optional[float] = None
    reason: Optional[str] = None
    emotion: Optional[str] = None
    is_complete: bool = False
    timestamp: Optional[str] = None