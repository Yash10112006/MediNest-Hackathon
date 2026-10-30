# backend/app/api/referrals.py
import logging
import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Optional
from ..models.schemas import ReferralCreate, ReferralUpdate
from ..core.config import settings
from ..core.database import supabase
from ..core.security import get_current_user, require_roles, CurrentUser

logger = logging.getLogger("medinest.referrals")
router = APIRouter(prefix="/api/referrals", tags=["Referrals"])

MOCK_REFERRALS = [
    {
        "id": "ref-301",
        "patient_id": "pat-001",
        "from_doctor_id": "doc-001",
        "to_doctor_id": "doc-002",
        "to_hospital_id": "hosp-khargone",
        "reason": "Specialist evaluation for uncontrolled hypertension",
        "urgency": "urgent",
        "status": "pending",
        "created_by": "doc-001",
        "created_at": "2026-08-27T10:00:00"
    }
]


def check_referral_access(referral: dict, current_user: CurrentUser) -> None:
    """Enforce strict referral scoping based on ownership and assigned medical roles"""
    if current_user.role == "patient":
        if referral.get("patient_id") != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: You do not own this referral record."
            )
    elif current_user.role == "doctor":
        is_referring = referral.get("from_doctor_id") == current_user.id
        is_receiving = referral.get("to_doctor_id") == current_user.id
        if not (is_referring or is_receiving):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: You are not the referring or receiving physician for this referral."
            )
    elif current_user.role == "asha":
        is_creator = referral.get("created_by") == current_user.id
        if not is_creator:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: You are not the initiating ASHA worker for this referral."
            )
    elif current_user.role == "hospital_admin":
        pass
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Role '{current_user.role}' is not authorized to access this referral."
        )


@router.get("/")
async def get_all_referrals(
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Get referrals with role-based filtering:
    - Patients: only referrals where patient_id == current_user.id.
    - Doctors: only referrals where from_doctor_id or to_doctor_id == current_user.id.
    - ASHA workers: only referrals initiated by them (created_by == current_user.id).
    - Hospital Admins: facility referrals.
    """
    if supabase:
        try:
            query = supabase.table("referrals").select("*")
            if current_user.role == "patient":
                query = query.eq("patient_id", current_user.id)
            elif current_user.role == "doctor":
                query = query.or_(
                    f"from_doctor_id.eq.{current_user.id},to_doctor_id.eq.{current_user.id}"
                )
            elif current_user.role == "asha":
                query = query.eq("created_by", current_user.id)

            res = query.execute()
            if res.data is not None:
                return res.data
        except Exception as e:
            logger.error(f"Database error querying referrals: {type(e).__name__}")
            if settings.ENVIRONMENT.lower() == "production":
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to retrieve referrals from database."
                )
            logger.warning("Database unavailable; using development demo referrals.")

    # Scoped mock filtering
    if current_user.role == "patient":
        return [r for r in MOCK_REFERRALS if r.get("patient_id") == current_user.id]

    if current_user.role == "doctor":
        return [
            r for r in MOCK_REFERRALS
            if r.get("from_doctor_id") == current_user.id or r.get("to_doctor_id") == current_user.id
        ]

    if current_user.role == "asha":
        return [r for r in MOCK_REFERRALS if r.get("created_by") == current_user.id]

    return MOCK_REFERRALS


@router.post("/")
async def create_referral(
    referral: ReferralCreate,
    current_user: CurrentUser = Depends(require_roles("doctor", "asha", "hospital_admin"))
):
    """
    Create a new referral.
    Restricted to medical professionals (doctor, asha, hospital_admin).
    Patients cannot initiate clinical referrals.
    """
    referral_data = referral.model_dump()
    referral_data["created_at"] = datetime.now().isoformat()
    referral_data["status"] = "pending"
    referral_data["created_by"] = current_user.id
    referral_data["created_by_role"] = current_user.role

    if supabase:
        try:
            res = supabase.table("referrals").insert(referral_data).execute()
            if res.data:
                return res.data[0]
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database insert did not return created referral."
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Database error creating referral: {type(e).__name__}")
            if settings.ENVIRONMENT.lower() == "production":
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to persist referral in database."
                )
            logger.warning("Database unavailable; creating demo referral.")

    referral_data["id"] = "ref-" + str(uuid.uuid4())[:6]
    return referral_data


@router.get("/{referral_id}")
async def get_referral(
    referral_id: str,
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Get referral by ID with strict access verification.
    """
    if supabase:
        try:
            res = supabase.table("referrals").select("*").eq("id", referral_id).execute()
            if res.data:
                ref = res.data[0]
                check_referral_access(ref, current_user)
                return ref
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Database error finding referral: {type(e).__name__}")
            if settings.ENVIRONMENT.lower() == "production":
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Database error retrieving referral."
                )
            logger.warning("Database unavailable; checking demo referrals.")

    for ref in MOCK_REFERRALS:
        if ref["id"] == referral_id:
            check_referral_access(ref, current_user)
            return ref

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Referral not found.")


@router.put("/{referral_id}")
async def update_referral(
    referral_id: str,
    updates: ReferralUpdate,
    current_user: CurrentUser = Depends(require_roles("doctor", "hospital_admin", "asha"))
):
    """
    Update referral status.
    Restricted to medical staff and hospital administrators.
    Patients cannot modify referral decisions.
    """
    # Enforce doctor/ASHA referral access before modifying
    target_ref = None
    for r in MOCK_REFERRALS:
        if r["id"] == referral_id:
            target_ref = r
            break

    if target_ref:
        check_referral_access(target_ref, current_user)

    update_dict = updates.model_dump(exclude_unset=True)

    if supabase:
        try:
            res = supabase.table("referrals").select("*").eq("id", referral_id).execute()
            if res.data:
                check_referral_access(res.data[0], current_user)

            up_res = supabase.table("referrals").update(update_dict).eq("id", referral_id).execute()
            if up_res.data:
                return up_res.data[0]
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Referral not found to update."
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Database error updating referral: {type(e).__name__}")
            if settings.ENVIRONMENT.lower() == "production":
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to update referral in database."
                )
            logger.warning("Database unavailable; updating demo referral.")

    if target_ref:
        target_ref.update(update_dict)
        return target_ref

    base = MOCK_REFERRALS[0].copy()
    base.update(update_dict)
    base["id"] = referral_id
    return base
