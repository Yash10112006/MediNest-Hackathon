# backend/app/api/patients.py
import logging
from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Optional, Set
from ..models.schemas import PatientProfile, PatientUpdate
from ..core.config import settings
from ..core.database import supabase, supabase_admin
from ..core.security import (
    get_current_user,
    require_roles,
    CurrentUser
)

logger = logging.getLogger("medinest.patients")
router = APIRouter(prefix="/api/patients", tags=["Patients"])

MOCK_PATIENTS = [
    {
        "id": "pat-001",
        "name": "Ramesh Kumar",
        "age": 45,
        "gender": "Male",
        "blood_group": "O+",
        "allergies": ["Penicillin"],
        "existing_conditions": ["Hypertension"],
        "current_medications": ["Amlodipine 5mg"],
        "household_id": "hh-101"
    },
    {
        "id": "pat-002",
        "name": "Sunita Devi",
        "age": 28,
        "gender": "Female",
        "blood_group": "A+",
        "allergies": [],
        "existing_conditions": ["Pregnant (24 weeks)"],
        "current_medications": ["Iron & Folic Acid"],
        "household_id": "hh-101"
    }
]


def check_doctor_patient_relationship(doctor_id: str, patient_id: str) -> bool:
    """
    Verify whether a physician has an active, legitimate clinical relationship:
    1. Active or scheduled appointment with this patient.
    2. Active referral originating from or directed to this doctor.
    """
    db = supabase_admin or supabase
    if db:
        try:
            apt_res = (
                db.table("appointments")
                .select("id")
                .eq("doctor_id", doctor_id)
                .eq("patient_id", patient_id)
                .execute()
            )
            if apt_res.data and len(apt_res.data) > 0:
                return True

            ref_res = (
                db.table("referrals")
                .select("id, from_doctor_id, to_doctor_id")
                .eq("patient_id", patient_id)
                .execute()
            )
            if ref_res.data:
                for r in ref_res.data:
                    if r.get("from_doctor_id") == doctor_id or r.get("to_doctor_id") == doctor_id:
                        return True
        except Exception as e:
            logger.warning(f"Database error checking clinical relationship: {e}")

    # In-memory evaluation
    from .appointments import MOCK_APPOINTMENTS
    from .referrals import MOCK_REFERRALS

    for apt in MOCK_APPOINTMENTS:
        if apt.get("doctor_id") == doctor_id and apt.get("patient_id") == patient_id:
            return True

    for ref in MOCK_REFERRALS:
        if ref.get("patient_id") == patient_id:
            if ref.get("from_doctor_id") == doctor_id or ref.get("to_doctor_id") == doctor_id:
                return True

    return False


def check_asha_patient_relationship(asha_id: str, patient_id: str) -> bool:
    """
    Verify whether an ASHA worker has an assigned field relationship:
    Patient belongs to a household assigned to this ASHA worker.
    """
    db = supabase_admin or supabase
    if db:
        try:
            hh_res = db.table("households").select("id").eq("assigned_asha_id", asha_id).execute()
            if hh_res.data:
                hh_ids = [h["id"] for h in hh_res.data]
                pat_res = db.table("patients").select("id").eq("id", patient_id).in_("household_id", hh_ids).execute()
                if pat_res.data and len(pat_res.data) > 0:
                    return True
        except Exception as e:
            logger.warning(f"Database error checking ASHA relationship: {e}")

    from .asha import MOCK_HOUSEHOLDS
    assigned_hh_ids = {h["id"] for h in MOCK_HOUSEHOLDS if h.get("assigned_asha_id") == asha_id}
    # In mock data, pat-001 and pat-002 are in hh-101 assigned to asha-001
    for p in MOCK_PATIENTS:
        if p["id"] == patient_id and p.get("household_id") in assigned_hh_ids:
            return True

    return False


