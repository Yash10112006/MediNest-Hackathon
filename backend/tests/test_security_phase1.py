# backend/tests/test_security_phase1.py
import unittest
from datetime import datetime, timedelta
from unittest.mock import MagicMock
from jose import jwt
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.core.config import settings
from backend.app.core.security import create_access_token
import backend.app.core.database as db_mod
import backend.app.api.patients as patients_mod
import backend.app.api.doctors as doctors_mod
import backend.app.api.appointments as appointments_mod
import backend.app.api.referrals as referrals_mod
import backend.app.api.asha as asha_mod
import backend.app.api.schemes as schemes_mod
import backend.app.api.auth as auth_mod


class TestMediNestSecurityPhase1(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Mock database dependencies to avoid network calls during test suite
        db_mod.supabase = None
        db_mod.supabase_admin = None
        auth_mod.supabase = None
        auth_mod.supabase_admin = None
        patients_mod.supabase = None
        patients_mod.supabase_admin = None
        doctors_mod.supabase = None
        appointments_mod.supabase = None
        referrals_mod.supabase = None
        asha_mod.supabase = None
        schemes_mod.supabase = None

        cls.client = TestClient(app)

        # Pre-generate valid tokens for test identities
        cls.patient_a_id = "pat-001"
        cls.patient_b_id = "pat-002"
        cls.doctor_a_id = "doc-001"
        cls.doctor_b_id = "doc-002"
        cls.doctor_unassigned_id = "doc-003"
        cls.asha_a_id = "asha-001"
        cls.asha_b_id = "asha-002"
        cls.admin_id = "adm-001"

        cls.patient_a_token = create_access_token({
            "sub": cls.patient_a_id,
            "role": "patient",
            "name": "Ramesh Kumar"
        })
        cls.patient_b_token = create_access_token({
            "sub": cls.patient_b_id,
            "role": "patient",
            "name": "Sunita Devi"
        })
        cls.doctor_a_token = create_access_token({
            "sub": cls.doctor_a_id,
            "role": "doctor",
            "name": "Dr. Rajesh Sharma"
        })
        cls.doctor_b_token = create_access_token({
            "sub": cls.doctor_b_id,
            "role": "doctor",
            "name": "Dr. Priya Patel"
        })
        cls.doctor_unassigned_token = create_access_token({
            "sub": cls.doctor_unassigned_id,
            "role": "doctor",
            "name": "Dr. Anil Verma"
        })
        cls.asha_a_token = create_access_token({
            "sub": cls.asha_a_id,
            "role": "asha",
            "name": "ASHA Sangeeta"
        })
        cls.asha_b_token = create_access_token({
            "sub": cls.asha_b_id,
            "role": "asha",
            "name": "ASHA Anita"
        })
        cls.admin_token = create_access_token({
            "sub": cls.admin_id,
            "role": "hospital_admin",
            "name": "Hospital Admin"
        })

    # =========================================================================
    # TASK A: JWT AUTHENTICATION TESTS
    # =========================================================================

    def test_missing_token_returns_401(self):
        """Protected endpoint with missing token must return 401 Unauthorized"""
        response = self.client.get("/api/auth/me")
        self.assertEqual(response.status_code, 401)
        self.assertIn("WWW-Authenticate", response.headers)

    def test_invalid_token_returns_401(self):
        """Protected endpoint with malformed token must return 401 Unauthorized"""
        headers = {"Authorization": "Bearer not-a-valid-jwt-token"}
        response = self.client.get("/api/auth/me", headers=headers)
        self.assertEqual(response.status_code, 401)

    def test_tampered_token_returns_401(self):
        """Protected endpoint with tampered signature must return 401 Unauthorized"""
        tampered_token = self.patient_a_token[:-5] + "XXXXX"
        headers = {"Authorization": f"Bearer {tampered_token}"}
        response = self.client.get("/api/auth/me", headers=headers)
        self.assertEqual(response.status_code, 401)

    def test_expired_token_returns_401(self):
        """Protected endpoint with expired token must return 401 Unauthorized"""
        expired_token = create_access_token(
            {"sub": "expired-user", "role": "patient"},
            expires_delta=timedelta(seconds=-120)
        )
        headers = {"Authorization": f"Bearer {expired_token}"}
        response = self.client.get("/api/auth/me", headers=headers)
        self.assertEqual(response.status_code, 401)
        self.assertIn("expired", response.json()["detail"].lower())

    def test_valid_token_authenticates_user(self):
        """Valid token successfully returns user identity"""
        headers = {"Authorization": f"Bearer {self.patient_a_token}"}
        response = self.client.get("/api/auth/me", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["user_id"], self.patient_a_id)
        self.assertEqual(data["role"], "patient")

    # =========================================================================
    # PHASE 1.2: STRICT FAIL-CLOSED LOGIN & REGISTRATION SECURITY
    # =========================================================================

    def test_public_registration_cannot_self_grant_privileged_role(self):
        """Public self-registration requesting 'doctor' role must be coerced to 'patient'"""
        register_payload = {
            "email": "dr.fake@example.com",
            "password": "Password123!",
            "name": "Fake Doctor",
            "role": "doctor"
        }
        response = self.client.post("/api/auth/register", json=register_payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["role"], "patient", "Public registration must default active role to patient")

    def test_login_missing_profile_rejects_without_jwt(self):
        """Missing authoritative application profile must reject login with 403 and issue no JWT"""
        login_payload = {
            "email": "unregistered.missing@example.com",
            "password": "Password123!"
        }
        response = self.client.post("/api/auth/login", json=login_payload)
        self.assertEqual(response.status_code, 403)
        self.assertNotIn("access_token", response.json())

    def test_login_untrusted_metadata_doctor_rejected_without_jwt(self):
        """Login with unverified metadata attempting to claim doctor role fails closed without JWT"""
        login_payload = {
            "email": "unverified.doc@example.com",
            "password": "Password123!"
        }
        response = self.client.post("/api/auth/login", json=login_payload)
        self.assertEqual(response.status_code, 403)
        self.assertNotIn("access_token", response.json())

    def test_login_untrusted_metadata_admin_rejected_without_jwt(self):
        """Login with unverified metadata claiming hospital_admin role fails closed without JWT"""
        login_payload = {
            "email": "unverified.admin@example.com",
            "password": "Password123!"
        }
        response = self.client.post("/api/auth/login", json=login_payload)
        self.assertEqual(response.status_code, 403)
        self.assertNotIn("access_token", response.json())

    def test_login_invalid_role_rejected_without_jwt(self):
        """Profile with unsupported role value must be rejected with 403 and issue no JWT"""
        login_payload = {
            "email": "invalid.role@example.com",
            "password": "Password123!"
        }
        response = self.client.post("/api/auth/login", json=login_payload)
        self.assertEqual(response.status_code, 403)
        self.assertNotIn("access_token", response.json())

    def test_login_database_lookup_failure_returns_503_without_jwt(self):
        """Database lookup failure during login must return HTTP 503 without issuing a JWT"""
        mock_supabase = MagicMock()
        mock_auth_user = MagicMock()
        mock_auth_user.id = "mock-uuid-1234"
        mock_auth_res = MagicMock()
        mock_auth_res.user = mock_auth_user
        mock_supabase.auth.sign_in_with_password.return_value = mock_auth_res

        # Simulate database query failure
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.side_effect = Exception("DB Connection Lost")

        original_supabase = auth_mod.supabase
        try:
            auth_mod.supabase = mock_supabase
            login_payload = {
                "email": "patient.ramesh@example.com",
                "password": "Password123!"
            }
            response = self.client.post("/api/auth/login", json=login_payload)
            self.assertEqual(response.status_code, 503)
            self.assertNotIn("access_token", response.json())
        finally:
            auth_mod.supabase = original_supabase

    def test_login_legitimate_patient_succeeds(self):
        """Login for verified legitimate patient returns 200 with patient JWT"""
        login_payload = {
            "email": "patient.ramesh@example.com",
            "password": "Password123!"
        }
        response = self.client.post("/api/auth/login", json=login_payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["role"], "patient")
        self.assertIn("access_token", data)

    def test_login_legitimately_provisioned_doctor_succeeds(self):
        """Login for verified provisioned doctor account returns 200 with doctor JWT"""
        login_payload = {
            "email": "doctor@medinest.gov.in",
            "password": "SecurePassword123!"
        }
        response = self.client.post("/api/auth/login", json=login_payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["role"], "doctor")
        self.assertIn("access_token", data)

    def test_registration_creates_profile_allowing_subsequent_login(self):
        """Normal registration creates valid patient profile and permits subsequent login"""
        unique_email = f"registered.patient.{int(datetime.now().timestamp())}@example.com"
        reg_payload = {
            "email": unique_email,
            "password": "Password123!",
            "name": "New Registered Patient",
            "role": "patient"
        }
        reg_res = self.client.post("/api/auth/register", json=reg_payload)
        self.assertEqual(reg_res.status_code, 200)

        # Login with newly registered user
        login_res = self.client.post("/api/auth/login", json={"email": unique_email, "password": "Password123!"})
        self.assertEqual(login_res.status_code, 200)
        data = login_res.json()
        self.assertEqual(data["role"], "patient")
        self.assertIn("access_token", data)

    # =========================================================================
    # ROLE-BASED ACCESS CONTROL (RBAC) TESTS
    # =========================================================================

    def test_patient_cannot_list_all_patients(self):
        """Patients cannot enumerate patient records across the system"""
        headers = {"Authorization": f"Bearer {self.patient_a_token}"}
        response = self.client.get("/api/patients/", headers=headers)
        self.assertEqual(response.status_code, 403)

    def test_patient_cannot_access_analytics_kpis(self):
        """Patients cannot access administrative system KPIs"""
        headers = {"Authorization": f"Bearer {self.patient_a_token}"}
        response = self.client.get("/api/analytics/kpis", headers=headers)
        self.assertEqual(response.status_code, 403)

    def test_staff_can_access_analytics_kpis(self):
        """Hospital admin can access system KPIs"""
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        response = self.client.get("/api/analytics/kpis", headers=headers)
        self.assertEqual(response.status_code, 200)

    def test_patient_cannot_access_asha_households(self):
        """Patients cannot access ASHA field household rosters"""
        headers = {"Authorization": f"Bearer {self.patient_a_token}"}
        response = self.client.get("/api/asha/households", headers=headers)
        self.assertEqual(response.status_code, 403)

    def test_patient_cannot_create_referral(self):
        """Patients cannot create clinical referrals"""
        headers = {"Authorization": f"Bearer {self.patient_a_token}"}
        payload = {
            "patient_id": self.patient_a_id,
            "from_doctor_id": "doc-001",
            "reason": "Self referral",
            "urgency": "urgent"
        }
        response = self.client.post("/api/referrals/", json=payload, headers=headers)
        self.assertEqual(response.status_code, 403)

    def test_doctor_can_create_referral(self):
        """Doctor can create a referral for an assigned patient"""
        headers = {"Authorization": f"Bearer {self.doctor_a_token}"}
        payload = {
            "patient_id": self.patient_a_id,
            "from_doctor_id": self.doctor_a_id,
            "to_hospital_id": "hosp-khargone",
            "reason": "Specialist consultation",
            "urgency": "urgent"
        }
        response = self.client.post("/api/referrals/", json=payload, headers=headers)
        self.assertEqual(response.status_code, 200)

    # =========================================================================
    # DOCTOR PATIENT ACCESS & APPOINTMENT SCOPING
    # =========================================================================

    def test_doctor_a_cannot_see_doctor_b_appointments_roster(self):
        """Doctor A cannot view Doctor B's private appointment roster"""
        headers = {"Authorization": f"Bearer {self.doctor_a_token}"}
        response = self.client.get(f"/api/doctors/{self.doctor_b_id}/appointments", headers=headers)
        self.assertEqual(response.status_code, 403)

    def test_doctor_a_cannot_see_doctor_b_appointments_in_feed(self):
        """Doctor A only receives their own appointments; never receives Doctor B's"""
        headers = {"Authorization": f"Bearer {self.doctor_a_token}"}
        response = self.client.get("/api/appointments/", headers=headers)
        self.assertEqual(response.status_code, 200)
        apts = response.json()
        for a in apts:
            self.assertEqual(a.get("doctor_id"), self.doctor_a_id)

    def test_doctor_without_appointments_receives_empty_list(self):
        """Doctor with no appointments receives [] instead of MOCK_APPOINTMENTS fallback"""
        headers = {"Authorization": f"Bearer {self.doctor_unassigned_token}"}
        response = self.client.get("/api/appointments/", headers=headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [])

    def test_doctor_a_cannot_access_unassigned_patient_records(self):
        """Doctor A cannot access clinical medical records for unassigned Patient B"""
        headers = {"Authorization": f"Bearer {self.doctor_a_token}"}
        response = self.client.get(f"/api/patients/{self.patient_b_id}/records", headers=headers)
        self.assertEqual(response.status_code, 403)

    def test_doctor_a_can_access_assigned_patient_records(self):
        """Doctor A can access medical records for assigned Patient A"""
        headers = {"Authorization": f"Bearer {self.doctor_a_token}"}
        response = self.client.get(f"/api/patients/{self.patient_a_id}/records", headers=headers)
        self.assertEqual(response.status_code, 200)

    def test_doctor_unassigned_cannot_access_patient_profile(self):
        """Doctor with no relationship to Patient A cannot access patient profile"""
        headers = {"Authorization": f"Bearer {self.doctor_unassigned_token}"}
        response = self.client.get(f"/api/patients/{self.patient_a_id}", headers=headers)
        self.assertEqual(response.status_code, 403)

    def test_doctor_a_cannot_modify_doctor_b_appointment(self):
        """Doctor A cannot modify or cancel Doctor B's appointment apt-102"""
        headers = {"Authorization": f"Bearer {self.doctor_a_token}"}
        update_payload = {"status": "confirmed"}
        response = self.client.put("/api/appointments/apt-102", json=update_payload, headers=headers)
        self.assertEqual(response.status_code, 403)

    # =========================================================================
    # ASHA ACCESS & TASK SCOPING
    # =========================================================================

    def test_asha_a_can_retrieve_assigned_households(self):
        """ASHA A retrieves their assigned households"""
        headers = {"Authorization": f"Bearer {self.asha_a_token}"}
        response = self.client.get("/api/asha/households", headers=headers)
        self.assertEqual(response.status_code, 200)
        households = response.json()
        self.assertGreater(len(households), 0)
        for h in households:
            self.assertEqual(h.get("assigned_asha_id"), self.asha_a_id)

    def test_asha_b_cannot_retrieve_asha_a_households(self):
        """ASHA B receives [] because mock households are assigned to ASHA A"""
        headers = {"Authorization": f"Bearer {self.asha_b_token}"}
        response = self.client.get("/api/asha/households", headers=headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [])

    def test_asha_b_cannot_access_asha_a_beneficiaries(self):
        """ASHA B receives [] for beneficiaries in ASHA A's households"""
        headers = {"Authorization": f"Bearer {self.asha_b_token}"}
        response = self.client.get("/api/asha/beneficiaries", headers=headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [])

    def test_asha_cannot_create_task_for_unassigned_household(self):
        """ASHA worker cannot create a field task for a household outside assigned sector"""
        headers = {"Authorization": f"Bearer {self.asha_a_token}"}
        task_payload = {
            "household_id": "hh-unassigned-sector",
            "task_type": "Immunization Check",
            "due_date": "2026-09-01"
        }
        response = self.client.post("/api/asha/tasks", json=task_payload, headers=headers)
        self.assertEqual(response.status_code, 403)

    def test_asha_cannot_update_task_in_unassigned_household(self):
        """ASHA B cannot update a task belonging to ASHA A's household"""
        headers = {"Authorization": f"Bearer {self.asha_b_token}"}
        update_payload = {"status": "completed"}
        response = self.client.put("/api/asha/tasks/tsk-001", json=update_payload, headers=headers)
        self.assertEqual(response.status_code, 403)

    def test_offline_sync_restricted_to_asha(self):
        """Patients and doctors cannot invoke ASHA offline synchronization"""
        sync_payload = {
            "device_id": "test-device",
            "actions": [],
            "timestamp": "2026-08-30T10:00:00Z"
        }
        # Patient rejected
        headers_pat = {"Authorization": f"Bearer {self.patient_a_token}"}
        res_pat = self.client.post("/api/sync/", json=sync_payload, headers=headers_pat)
        self.assertEqual(res_pat.status_code, 403)

        # Doctor rejected
        headers_doc = {"Authorization": f"Bearer {self.doctor_a_token}"}
        res_doc = self.client.post("/api/sync/", json=sync_payload, headers=headers_doc)
        self.assertEqual(res_doc.status_code, 403)

        # ASHA permitted
        headers_asha = {"Authorization": f"Bearer {self.asha_a_token}"}
        res_asha = self.client.post("/api/sync/", json=sync_payload, headers=headers_asha)
        self.assertEqual(res_asha.status_code, 200)

    # =========================================================================
    # REFERRAL ACCESS & MUTATION SCOPING
    # =========================================================================

    def test_doctor_unrelated_cannot_access_referral(self):
        """Doctor unassigned to referral ref-301 cannot access it"""
        headers = {"Authorization": f"Bearer {self.doctor_unassigned_token}"}
        response = self.client.get("/api/referrals/ref-301", headers=headers)
        self.assertEqual(response.status_code, 403)

    def test_doctor_assigned_can_access_referral(self):
        """Doctor A (referring doctor on ref-301) can access referral"""
        headers = {"Authorization": f"Bearer {self.doctor_a_token}"}
        response = self.client.get("/api/referrals/ref-301", headers=headers)
        self.assertEqual(response.status_code, 200)

    def test_patient_cannot_approve_or_modify_referral(self):
        """Patient cannot modify referral status"""
        headers = {"Authorization": f"Bearer {self.patient_a_token}"}
        update_payload = {"status": "accepted"}
        response = self.client.put("/api/referrals/ref-301", json=update_payload, headers=headers)
        self.assertEqual(response.status_code, 403)

    def test_doctor_unassigned_cannot_modify_referral(self):
        """Doctor unassigned to referral cannot modify its status"""
        headers = {"Authorization": f"Bearer {self.doctor_unassigned_token}"}
        update_payload = {"status": "accepted"}
        response = self.client.put("/api/referrals/ref-301", json=update_payload, headers=headers)
        self.assertEqual(response.status_code, 403)

    # =========================================================================
    # PATIENT DATA OWNERSHIP & MUTATION IDOR TESTS
    # =========================================================================

    def test_patient_a_cannot_modify_patient_b_profile(self):
        """Patient A cannot update Patient B's profile"""
        headers = {"Authorization": f"Bearer {self.patient_a_token}"}
        update_payload = {"name": "Hacked Name"}
        response = self.client.put(f"/api/patients/{self.patient_b_id}", json=update_payload, headers=headers)
        self.assertEqual(response.status_code, 403)

    def test_patient_a_can_modify_own_profile(self):
        """Patient A can update their own profile"""
        headers = {"Authorization": f"Bearer {self.patient_a_token}"}
        update_payload = {"name": "Ramesh Kumar Updated"}
        response = self.client.put(f"/api/patients/{self.patient_a_id}", json=update_payload, headers=headers)
        self.assertEqual(response.status_code, 200)

    def test_patient_a_cannot_cancel_or_modify_patient_b_appointment(self):
        """Patient A cannot modify or cancel Patient B's appointment apt-102"""
        headers = {"Authorization": f"Bearer {self.patient_a_token}"}
        update_payload = {"status": "cancelled"}
        response = self.client.put("/api/appointments/apt-102", json=update_payload, headers=headers)
        self.assertEqual(response.status_code, 403)

    def test_patient_a_can_cancel_own_appointment(self):
        """Patient A can cancel their own appointment apt-101"""
        headers = {"Authorization": f"Bearer {self.patient_a_token}"}
        update_payload = {"status": "cancelled"}
        response = self.client.put("/api/appointments/apt-101", json=update_payload, headers=headers)
        self.assertEqual(response.status_code, 200)

    def test_patient_cannot_access_other_patient_profile(self):
        """Patient A cannot view Patient B's profile by ID"""
        headers = {"Authorization": f"Bearer {self.patient_a_token}"}
        response = self.client.get(f"/api/patients/{self.patient_b_id}", headers=headers)
        self.assertEqual(response.status_code, 403)

    def test_patient_cannot_view_other_patient_medical_records(self):
        """Patient A cannot read Patient B's medical records"""
        headers = {"Authorization": f"Bearer {self.patient_a_token}"}
        response = self.client.get(f"/api/patients/{self.patient_b_id}/records", headers=headers)
        self.assertEqual(response.status_code, 403)

    def test_hospital_admin_cannot_view_clinical_medical_records(self):
        """Hospital administrator cannot view private clinical medical records"""
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        response = self.client.get(f"/api/patients/{self.patient_b_id}/records", headers=headers)
        self.assertEqual(response.status_code, 403)

    def test_patient_cannot_create_appointment_for_another_patient(self):
        """Patient A cannot book an appointment under Patient B's identity"""
        headers = {"Authorization": f"Bearer {self.patient_a_token}"}
        payload = {
            "patient_id": self.patient_b_id,
            "doctor_id": "doc-001",
            "appointment_date": "2026-09-01",
            "appointment_time": "11:00 AM",
            "notes": "Impersonated appointment"
        }
        response = self.client.post("/api/appointments/", json=payload, headers=headers)
        self.assertEqual(response.status_code, 403)

    # =========================================================================
    # CHATBOT & TRIAGE IDOR TESTS
    # =========================================================================

    def test_patient_a_cannot_access_patient_b_chatbot_history(self):
        """Patient A cannot retrieve Patient B's private consultation history"""
        headers = {"Authorization": f"Bearer {self.patient_a_token}"}
        response = self.client.get(f"/api/chatbot/history/{self.patient_b_id}", headers=headers)
        self.assertEqual(response.status_code, 403)

    def test_patient_a_can_access_own_chatbot_history(self):
        """Patient A can retrieve their own chat history"""
        headers = {"Authorization": f"Bearer {self.patient_a_token}"}
        response = self.client.get(f"/api/chatbot/history/{self.patient_a_id}", headers=headers)
        self.assertEqual(response.status_code, 200)

    def test_patient_a_cannot_submit_chatbot_query_under_patient_b_id(self):
        """Patient A cannot submit a chat query claiming to be Patient B"""
        headers = {"Authorization": f"Bearer {self.patient_a_token}"}
        chat_payload = {
            "message": "I have high fever",
            "patient_id": self.patient_b_id
        }
        response = self.client.post("/api/chatbot/message", json=chat_payload, headers=headers)
        self.assertEqual(response.status_code, 403)

    def test_patient_a_cannot_spoof_patient_id_in_triage(self):
        """Patient A cannot run clinical triage analysis under Patient B's ID"""
        headers = {"Authorization": f"Bearer {self.patient_a_token}"}
        triage_payload = {
            "symptoms": "Severe chest pain and difficulty breathing",
            "patient_id": self.patient_b_id
        }
        response = self.client.post("/api/triage/analyze", json=triage_payload, headers=headers)
        self.assertEqual(response.status_code, 403)

    def test_patient_cannot_access_doctor_appointment_roster(self):
        """Patient cannot access a doctor's full appointments roster"""
        headers = {"Authorization": f"Bearer {self.patient_a_token}"}
        response = self.client.get(f"/api/doctors/{self.doctor_a_id}/appointments", headers=headers)
        self.assertEqual(response.status_code, 403)

    # =========================================================================
    # PUBLIC ENDPOINT PRESERVATION TESTS
    # =========================================================================

    def test_root_is_public(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)

    def test_health_check_is_public(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)

    def test_schemes_are_public(self):
        response = self.client.get("/api/schemes/")
        self.assertEqual(response.status_code, 200)

    def test_triage_levels_are_public(self):
        response = self.client.get("/api/triage/levels")
        self.assertEqual(response.status_code, 200)

    def test_doctors_directory_is_public(self):
        response = self.client.get("/api/doctors/")
        self.assertEqual(response.status_code, 200)


if __name__ == "__main__":
    unittest.main()
