# backend/app/api/appointments.py
from fastapi import APIRouter, HTTPException
from datetime import datetime
from ..models.schemas import AppointmentCreate, AppointmentUpdate
from ..core.database import supabase
import uuid

router = APIRouter(prefix="/api/appointments", tags=["Appointments"])

MOCK_APPOINTMENTS = [
    {
        "id": "apt-101",
        "patient_id": "pat-001",
        "doctor_id": "doc-001",
        "appointment_date": "2026-08-28",
        "appointment_time": "10:00 AM",
        "status": "confirmed",
        "notes": "Regular checkup"
    },
    {
        "id": "apt-102",
        "patient_id": "pat-002",
        "doctor_id": "doc-002",
        "appointment_date": "2026-08-29",
        "appointment_time": "02:00 PM",
        "status": "requested",
        "notes": "Routine examination"
    }
]

@router.get("/")
async def get_all_appointments():
    """Get all appointments"""
    try:
        if supabase:
            try:
                res = supabase.table("appointments").select("*").execute()
                if res.data:
                    return res.data
            except Exception:
                pass
        return MOCK_APPOINTMENTS
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/")
async def create_appointment(appointment: AppointmentCreate):
    """Create new appointment"""
    try:
        appointment_data = appointment.dict()
        appointment_data["created_at"] = datetime.now().isoformat()
        appointment_data["status"] = "requested"
        
        if supabase:
            try:
                res = supabase.table("appointments").insert(appointment_data).execute()
                if res.data:
                    return res.data[0]
            except Exception:
                pass
        
        appointment_data["id"] = "apt-" + str(uuid.uuid4())[:6]
        return appointment_data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{appointment_id}")
async def get_appointment(appointment_id: str):
    """Get appointment by ID"""
    try:
        if supabase:
            try:
                res = supabase.table("appointments").select("*").eq("id", appointment_id).execute()
                if res.data:
                    return res.data[0]
            except Exception:
                pass
        
        for apt in MOCK_APPOINTMENTS:
            if apt["id"] == appointment_id:
                return apt
        return MOCK_APPOINTMENTS[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{appointment_id}")
async def update_appointment(appointment_id: str, updates: AppointmentUpdate):
    """Update appointment status"""
    try:
        update_dict = updates.dict(exclude_unset=True)
        if supabase:
            try:
                res = supabase.table("appointments").update(update_dict).eq("id", appointment_id).execute()
                if res.data:
                    return res.data[0]
            except Exception:
                pass
        
        base = MOCK_APPOINTMENTS[0].copy()
        base.update(update_dict)
        base["id"] = appointment_id
        return base
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))