def verify_patient_ownership_or_staff(
    patient_id: str,
    current_user: CurrentUser,
    allow_staff: bool = True
) -> None:
    """
    Enforce patient data ownership and scoped healthcare access.
    - Patient: strictly own records (id matches).
    - Doctor: strictly assigned clinical relationship (appointment/referral).
    - ASHA: strictly assigned household/beneficiary scope.
    """
    if current_user.role == "patient":
        is_owner = (
            current_user.id == patient_id or
            current_user.user_id == patient_id
        )
        if not is_owner:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: You can only access your own patient records."
            )
    elif allow_staff:
        if current_user.role == "doctor":
            if not check_doctor_patient_relationship(current_user.id, patient_id):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied: No active clinical appointment or referral relationship with this patient."
                )
        elif current_user.role == "asha":
            if not check_asha_patient_relationship(current_user.id, patient_id):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied: Patient is not within your assigned households or village sector."
                )
        elif current_user.role == "hospital_admin":
            pass
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: Role '{current_user.role}' is not authorized."
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied."
        )


@router.get("/")
async def get_all_patients(
    current_user: CurrentUser = Depends(require_roles("doctor", "asha", "hospital_admin"))
):
    """
    Get patients scoped to the caller's authorized clinical queue:
    - Doctors: only patients with active appointments or referrals.
    - ASHA workers: only patients residing in assigned households.
    - Hospital Admins: facility-level patient queue.
    Patients cannot enumerate the patient list.
    """
    db = supabase_admin or supabase
    if db:
        try:
            if current_user.role == "doctor":
                # Find patient IDs linked by appointments or referrals
                apt_res = db.table("appointments").select("patient_id").eq("doctor_id", current_user.id).execute()
                linked_patient_ids = {a["patient_id"] for a in (apt_res.data or [])}
                ref_res = db.table("referrals").select("patient_id").or_(
                    f"from_doctor_id.eq.{current_user.id},to_doctor_id.eq.{current_user.id}"
                ).execute()
                linked_patient_ids.update({r["patient_id"] for r in (ref_res.data or [])})

                if not linked_patient_ids:
                    return []

                res = db.table("patients").select("*").in_("id", list(linked_patient_ids)).execute()
                return res.data or []

            elif current_user.role == "asha":
                hh_res = db.table("households").select("id").eq("assigned_asha_id", current_user.id).execute()
                hh_ids = [h["id"] for h in (hh_res.data or [])]
                if not hh_ids:
                    return []
                res = db.table("patients").select("*").in_("household_id", hh_ids).execute()
                return res.data or []

            else:
                res = db.table("patients").select("*").execute()
                if res.data:
                    return res.data
        except Exception as e:
            logger.error(f"Database error fetching patients: {type(e).__name__}")
            if settings.ENVIRONMENT.lower() == "production":
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to query patients from database."
                )
            logger.warning("Database unavailable; using development scoped records.")

    # In-memory / Mock filtering
    if current_user.role == "doctor":
        from .appointments import MOCK_APPOINTMENTS
        from .referrals import MOCK_REFERRALS
        linked_ids = set()
        for a in MOCK_APPOINTMENTS:
            if a.get("doctor_id") == current_user.id:
                linked_ids.add(a.get("patient_id"))
        for r in MOCK_REFERRALS:
            if r.get("from_doctor_id") == current_user.id or r.get("to_doctor_id") == current_user.id:
                linked_ids.add(r.get("patient_id"))
        return [p for p in MOCK_PATIENTS if p["id"] in linked_ids]

    if current_user.role == "asha":
        from .asha import MOCK_HOUSEHOLDS
        assigned_hh = {h["id"] for h in MOCK_HOUSEHOLDS if h.get("assigned_asha_id") == current_user.id}
        return [p for p in MOCK_PATIENTS if p.get("household_id") in assigned_hh]

    return MOCK_PATIENTS


