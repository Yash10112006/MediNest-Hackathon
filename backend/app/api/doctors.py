# backend/app/api/doctors.py
import logging
from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Optional
from ..models.schemas import DoctorResponse
from ..core.config import settings
from ..core.database import supabase
from ..core.security import get_current_user, CurrentUser

logger = logging.getLogger("medinest.doctors")
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
    """
    Get all registered and verified doctors.
    Publicly accessible directory for rural patients seeking medical care.
    """
    if supabase:
        try:
            res = supabase.table("doctors").select("*").execute()
            if res.data:
                return res.data
        except Exception as e:
            logger.error(f"Database error querying doctors: {type(e).__name__}")
            if settings.ENVIRONMENT.lower() == "production":
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to retrieve doctors directory from database."
                )
            logger.warning("Database unavailable; using development demo doctors directory.")
    return MOCK_DOCTORS


@router.get("/{id}", response_model=DoctorResponse)
async def get_doctor(id: str):
    """
    Get doctor profile by ID.
    Publicly accessible to help patients make informed decisions.
    """
    if supabase:
        try:
            res = supabase.table("doctors").select("*").eq("id", id).execute()
            if res.data:
                return res.data[0]
        except Exception as e:
            logger.error(f"Database error querying doctor {id}: {type(e).__name__}")
            if settings.ENVIRONMENT.lower() == "production":
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Database error retrieving doctor profile."
                )
            logger.warning("Database unavailable; checking demo doctor records.")

    for doc in MOCK_DOCTORS:
        if doc["id"] == id:
            return doc

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found.")


@router.get("/{id}/appointments")
async def get_doctor_appointments(
    id: str,
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Get all appointments for a specific doctor.
    Restricted to that doctor or hospital administrator.
    Patients cannot inspect a doctor's full patient roster.
    """
    if current_user.role == "patient":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Patients cannot inspect a physician's full appointment roster."
        )

    if current_user.role == "doctor" and current_user.id != id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Doctors can only view their own appointments roster."
        )

    if supabase:
        try:
            res = supabase.table("appointments").select("*").eq("doctor_id", id).execute()
            if res.data is not None:
                return res.data
        except Exception as e:
            logger.error(f"Database error querying doctor appointments: {type(e).__name__}")
            if settings.ENVIRONMENT.lower() == "production":
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to retrieve doctor appointments from database."
                )
            logger.warning("Database unavailable; using development demo appointments.")

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
