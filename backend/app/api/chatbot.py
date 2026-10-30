# backend/app/api/chatbot.py
from fastapi import APIRouter, HTTPException
from ..models.schemas import ChatRequest, ChatResponse
from ..services.chatbot import MedicalChatbotService

router = APIRouter(prefix="/api/chatbot", tags=["AI Medical Chatbot"])
chatbot_service = MedicalChatbotService()

@router.post("/message", response_model=ChatResponse)
async def chat_message(req: ChatRequest):
    """Interact with the AI Medical Chatbot (Qwen3 + RAG simulation)"""
    try:
        res = await chatbot_service.generate_response(
            message=req.message,
            patient_id=req.patient_id,
            session_id=req.session_id,
            language=req.language
        )
        return ChatResponse(**res)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history/{patient_id}")
async def chat_history(patient_id: str):
    """Retrieve chat history for patient"""
    return [
        {
            "id": "msg-01",
            "sender": "patient",
            "text": "I have had a mild fever and body aches for two days.",
            "timestamp": "2026-08-27T10:14:00"
        },
        {
            "id": "msg-02",
            "sender": "bot",
            "text": "For fever, rest well and stay hydrated. You may take Paracetamol if advised by a doctor. If fever persists over 3 days, visit a PHC.",
            "triage_level": "green",
            "timestamp": "2026-08-27T10:14:02"
        }
    ]