@router.get("/{patient_id}")
async def get_patient(
    patient_id: str,
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Get patient by ID with strict ownership and clinical relationship verification.
    """
    verify_patient_ownership_or_staff(patient_id, current_user, allow_staff=True)

    db = supabase_admin or supabase
    if db:
        try:
            res = db.table("patients").select("*").eq("id", patient_id).execute()
            if res.data:
                return res.data[0]

            res = db.table("users").select("*").eq("id", patient_id).execute()
            if res.data:
                u = res.data[0]
                return {
                    "id": u["id"],
                    "name": u.get("name", "Patient"),
                    "email": u.get("email", ""),
                    "role": u.get("role", "patient"),
                    "age": u.get("age"),
                    "gender": u.get("gender"),
                    "blood_group": u.get("blood_group", "—"),
                    "allergies": [],
                    "existing_conditions": [],
                    "current_medications": []
                }
        except Exception as e:
            logger.error(f"Database error retrieving patient: {type(e).__name__}")
            if settings.ENVIRONMENT.lower() == "production":
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Database error retrieving patient record."
                )
            logger.warning("Database unavailable; checking mock records.")

    for p in MOCK_PATIENTS:
        if p["id"] == patient_id:
            return p

    if current_user.id == patient_id:
        return {
            "id": current_user.id,
            "name": current_user.name or "Patient",
            "email": current_user.email or "",
            "role": "patient",
            "age": 30,
            "gender": "Other",
            "blood_group": "O+",
            "allergies": [],
            "existing_conditions": [],
            "current_medications": []
        }

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")


@router.put("/{patient_id}")
async def update_patient(
    patient_id: str,
    updates: PatientUpdate,
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Update patient profile.
    Patients can only update their own profile.
    Healthcare professionals can only update patients with whom they have an active relationship.
    """
    verify_patient_ownership_or_staff(patient_id, current_user, allow_staff=True)

    db = supabase_admin or supabase
    update_dict = updates.model_dump(exclude_unset=True)

    if db:
        try:
            res = db.table("patients").update(update_dict).eq("id", patient_id).execute()
            if res.data:
                return res.data[0]

            user_updates = {
                k: v for k, v in update_dict.items()
                if k in ["name", "email", "age", "gender", "blood_group", "village", "phone"]
            }
            if user_updates:
                res = db.table("users").update(user_updates).eq("id", patient_id).execute()
                if res.data:
                    return res.data[0]

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient record not found in database to update."
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Database update failed: {type(e).__name__}")
            if settings.ENVIRONMENT.lower() == "production":
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to update patient record in database."
                )
            logger.warning("Database unavailable; performing demo update.")

    return {
        "id": patient_id,
        **update_dict
    }


@router.get("/{patient_id}/records")
async def get_patient_records(
    patient_id: str,
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Get patient medical records.
    Restricted to patient owner or assigned clinical doctor/ASHA worker.
    Hospital administrators are restricted from accessing clinical records directly.
    """
    if current_user.role == "hospital_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Hospital administrators do not have access to private clinical medical records."
        )

    verify_patient_ownership_or_staff(patient_id, current_user, allow_staff=True)

    if supabase:
        try:
            res = supabase.table("medical_records").select("*").eq("patient_id", patient_id).execute()
            if res.data is not None:
                return res.data
        except Exception as e:
            logger.error(f"Database error fetching medical records: {type(e).__name__}")
            if settings.ENVIRONMENT.lower() == "production":
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to query medical records from database."
                )
            logger.warning("Database unavailable; using development demo records.")

    return [
        {
            "id": "rec-101",
            "patient_id": patient_id,
            "date": "2026-08-10",
            "diagnosis": "Acute Bronchitis",
            "doctor": "Dr. Rajesh Sharma",
            "prescription": ["Azithromycin 500mg", "Paracetamol 650mg"]
        }
    ]


@router.post("/{patient_id}/records")
async def create_patient_record(
    patient_id: str,
    record: dict,
    current_user: CurrentUser = Depends(require_roles("doctor", "asha"))
):
    """
    Create a medical record for a patient.
    Restricted to assigned clinical care providers.
    """
    verify_patient_ownership_or_staff(patient_id, current_user, allow_staff=True)

    record["patient_id"] = patient_id
    record["created_by"] = current_user.id
    record["created_by_role"] = current_user.role

    if supabase:
        try:
            res = supabase.table("medical_records").insert(record).execute()
            if res.data:
                return res.data[0]
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database insert did not return record data."
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Database error creating medical record: {type(e).__name__}")
            if settings.ENVIRONMENT.lower() == "production":
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to persist medical record in database."
                )
            logger.warning("Database unavailable; creating demo record.")

    record["id"] = "rec-" + str(len(patient_id) + 100)
    return record
