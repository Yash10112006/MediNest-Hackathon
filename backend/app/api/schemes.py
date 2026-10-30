# backend/app/api/schemes.py
from fastapi import APIRouter, HTTPException
from typing import List
from ..models.schemas import SchemeEligibilityRequest, SchemeEligibilityResponse
from ..core.database import supabase

router = APIRouter(prefix="/api/schemes", tags=["Schemes"])

MOCK_SCHEMES = [
    {
        "scheme_id": "sch-001",
        "name": "Ayushman Bharat - PM-JAY",
        "department": "Ministry of Health & Family Welfare",
        "description": "Provides health coverage up to ₹5 lakh per family per year for secondary and tertiary care hospitalization.",
        "eligible": True,
        "benefits": ["₹5 Lakh health coverage per family", "Cashless treatment at empaneled hospitals", "Pre & post hospitalization expenses covered"],
        "documents": ["Aadhaar Card", "Ration Card / BPL Certificate", "ABHA ID"],
        "application_url": "https://pmjay.gov.in",
        "reason": "Matches low/medium income and household health criteria."
    },
    {
        "scheme_id": "sch-002",
        "name": "Janani Suraksha Yojana (JSY)",
        "department": "National Health Mission",
        "description": "Safe motherhood intervention promoting institutional delivery among poor pregnant women.",
        "eligible": True,
        "benefits": ["Direct cash assistance of ₹1,400 for rural mothers", "Free delivery in government hospitals", "Free transportation via 108 ambulance"],
        "documents": ["Aadhaar Card", "MCP Card (Mamta Card)", "Bank Account details"],
        "application_url": "https://nhm.gov.in/index1.php?lang=1&level=3&sublinkid=841&lid=309",
        "reason": "Applicable for pregnant women in rural areas."
    },
    {
        "scheme_id": "sch-003",
        "name": "PM Surakshit Matritva Abhiyan (PMSMA)",
        "department": "Ministry of Health & Family Welfare",
        "description": "Free, quality antenatal care checkups on the 9th of every month for pregnant women.",
        "eligible": True,
        "benefits": ["Free ANC checkups by specialists", "Free diagnostic tests and ultrasound", "High-risk pregnancy identification"],
        "documents": ["Mother & Child Protection Card", "Aadhaar Card"],
        "application_url": "https://pmsma.nhp.gov.in",
        "reason": "Provides free monthly health checkups during pregnancy."
    },
    {
        "scheme_id": "sch-004",
        "name": "Nikshay Poshan Yojana (NPY)",
        "department": "Central TB Division",
        "description": "Financial incentive for nutritional support to all TB patients registered on NIKSHAY portal.",
        "eligible": False,
        "benefits": ["₹500 per month financial assistance for nutrition", "Free anti-TB drugs"],
        "documents": ["Nikshay ID", "Bank Account details", "Aadhaar Card"],
        "application_url": "https://nikshay.in",
        "reason": "Requires active TB diagnosis registration."
    }
]

@router.get("/")
async def get_all_schemes():
    """Get all government health schemes"""
    try:
        if supabase:
            try:
                res = supabase.table("schemes").select("*").execute()
                if res.data:
                    return res.data
            except Exception:
                pass
        return MOCK_SCHEMES
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/check-eligibility", response_model=List[SchemeEligibilityResponse])
async def check_eligibility(req: SchemeEligibilityRequest):
    """Check patient eligibility across government schemes"""
    results = []
    for scheme in MOCK_SCHEMES:
        is_eligible = True
        reason = "Matched profile conditions."

        if scheme["scheme_id"] == "sch-002" and not req.is_pregnant:
            is_eligible = False
            reason = "Only applicable for pregnant women."

        if scheme["scheme_id"] == "sch-004" and not req.has_chronic_condition:
            is_eligible = False
            reason = "Requires chronic condition / active TB registration."

        res = scheme.copy()
        res["eligible"] = is_eligible
        res["reason"] = reason
        results.append(SchemeEligibilityResponse(**res))

    return results
