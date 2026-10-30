# backend/app/models/schemas.py
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict
from datetime import datetime

# === Auth Schemas ===
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str = "patient"  # patient, doctor, asha, admin

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    role: str
    name: str

# === Patient Schemas ===
class PatientProfile(BaseModel):
    name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    allergies: List[str] = []
    existing_conditions: List[str] = []
    current_medications: List[str] = []

class PatientUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    allergies: Optional[List[str]] = None
    existing_conditions: Optional[List[str]] = None
    current_medications: Optional[List[str]] = None

# === Doctor Schemas ===
class DoctorResponse(BaseModel):
    id: str
    name: str
    specialization: str
    hospital_id: Optional[str] = None
    is_verified: bool = True

# === Appointment Schemas ===
class AppointmentCreate(BaseModel):
    patient_id: str
    doctor_id: str
    appointment_date: str
    appointment_time: str
    notes: Optional[str] = None

class AppointmentUpdate(BaseModel):
    status: Optional[str] = None  # requested, confirmed, completed, cancelled

# === Referral Schemas ===
class ReferralCreate(BaseModel):
    patient_id: str
    from_doctor_id: str
    to_doctor_id: Optional[str] = None
    to_hospital_id: Optional[str] = None
    reason: str
    urgency: str  # routine, urgent, emergency

class ReferralUpdate(BaseModel):
    status: str  # pending, accepted, completed, expired

# === Triage Schemas ===
class TriageRequest(BaseModel):
    symptoms: str
    patient_id: Optional[str] = None
    language: str = "en"

class TriageResponse(BaseModel):
    level: str  # green, yellow, red, emergency
    label: str
    message: str
    action: str
    confidence: float
    reason: str
    recommendations: List[str] = []
    facilities: List[Dict] = []
    timestamp: str

# === Schemes Schemas ===
class SchemeEligibilityRequest(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = None
    state: Optional[str] = None
    income_category: Optional[str] = None  # BPL, APL, EWS
    is_pregnant: bool = False
    has_disability: bool = False
    has_chronic_condition: bool = False

class SchemeEligibilityResponse(BaseModel):
    scheme_id: str
    name: str
    department: str
    description: str
    eligible: bool
    benefits: List[str] = []
    documents: List[str] = []
    application_url: str
    reason: str

# === ASHA Schemas ===
class AshaTaskCreate(BaseModel):
    household_id: str
    beneficiary_id: Optional[str] = None
    task_type: str
    priority: str = "medium"
    due_date: str
    notes: Optional[str] = None

class AshaTaskUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    notes: Optional[str] = None

class AshaHousehold(BaseModel):
    id: str
    address: str
    family_members: List[Dict] = []
    assigned_asha_id: str
    visit_status: str

class AshaBeneficiary(BaseModel):
    id: str
    name: str
    type: str  # pregnant_woman, infant, child, elderly, chronic
    age: int
    household_id: str
    risk_level: str
    last_visit: str

# === Analytics Schemas ===
class KPIResponse(BaseModel):
    total_consultations: int
    ai_triage_accuracy: float
    avg_response_time: float
    active_asha_workers: int
    bed_occupancy_rate: float
    referral_completion_rate: float

class AlertItem(BaseModel):
    id: str
    severity: str
    title: str
    category: str
    description: str
    location: str
    timestamp: str
    trend: str
    status: str

class ConsultationMetric(BaseModel):
    month: str
    consultations: int
    triage: int
    referrals: int

class RegionData(BaseModel):
    name: str
    type: str
    consultations: int
    status: str

class TriagePerformance(BaseModel):
    accuracy: str
    false_alarms: str
    concordance: str
    detection_time: str

# === Chatbot Schemas ===
class ChatRequest(BaseModel):
    message: str
    patient_id: Optional[str] = None
    session_id: Optional[str] = None
    language: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    session_id: str
    triage_level: Optional[str] = None
    confidence: Optional[float] = None
    reason: Optional[str] = None
    next_question: Optional[str] = None
    is_complete: bool = False

# === Sync Schemas ===
class SyncRequest(BaseModel):
    device_id: str
    actions: List[Dict] = []
    timestamp: str

class SyncResponse(BaseModel):
    status: str
    synced_count: int
    conflicts: List[Dict] = []