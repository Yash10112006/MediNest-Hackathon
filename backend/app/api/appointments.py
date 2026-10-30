# backend/app/api/appointments.py
import logging
import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Optional
from ..models.schemas import AppointmentCreate, AppointmentUpdate
from ..core.config import settings
from ..core.database import supabase
from ..core.security import get_current_user, CurrentUser

logger = logging.getLogger("medinest.appointments")
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


def check_appointment_access(appointment: dict, current_user: CurrentUser) -> None:
    """Validate appointment access permissions based on role and ownership"""
    if current_user.role == "patient":
        if appointment.get("patient_id") != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: You do not own this appointment."
            )
    elif current_user.role == "doctor":
        # Strict doctor isolation: Doctor A cannot access Doctor B's appointments
        if appointment.get("doctor_id") != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: You are not the assigned physician for this appointment."
            )
    elif current_user.role in ["hospital_admin", "asha"]:
        pass
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Role '{current_user.role}' cannot view this appointment."
        )


@router.get("/")
async def get_all_appointments(
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Get appointments filtered strictly by user role and data ownership.
    - Patients strictly receive only their own appointments.
    - Doctors strictly receive only their own appointments (returns [] if none match).
    - Hospital admins receive facility appointments.
    """
    if supabase:
        try:
            query = supabase.table("appointments").select("*")
            if current_user.role == "patient":
                query = query.eq("patient_id", current_user.id)
            elif current_user.role == "doctor":
                query = query.eq("doctor_id", current_user.id)

            res = query.execute()
            if res.data is not None:
                return res.data
        except Exception as e:
            logger.error(f"Database error querying appointments: {type(e).__name__}")
            if settings.ENVIRONMENT.lower() == "production":
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to retrieve appointments from database."
                )
            logger.warning("Database unavailable; using development demo appointments.")

    if current_user.role == "patient":
        return [a for a in MOCK_APPOINTMENTS if a.get("patient_id") == current_user.id]

    if current_user.role == "doctor":
        # Strict filtering: returns [] if no appointments match. Never returns all appointments.
        return [a for a in MOCK_APPOINTMENTS if a.get("doctor_id") == current_user.id]

    return MOCK_APPOINTMENTS


@router.post("/")
async def create_appointment(
    appointment: AppointmentCreate,
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Create a new appointment.
    Patients can only book appointments for themselves.
    Doctors, ASHA workers, and Hospital Admins can book on behalf of patients.
    """
    if current_user.role == "patient":
        if appointment.patient_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: Patients cannot book appointments for other patients."
            )

    appointment_data = appointment.model_dump()
    appointment_data["created_at"] = datetime.now().isoformat()
    appointment_data["status"] = "requested"
    appointment_data["booked_by"] = current_user.id
    appointment_data["booked_by_role"] = current_user.role

    if supabase:
        try:
            res = supabase.table("appointments").insert(appointment_data).execute()
            if res.data:
                return res.data[0]
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database insert did not return created appointment."
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Database error booking appointment: {type(e).__name__}")
            if settings.ENVIRONMENT.lower() == "production":
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to persist appointment in database."
                )
            logger.warning("Database unavailable; creating demo appointment.")

    appointment_data["id"] = "apt-" + str(uuid.uuid4())[:6]
    return appointment_data


@router.get("/{appointment_id}")
async def get_appointment(
    appointment_id: str,
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Get appointment by ID with strict ownership verification.
    """
    if supabase:
        try:
            res = supabase.table("appointments").select("*").eq("id", appointment_id).execute()
            if res.data:
                apt = res.data[0]
                check_appointment_access(apt, current_user)
                return apt
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Database error finding appointment: {type(e).__name__}")
            if settings.ENVIRONMENT.lower() == "production":
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Database error retrieving appointment."
                )
            logger.warning("Database unavailable; checking demo appointments.")

    for apt in MOCK_APPOINTMENTS:
        if apt["id"] == appointment_id:
            check_appointment_access(apt, current_user)
            return apt

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Appointment not found."
    )


@router.put("/{appointment_id}")
async def update_appointment(
    appointment_id: str,
    updates: AppointmentUpdate,
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Update appointment.
    Ownership check strictly enforced:
    - Patients can only update their own appointments (e.g. cancel).
    - Doctors can only update appointments assigned to them.
    - Other patients or unassigned doctors receive HTTP 403 Forbidden.
    """
    update_dict = updates.model_dump(exclude_unset=True)

    if supabase:
        try:
            res = supabase.table("appointments").select("*").eq("id", appointment_id).execute()
            if res.data:
                apt = res.data[0]
                check_appointment_access(apt, current_user)

                update_res = supabase.table("appointments").update(update_dict).eq("id", appointment_id).execute()
                if update_res.data:
                    return update_res.data[0]
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Update operation did not return modified appointment."
                )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Database error updating appointment: {type(e).__name__}")
            if settings.ENVIRONMENT.lower() == "production":
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to update appointment in database."
                )
            logger.warning("Database unavailable; performing demo update.")

    # In-memory mock check
    target_apt = None
    for apt in MOCK_APPOINTMENTS:
        if apt["id"] == appointment_id:
            target_apt = apt
            break

    if target_apt:
        check_appointment_access(target_apt, current_user)
        target_apt.update(update_dict)
        return target_apt

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found.")
