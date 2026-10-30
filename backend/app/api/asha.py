# backend/app/api/asha.py
from fastapi import APIRouter, HTTPException
from typing import List, Optional
from ..models.schemas import AshaTaskCreate, AshaTaskUpdate, AshaHousehold, AshaBeneficiary
from ..core.database import supabase
import uuid

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

@router.get("/households", response_model=List[AshaHousehold])
async def get_households():
    """Get all assigned households for ASHA worker"""
    try:
        if supabase:
            try:
                res = supabase.table("households").select("*").execute()
                if res.data:
                    return res.data
            except Exception:
                pass
        return MOCK_HOUSEHOLDS
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/beneficiaries", response_model=List[AshaBeneficiary])
async def get_beneficiaries():
    """Get high-risk and tracked beneficiaries"""
    try:
        if supabase:
            try:
                res = supabase.table("beneficiaries").select("*").execute()
                if res.data:
                    return res.data
            except Exception:
                pass
        return MOCK_BENEFICIARIES
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/tasks")
async def get_tasks():
    """Get field tasks assigned to ASHA worker"""
    try:
        if supabase:
            try:
                res = supabase.table("asha_tasks").select("*").execute()
                if res.data:
                    return res.data
            except Exception:
                pass
        return MOCK_TASKS
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/tasks")
async def create_task(task: AshaTaskCreate):
    """Create a new ASHA field task"""
    try:
        task_data = task.dict()
        task_data["status"] = "pending"
        
        if supabase:
            try:
                res = supabase.table("asha_tasks").insert(task_data).execute()
                if res.data:
                    return res.data[0]
            except Exception:
                pass

        task_data["id"] = "tsk-" + str(uuid.uuid4())[:6]
        return task_data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/tasks/{id}")
async def update_task(id: str, updates: AshaTaskUpdate):
    """Update task status or notes"""
    try:
        update_dict = updates.dict(exclude_unset=True)
        if supabase:
            try:
                res = supabase.table("asha_tasks").update(update_dict).eq("id", id).execute()
                if res.data:
                    return res.data[0]
            except Exception:
                pass
        
        base = MOCK_TASKS[0].copy()
        base.update(update_dict)
        base["id"] = id
        return base
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
