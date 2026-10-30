# backend/app/api/asha.py
import logging
import uuid
from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Optional, Set
from ..models.schemas import AshaTaskCreate, AshaTaskUpdate, AshaHousehold, AshaBeneficiary
from ..core.config import settings
from ..core.database import supabase
from ..core.security import require_roles, CurrentUser

logger = logging.getLogger("medinest.asha")
router = APIRouter(prefix="/api/asha", tags=["ASHA Worker"])

MOCK_HOUSEHOLDS = [
    {
        "id": "hh-101",
        "address": "House 14, Ward 3, Khargone Village",
        "family_members": [
            {"name": "Ramesh Kumar", "age": 45, "relation": "Head"},
            {"name": "Sunita Devi", "age": 28, "relation": "Wife"},
            {"name": "Aarav Kumar", "age": 4, "relation": "Son"}
        ],
        "assigned_asha_id": "asha-001",
        "visit_status": "Visited (2 days ago)"
    },
    {
        "id": "hh-102",
        "address": "House 28, Ward 4, Barwaha Village",
        "family_members": [
            {"name": "Sita Bai", "age": 62, "relation": "Head"},
            {"name": "Mohan Singh", "age": 35, "relation": "Son"}
        ],
        "assigned_asha_id": "asha-001",
        "visit_status": "Pending Visit"
    }
]

MOCK_BENEFICIARIES = [
    {
        "id": "ben-001",
        "name": "Sunita Devi",
        "type": "pregnant_woman",
        "age": 28,
        "household_id": "hh-101",
        "risk_level": "high_risk",
        "last_visit": "2026-08-25"
    },
    {
        "id": "ben-002",
        "name": "Aarav Kumar",
        "type": "infant",
        "age": 4,
        "household_id": "hh-101",
        "risk_level": "normal",
        "last_visit": "2026-08-25"
    },
    {
        "id": "ben-003",
        "name": "Sita Bai",
        "type": "elderly",
        "age": 62,
        "household_id": "hh-102",
        "risk_level": "moderate_risk",
        "last_visit": "2026-08-15"
    }
]

MOCK_TASKS = [
    {
        "id": "tsk-001",
        "household_id": "hh-101",
        "beneficiary_id": "ben-001",
        "task_type": "Antenatal Checkup Follow-up",
        "priority": "high",
        "due_date": "2026-08-30",
        "status": "pending",
        "notes": "Ensure BP checkup and iron supplement delivery."
    },
    {
        "id": "tsk-002",
        "household_id": "hh-101",
        "beneficiary_id": "ben-002",
        "task_type": "Vaccination Booster (Polio & DPT)",
        "priority": "medium",
        "due_date": "2026-09-02",
        "status": "pending",
        "notes": "Verify immunization card status."
    }
]


def get_asha_assigned_household_ids(asha_id: str) -> Set[str]:
    """Retrieve set of household IDs assigned to an ASHA worker"""
    if supabase:
        try:
            res = supabase.table("households").select("id").eq("assigned_asha_id", asha_id).execute()
            if res.data:
                return {h["id"] for h in res.data}
        except Exception as e:
            logger.warning(f"Database error fetching assigned households: {e}")

    return {h["id"] for h in MOCK_HOUSEHOLDS if h.get("assigned_asha_id") == asha_id}


@router.get("/households", response_model=List[AshaHousehold])
async def get_households(
    current_user: CurrentUser = Depends(require_roles("asha", "hospital_admin"))
):
    """
    Get assigned households.
    ASHA workers only receive households matching assigned_asha_id == current_user.id.
    """
    if current_user.role == "asha":
        if supabase:
            try:
                res = (
                    supabase.table("households")
                    .select("*")
                    .eq("assigned_asha_id", current_user.id)
                    .execute()
                )
                if res.data is not None:
                    return res.data
            except Exception as e:
                logger.error(f"Database error querying households: {type(e).__name__}")
                if settings.ENVIRONMENT.lower() == "production":
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail="Failed to retrieve households from database."
                    )
        return [h for h in MOCK_HOUSEHOLDS if h.get("assigned_asha_id") == current_user.id]

    # Hospital admin
    if supabase:
        try:
            res = supabase.table("households").select("*").execute()
            if res.data is not None:
                return res.data
        except Exception as e:
            logger.error(f"Database error querying households: {type(e).__name__}")
            if settings.ENVIRONMENT.lower() == "production":
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to retrieve households from database."
                )
    return MOCK_HOUSEHOLDS


