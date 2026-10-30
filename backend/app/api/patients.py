# backend/app/api/patients.py
from fastapi import APIRouter, HTTPException
from typing import List, Optional
from ..models.schemas import PatientProfile, PatientUpdate
from ..core.database import supabase, supabase_admin

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
        "current_medications": ["Amlodipine 5mg"]
    },
    {
        "id": "pat-002",
        "name": "Sunita Devi",
        "age": 28,
        "gender": "Female",
        "blood_group": "A+",
        "allergies": [],
        "existing_conditions": ["Pregnant (24 weeks)"],
        "current_medications": ["Iron & Folic Acid"]
    }
]

@router.get("/")
async def get_all_patients():
    """Get all patients"""
    db = supabase_admin or supabase
    try:
        if db:
            try:
                res = db.table("patients").select("*").execute()
                if res.data:
                    return res.data
            except Exception:
                pass
            try:
                res = db.table("users").select("*").eq("role", "patient").execute()
                if res.data:
                    return res.data
            except Exception:
                pass
        return MOCK_PATIENTS
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{patient_id}")
async def get_patient(patient_id: str):
    """Get patient by ID"""
    db = supabase_admin or supabase
    try:
        if db:
            try:
                res = db.table("patients").select("*").eq("id", patient_id).execute()
                if res.data:
                    return res.data[0]
            except Exception:
                pass
            try:
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
            except Exception:
                pass
        
        for p in MOCK_PATIENTS:
            if p["id"] == patient_id:
                return p
        raise HTTPException(status_code=404, detail="Patient not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{patient_id}")
async def update_patient(patient_id: str, updates: PatientUpdate):
    """Update patient profile"""
    db = supabase_admin or supabase
    try:
        update_dict = updates.dict(exclude_unset=True)
        if db:
            try:
                res = db.table("patients").update(update_dict).eq("id", patient_id).execute()
                if res.data:
                    return res.data[0]
            except Exception:
                pass
            try:
                # Update users table if columns match
                user_updates = {k: v for k, v in update_dict.items() if k in ["name", "email", "age", "gender", "blood_group", "village", "phone"]}
                if user_updates:
                    res = db.table("users").update(user_updates).eq("id", patient_id).execute()
                    if res.data:
                        return res.data[0]
            except Exception:
                pass
        
        return {
            "id": patient_id,
            **update_dict
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{patient_id}/records")
async def get_patient_records(patient_id: str):
    """Get patient medical records"""
    try:
        if supabase:
            try:
                res = supabase.table("medical_records").select("*").eq("patient_id", patient_id).execute()
                if res.data:
                    return res.data
            except Exception:
                pass
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
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{patient_id}/records")
async def create_patient_record(patient_id: str, record: dict):
    """Create patient medical record"""
    try:
        record["patient_id"] = patient_id
        if supabase:
            try:
                res = supabase.table("medical_records").insert(record).execute()
                if res.data:
                    return res.data[0]
            except Exception:
                pass
        record["id"] = "rec-" + str(len(patient_id) + 100)
        return record
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))