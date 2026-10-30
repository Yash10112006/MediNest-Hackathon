# backend/app/api/triage.py
import logging
from fastapi import APIRouter, HTTPException, Depends, status
from typing import Optional, List, Dict
from datetime import datetime
from ..models.schemas import TriageRequest, TriageResponse
from ..services.triage import TriageEngine
from ..core.database import supabase
from ..core.security import get_current_user, CurrentUser

logger = logging.getLogger("medinest.triage")
router = APIRouter(prefix="/api/triage", tags=["Triage"])
triage_engine = TriageEngine()


@router.post("/analyze", response_model=TriageResponse)
async def analyze_symptoms(
    request: TriageRequest,
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Analyze symptoms and return triage result.
    Enforces ownership: Patients can only triage for themselves.
    Doctors and ASHA workers can triage patients in their care.
    """
    # Enforce patient data ownership and physician assignment
    if current_user.role == "patient" and request.patient_id:
        if request.patient_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: You cannot run clinical triage under another patient's identifier."
            )
    elif current_user.role == "doctor" and request.patient_id:
        from .patients import check_doctor_patient_relationship
        if not check_doctor_patient_relationship(current_user.id, request.patient_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: No active clinical appointment or referral relationship with this patient."
            )

    target_patient_id = request.patient_id or (current_user.id if current_user.role == "patient" else None)

    # Get patient context if patient_id provided
    patient_context = None
    if target_patient_id and supabase:
        try:
            response = supabase.table("patients").select("*").eq("id", target_patient_id).execute()
            if response.data:
                patient_data = response.data[0]
                patient_context = {
                    "age": patient_data.get("age"),
                    "conditions": patient_data.get("existing_conditions", [])
                }
        except Exception as e:
            logger.warning(f"Failed to fetch patient context for triage: {e}")

    # Analyze symptoms
    result = triage_engine.analyze(request.symptoms, patient_context)

    # Get recommendations
    recommendations = triage_engine.get_recommendations(result["level"])

    # Get nearby facilities for Yellow/Red/Emergency
    facilities = []
    if result["level"] in ["yellow", "red", "emergency"]:
        facilities = await get_nearby_facilities()

    return TriageResponse(
        level=result["level"],
        label=result["label"],
        message=result["message"],
        action=result["action"],
        confidence=result["confidence"],
        reason=result["reason"],
        recommendations=recommendations,
        facilities=facilities,
        timestamp=result["timestamp"]
    )


@router.get("/levels")
async def get_triage_levels():
    """
    Get all triage levels with descriptions.
    Public informational endpoint for health awareness.
    """
    return {
        "levels": [
            {
                "level": "green",
                "label": "🟢 LOW RISK",
                "description": "Monitor symptoms at home. Routine consultation if needed.",
                "action": "Rest, stay hydrated. See doctor if symptoms persist."
            },
            {
                "level": "yellow",
                "label": "🟡 MODERATE RISK",
                "description": "Consult a healthcare professional within 24-48 hours.",
                "action": "Visit PHC/CHC within 24-48 hours. Carry ABHA ID."
            },
            {
                "level": "red",
                "label": "🔴 HIGH RISK",
                "description": "Seek urgent medical evaluation immediately.",
                "action": "Visit nearest hospital immediately. Do not wait."
            },
            {
                "level": "emergency",
                "label": "🔴🔴 EMERGENCY",
                "description": "Life-threatening condition. Immediate action required.",
                "action": "Call 112/108 immediately. Do not wait."
            }
        ]
    }


async def get_nearby_facilities():
    """Get nearby healthcare facilities"""
    return [
        {
            "name": "PHC Khargone",
            "type": "Primary Health Center",
            "distance": "5 km",
            "available": {"medicine": True, "doctor": True, "bed": True},
            "address": "Khargone, Madhya Pradesh"
        },
        {
            "name": "CHC Barwaha",
            "type": "Community Health Center",
            "distance": "15 km",
            "available": {"medicine": True, "doctor": True, "bed": True},
            "address": "Barwaha, Madhya Pradesh"
        },
        {
            "name": "District Hospital Khandwa",
            "type": "District Hospital",
            "distance": "35 km",
            "available": {"medicine": True, "doctor": True, "bed": True},
            "address": "Khandwa, Madhya Pradesh"
        }
    ]
