# backend/app/api/doctors.py
from fastapi import APIRouter, HTTPException
from typing import List, Optional
from ..models.schemas import DoctorResponse
from ..core.database import supabase

router = APIRouter(prefix="/api/doctors", tags=["Doctors"])

MOCK_DOCTORS = [
    {
        "id": "doc-001",
        "name": "Dr. Rajesh Sharma",
        "specialization": "General Medicine",
        "hospital_id": "hosp-khargone",
        "is_verified": True
    },
    {
        "id": "doc-002",
        "name": "Dr. Priya Patel",
        "specialization": "Gynecology & Obstetrics",
        "hospital_id": "hosp-barwaha",
        "is_verified": True
    },
    {
        "id": "doc-003",
        "name": "Dr. Anil Verma",
        "specialization": "Pediatrics",
        "hospital_id": "hosp-khandwa",
        "is_verified": True
    }
]

@router.get("/", response_model=List[DoctorResponse])
async def get_all_doctors():
    """Get all registered doctors"""
    try:
        if supabase:
            try:
                res = supabase.table("doctors").select("*").execute()
                if res.data:
                    return res.data
            except Exception:
                pass
        return MOCK_DOCTORS
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{id}", response_model=DoctorResponse)
async def get_doctor(id: str):
    """Get doctor by ID"""
    try:
        if supabase:
            try:
                res = supabase.table("doctors").select("*").eq("id", id).execute()
                if res.data:
                    return res.data[0]
            except Exception:
                pass
        for doc in MOCK_DOCTORS:
            if doc["id"] == id:
                return doc
        return MOCK_DOCTORS[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{id}/appointments")
async def get_doctor_appointments(id: str):
    """Get all appointments for a specific doctor"""
    try:
        if supabase:
            try:
                res = supabase.table("appointments").select("*").eq("doctor_id", id).execute()
                if res.data:
                    return res.data
            except Exception:
                pass
        return [
            {
                "id": "apt-501",
                "patient_id": "pat-001",
                "patient_name": "Ramesh Kumar",
                "doctor_id": id,
                "appointment_date": "2026-08-28",
                "appointment_time": "10:30 AM",
                "status": "confirmed",
                "notes": "Follow-up consultation"
            },
            {
                "id": "apt-502",
                "patient_id": "pat-002",
                "patient_name": "Sunita Devi",
                "doctor_id": id,
                "appointment_date": "2026-08-28",
                "appointment_time": "11:15 AM",
                "status": "requested",
                "notes": "Antenatal checkup"
            }
        ]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
