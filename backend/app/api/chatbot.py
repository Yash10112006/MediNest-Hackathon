# backend/app/api/chatbot.py
import logging
from fastapi import APIRouter, HTTPException, Depends, status
from ..models.schemas import ChatRequest, ChatResponse
from ..services.chatbot import MedicalChatbotService
from ..core.security import get_current_user, CurrentUser

logger = logging.getLogger("medinest.chatbot")
router = APIRouter(prefix="/api/chatbot", tags=["AI Medical Chatbot"])
chatbot_service = MedicalChatbotService()


@router.post("/message", response_model=ChatResponse)
async def chat_message(
    req: ChatRequest,
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Interact with the AI Medical Chatbot.
    Enforces ownership: Patients cannot submit chat queries claiming to be another patient.
    """
    if current_user.role == "patient" and req.patient_id:
        if req.patient_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: You cannot initiate consultations under another patient ID."
            )

    target_patient_id = req.patient_id or (current_user.id if current_user.role == "patient" else None)

    try:
        res = await chatbot_service.generate_response(
            message=req.message,
            patient_id=target_patient_id,
            session_id=req.session_id,
            language=req.language
        )
        return ChatResponse(**res)
    except Exception as e:
        logger.error(f"Chatbot service failure: {type(e).__name__}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Chatbot consultation engine encountered an unexpected error."
        )


@router.get("/history/{patient_id}")
async def chat_history(
    patient_id: str,
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Retrieve chat consultation history for patient.
    Strictly restricted to the patient owner, or assigned treating doctor.
    Hospital administrators cannot view private clinical conversations.
    """
    if current_user.role == "hospital_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Hospital administrators are restricted from viewing private patient medical chat history."
        )

    if current_user.role == "patient" and patient_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: You can only view your own consultation history."
        )

    if current_user.role == "doctor":
        from .patients import check_doctor_patient_relationship
        if not check_doctor_patient_relationship(current_user.id, patient_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: No active clinical relationship with this patient."
            )

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