@router.get("/beneficiaries", response_model=List[AshaBeneficiary])
async def get_beneficiaries(
    current_user: CurrentUser = Depends(require_roles("asha", "hospital_admin"))
):
    """
    Get beneficiaries scoped through assigned households.
    ASHA workers cannot enumerate beneficiaries belonging to another ASHA's sector.
    """
    if current_user.role == "asha":
        assigned_hh_ids = get_asha_assigned_household_ids(current_user.id)
        if not assigned_hh_ids:
            return []

        if supabase:
            try:
                res = (
                    supabase.table("beneficiaries")
                    .select("*")
                    .in_("household_id", list(assigned_hh_ids))
                    .execute()
                )
                if res.data is not None:
                    return res.data
            except Exception as e:
                logger.error(f"Database error querying beneficiaries: {type(e).__name__}")
                if settings.ENVIRONMENT.lower() == "production":
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail="Failed to retrieve beneficiaries from database."
                    )

        return [b for b in MOCK_BENEFICIARIES if b.get("household_id") in assigned_hh_ids]

    # Hospital admin
    if supabase:
        try:
            res = supabase.table("beneficiaries").select("*").execute()
            if res.data is not None:
                return res.data
        except Exception as e:
            logger.error(f"Database error querying beneficiaries: {type(e).__name__}")
            if settings.ENVIRONMENT.lower() == "production":
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to retrieve beneficiaries from database."
                )
    return MOCK_BENEFICIARIES


@router.get("/tasks")
async def get_tasks(
    current_user: CurrentUser = Depends(require_roles("asha", "hospital_admin"))
):
    """
    Get field tasks assigned to ASHA worker's households.
    """
    if current_user.role == "asha":
        assigned_hh_ids = get_asha_assigned_household_ids(current_user.id)
        if not assigned_hh_ids:
            return []

        if supabase:
            try:
                res = (
                    supabase.table("asha_tasks")
                    .select("*")
                    .in_("household_id", list(assigned_hh_ids))
                    .execute()
                )
                if res.data is not None:
                    return res.data
            except Exception as e:
                logger.error(f"Database error querying asha tasks: {type(e).__name__}")
                if settings.ENVIRONMENT.lower() == "production":
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail="Failed to retrieve tasks from database."
                    )

        return [t for t in MOCK_TASKS if t.get("household_id") in assigned_hh_ids]

    # Hospital admin
    if supabase:
        try:
            res = supabase.table("asha_tasks").select("*").execute()
            if res.data is not None:
                return res.data
        except Exception as e:
            logger.error(f"Database error querying asha tasks: {type(e).__name__}")
            if settings.ENVIRONMENT.lower() == "production":
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to retrieve tasks from database."
                )
    return MOCK_TASKS


@router.post("/tasks")
async def create_task(
    task: AshaTaskCreate,
    current_user: CurrentUser = Depends(require_roles("asha", "hospital_admin"))
):
    """
    Create a new ASHA field task.
    Enforces that ASHA workers can only create tasks for their assigned households.
    """
    if current_user.role == "asha":
        assigned_hh_ids = get_asha_assigned_household_ids(current_user.id)
        if task.household_id not in assigned_hh_ids:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: Cannot create tasks for a household outside your assigned sector."
            )

    task_data = task.model_dump()
    task_data["status"] = "pending"
    task_data["created_by"] = current_user.id

    if supabase:
        try:
            res = supabase.table("asha_tasks").insert(task_data).execute()
            if res.data:
                return res.data[0]
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database insert did not return created task."
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Database error creating asha task: {type(e).__name__}")
            if settings.ENVIRONMENT.lower() == "production":
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to persist task in database."
                )
            logger.warning("Database unavailable; creating demo task.")

    task_data["id"] = "tsk-" + str(uuid.uuid4())[:6]
    return task_data


@router.put("/tasks/{id}")
async def update_task(
    id: str,
    updates: AshaTaskUpdate,
    current_user: CurrentUser = Depends(require_roles("asha", "hospital_admin"))
):
    """
    Update task status or notes.
    ASHA workers can only modify tasks in their assigned households.
    """
    if current_user.role == "asha":
        assigned_hh_ids = get_asha_assigned_household_ids(current_user.id)
        # Check task household
        for t in MOCK_TASKS:
            if t["id"] == id and t.get("household_id") not in assigned_hh_ids:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied: Cannot update tasks outside your assigned sector."
                )

    update_dict = updates.model_dump(exclude_unset=True)

    if supabase:
        try:
            res = supabase.table("asha_tasks").update(update_dict).eq("id", id).execute()
            if res.data:
                return res.data[0]
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found to update."
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Database error updating asha task: {type(e).__name__}")
            if settings.ENVIRONMENT.lower() == "production":
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to update task in database."
                )
            logger.warning("Database unavailable; performing demo task update.")

    base = MOCK_TASKS[0].copy()
    base.update(update_dict)
    base["id"] = id
    return base
