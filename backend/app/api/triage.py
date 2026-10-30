# backend/app/api/triage.py
from fastapi import APIRouter, HTTPException, Depends
from typing import Optional, List, Dict
from datetime import datetime
from ..models.schemas import TriageRequest, TriageResponse
from ..services.triage import TriageEngine
from ..core.database import supabase

router = APIRouter(prefix="/api/triage", tags=["Triage"])
triage_engine = TriageEngine()

@router.post("/analyze", response_model=TriageResponse)
async def analyze_symptoms(request: TriageRequest):
    """
    Analyze symptoms and return triage result
    """
    # Get patient context if patient_id provided
    patient_context = None
    if request.patient_id:
        try:
            response = supabase.table("patients").select("*").eq("id", request.patient_id).execute()
            if response.data:
                patient_data = response.data[0]
                patient_context = {
                    "age": patient_data.get("age"),
                    "conditions": patient_data.get("existing_conditions", [])
                }
        except Exception as e:
            # Continue without patient context
            pass
    
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
    """Get all triage levels with descriptions"""
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
    # In production, use Google Maps API or ABDM HFR
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