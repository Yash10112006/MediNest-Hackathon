# backend/app/api/referrals.py
from fastapi import APIRouter, HTTPException
from datetime import datetime
from ..models.schemas import ReferralCreate, ReferralUpdate
from ..core.database import supabase
import uuid

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
        "created_at": "2026-08-27T10:00:00"
    }
]

@router.get("/")
async def get_all_referrals():
    """Get all referrals"""
    try:
        if supabase:
            try:
                res = supabase.table("referrals").select("*").execute()
                if res.data:
                    return res.data
            except Exception:
                pass
        return MOCK_REFERRALS
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/")
async def create_referral(referral: ReferralCreate):
    """Create new referral"""
    try:
        referral_data = referral.dict()
        referral_data["created_at"] = datetime.now().isoformat()
        referral_data["status"] = "pending"
        
        if supabase:
            try:
                res = supabase.table("referrals").insert(referral_data).execute()
                if res.data:
                    return res.data[0]
            except Exception:
                pass
        
        referral_data["id"] = "ref-" + str(uuid.uuid4())[:6]
        return referral_data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{referral_id}")
async def get_referral(referral_id: str):
    """Get referral by ID"""
    try:
        if supabase:
            try:
                res = supabase.table("referrals").select("*").eq("id", referral_id).execute()
                if res.data:
                    return res.data[0]
            except Exception:
                pass
        
        for ref in MOCK_REFERRALS:
            if ref["id"] == referral_id:
                return ref
        return MOCK_REFERRALS[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{referral_id}")
async def update_referral(referral_id: str, updates: ReferralUpdate):
    """Update referral status"""
    try:
        update_dict = updates.dict(exclude_unset=True)
        if supabase:
            try:
                res = supabase.table("referrals").update(update_dict).eq("id", referral_id).execute()
                if res.data:
                    return res.data[0]
            except Exception:
                pass
        
        base = MOCK_REFERRALS[0].copy()
        base.update(update_dict)
        base["id"] = referral_id
        return base
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))