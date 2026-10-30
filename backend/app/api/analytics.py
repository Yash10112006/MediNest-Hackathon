# backend/app/api/analytics.py
from fastapi import APIRouter, HTTPException
from typing import List
from ..models.schemas import KPIResponse, AlertItem, ConsultationMetric, RegionData, TriagePerformance

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/kpis", response_model=KPIResponse)
async def get_kpis():
    """Get system-wide KPIs"""
    return KPIResponse(
        total_consultations=14250,
        ai_triage_accuracy=94.2,
        avg_response_time=1.8,
        active_asha_workers=340,
        bed_occupancy_rate=78.5,
        referral_completion_rate=89.1
    )

@router.get("/alerts", response_model=List[AlertItem])
async def get_alerts():
    """Get high-risk and epidemic health alerts"""
    return [
        AlertItem(
            id="alt-01",
            severity="high",
            title="Spike in Dengue Cases",
            category="Vector-Borne",
            description="15 cases reported in Ward 3 within the last 48 hours.",
            location="Khargone Sector B",
            timestamp="2026-08-27T18:30:00",
            trend="+24%",
            status="active"
        ),
        AlertItem(
            id="alt-02",
            severity="medium",
            title="Iron Deficiency in Pregnant Women",
            category="Maternal Health",
            description="32% of registered pregnant women show Hb < 10 g/dL.",
            location="Barwaha PHC Region",
            timestamp="2026-08-26T14:10:00",
            trend="stable",
            status="monitoring"
        )
    ]

@router.get("/consultations", response_model=List[ConsultationMetric])
async def get_consultations():
    """Get monthly consultation metrics"""
    return [
        ConsultationMetric(month="Jan", consultations=980, triage=1120, referrals=140),
        ConsultationMetric(month="Feb", consultations=1050, triage=1240, referrals=160),
        ConsultationMetric(month="Mar", consultations=1200, triage=1390, referrals=180),
        ConsultationMetric(month="Apr", consultations=1150, triage=1310, referrals=155),
        ConsultationMetric(month="May", consultations=1340, triage=1480, referrals=210),
        ConsultationMetric(month="Jun", consultations=1420, triage=1600, referrals=230)
    ]

@router.get("/regions", response_model=List[RegionData])
async def get_regions():
    """Get health status breakdown by region"""
    return [
        RegionData(name="Khargone PHC", type="Primary Center", consultations=3400, status="Optimal"),
        RegionData(name="Barwaha CHC", type="Community Center", consultations=5200, status="High Demand"),
        RegionData(name="Khandwa District", type="District Hospital", consultations=7800, status="Critical Load")
    ]

@router.get("/triage-performance", response_model=TriagePerformance)
async def get_triage_performance():
    """Get AI triage model accuracy & concordance metrics"""
    return TriagePerformance(
        accuracy="94.2%",
        false_alarms="1.8%",
        concordance="96.5% Doctor-AI Agreement",
        detection_time="< 350ms"
    )
