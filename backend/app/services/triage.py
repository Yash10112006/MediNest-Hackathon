from typing import Dict, List, Optional
from datetime import datetime


class TriageEngine:
    """
    MediNest Deterministic Triage Engine

    Purpose:
        - Detect emergency situations
        - Analyze the complete conversation
        - Prevent dangerous symptoms from being downgraded
        - Provide a deterministic safety classification

    Gemini handles:
        - Conversation
        - Follow-up questions
        - Natural language understanding

    TriageEngine handles:
        - Safety classification
        - Emergency detection
    """

    def __init__(self):

        # =========================================================
        # 1. EXPLICIT EMERGENCY KEYWORDS
        # =========================================================

        self.emergency_keywords = [
            "not breathing",
            "unconscious",
            "heavy bleeding",
            "severe bleeding",
            "uncontrolled bleeding",
            "seizure",
            "suicide",
            "self harm",
            "self-harm",
            "heart attack",
            "stroke",
            "paralysis",
            "cannot move",
            "can't move",
            "choking",
            "anaphylaxis",
            "severe allergic reaction",
        ]

        # =========================================================
        # 2. HIGH-RISK SYMPTOMS
        # =========================================================

        self.high_risk_patterns = {
            "chest": [
                "chest pain",
                "chest tightness",
                "chest discomfort",
            ],

            "breathing": [
                "difficulty breathing",
                "breathing difficulty",
                "shortness of breath",
                "can't breathe",
                "cannot breathe",
                "trouble breathing",
            ],

            "head": [
                "severe headache",
                "head injury",
                "dizziness",
                "fainting",
                "passed out",
            ],

            "abdomen": [
                "severe abdominal pain",
                "vomiting blood",
                "blood in vomit",
            ],

            "limbs": [
                "numbness",
                "weakness",
                "cannot move",
                "can't move",
            ],

            "vision": [
                "blurred vision",
                "double vision",
                "vision loss",
                "cannot see",
                "can't see",
            ],

            "speech": [
                "slurred speech",
                "difficulty speaking",
                "cannot speak",
                "can't speak",
            ],
        }

        # =========================================================
        # 3. TRIAGE RESPONSE TEMPLATES
        # =========================================================

        self.triage_responses = {

            "emergency": {
                "label": "🔴🔴 EMERGENCY",
                "message": (
                    "Possible medical emergency. "
                    "Immediate medical attention is required."
                ),
                "action": (
                    "Call 112/108 immediately or go to the "
                    "nearest emergency department."
                ),
            },

            "red": {
                "label": "🔴 HIGH RISK",
                "message": (
                    "Urgent medical attention may be required."
                ),
                "action": (
                    "Visit the nearest hospital as soon as possible."
                ),
            },

            "yellow": {
                "label": "🟡 MODERATE RISK",
                "message": (
                    "Medical evaluation may be needed."
                ),
                "action": (
                    "Visit the nearest PHC/CHC or consult a doctor."
                ),
            },

            "green": {
                "label": "🟢 LOW RISK",
                "message": (
                    "No immediate warning signs were detected."
                ),
                "action": (
                    "Monitor your symptoms and seek medical care "
                    "if they worsen or persist."
                ),
            },
        }

        # =========================================================
        # 4. RISK FACTORS
        # =========================================================

        self.risk_factors = [
            "diabetes",
            "hypertension",
            "high blood pressure",
            "heart disease",
            "asthma",
            "pregnant",
            "pregnancy",
            "elderly",
            "cancer",
            "tb",
            "tuberculosis",
            "kidney disease",
            "liver disease",
        ]

    # =============================================================
    # MAIN ANALYSIS FUNCTION
    # =============================================================

    def analyze(
        self,
        symptoms: str,
        patient_context: Optional[Dict] = None
    ) -> Dict:

        if not symptoms or len(symptoms.strip()) < 3:

            return self._get_result(
                "green",
                "Please provide more details about your symptoms.",
                1.0
            )

        symptoms_lower = symptoms.lower()

        # =========================================================
        # STEP 1 — EXPLICIT EMERGENCY DETECTION
        # =========================================================

        for keyword in self.emergency_keywords:

            if keyword in symptoms_lower:

                return self._get_result(
                    "emergency",
                    f"Crisis keyword detected: '{keyword}'.",
                    0.98
                )

        # =========================================================
        # STEP 2 — CHEST PAIN + BREATHING DIFFICULTY
        #
        # This is especially important for your chatbot.
        #
        # Example:
        #
        # Patient:
        # "I have chest pain"
        #
        # Later:
        # "I am having difficulty breathing"
        #
        # Because the complete conversation is analyzed,
        # both symptoms are detected.
        # =========================================================

        has_chest_pain = (
            "chest pain" in symptoms_lower
            or "chest tightness" in symptoms_lower
            or "chest discomfort" in symptoms_lower
        )

        has_breathing_problem = (
            "difficulty breathing" in symptoms_lower
            or "breathing difficulty" in symptoms_lower
            or "shortness of breath" in symptoms_lower
            or "trouble breathing" in symptoms_lower
            or "can't breathe" in symptoms_lower
            or "cannot breathe" in symptoms_lower
        )

        if has_chest_pain and has_breathing_problem:

            return self._get_result(
                "emergency",
                (
                    "Chest pain combined with breathing difficulty "
                    "requires immediate emergency assessment."
                ),
                0.95
            )

        # =========================================================
        # STEP 3 — CHEST PAIN + SEVERE PAIN
        # =========================================================

        severe_chest_indicators = [
            "severe chest pain",
            "very severe chest pain",
            "extreme chest pain",
            "worst chest pain",
            "10/10 chest pain",
            "9/10 chest pain",
        ]

        if any(
            indicator in symptoms_lower
            for indicator in severe_chest_indicators
        ):

            return self._get_result(
                "emergency",
                "Severe chest pain requires immediate medical assessment.",
                0.93
            )

        # =========================================================
        # STEP 4 — CHEST PAIN + OTHER WARNING SIGNS
        # =========================================================

        chest_warning_signs = [
            "sweating",
            "cold sweat",
            "nausea",
            "vomiting",
            "dizziness",
            "fainting",
            "pain spreading to arm",
            "pain spreading to shoulder",
            "pain spreading to jaw",
            "pain spreading to back",
        ]

        chest_warning_found = [
            sign
            for sign in chest_warning_signs
            if sign in symptoms_lower
        ]

        if has_chest_pain and chest_warning_found:

            return self._get_result(
                "emergency",
                (
                    "Chest pain with additional warning signs "
                    "requires immediate medical assessment."
                ),
                0.92
            )

        # =========================================================
        # STEP 5 — FIND HIGH-RISK SYMPTOMS
        # =========================================================

        high_risk_found = []

        for category, patterns in self.high_risk_patterns.items():

            for pattern in patterns:

                if pattern in symptoms_lower:

                    if pattern not in high_risk_found:
                        high_risk_found.append(pattern)

        # =========================================================
        # STEP 6 — MULTIPLE HIGH-RISK SYMPTOMS
        # =========================================================

        if len(high_risk_found) >= 2:

            return self._get_result(
                "red",
                (
                    "Multiple high-risk symptoms detected: "
                    + ", ".join(high_risk_found)
                    + ". Urgent medical assessment is recommended."
                ),
                0.88
            )

        # =========================================================
        # STEP 7 — SINGLE HIGH-RISK SYMPTOM
        # =========================================================

        if len(high_risk_found) == 1:

            symptom = high_risk_found[0]

            if self._has_risk_factors(patient_context):

                return self._get_result(
                    "yellow",
                    (
                        f"{symptom} detected with existing "
                        "risk factors."
                    ),
                    0.75
                )

            return self._get_result(
                "yellow",
                (
                    f"{symptom} detected. "
                    "Further assessment is recommended."
                ),
                0.65
            )

        # =========================================================
        # STEP 8 — PERSISTENT FEVER
        # =========================================================

        duration_keywords = [
            "days",
            "week",
            "weeks",
            "month",
            "months",
            "persistent",
            "continuing",
            "for a long time",
        ]

        has_duration = any(
            keyword in symptoms_lower
            for keyword in duration_keywords
        )

        if has_duration:

            if (
                "fever" in symptoms_lower
                or "temperature" in symptoms_lower
            ):

                return self._get_result(
                    "yellow",
                    "Persistent fever may require medical evaluation.",
                    0.70
                )

        # =========================================================
        # STEP 9 — RISK FACTORS
        # =========================================================

        if self._has_risk_factors(patient_context):

            concerning_symptoms = [
                "pain",
                "fever",
                "cough",
                "vomiting",
                "diarrhea",
            ]

            if any(
                symptom in symptoms_lower
                for symptom in concerning_symptoms
            ):

                return self._get_result(
                    "yellow",
                    "Symptoms are present with existing risk factors.",
                    0.70
                )

        # =========================================================
        # STEP 10 — DEFAULT GREEN
        # =========================================================

        return self._get_result(
            "green",
            "No immediate warning signs detected. Continue monitoring.",
            0.75
        )

    # =============================================================
    # FORMAT RESULT
    # =============================================================

    def _get_result(
        self,
        level: str,
        reason: str,
        confidence: float
    ) -> Dict:

        response = self.triage_responses.get(
            level,
            self.triage_responses["green"]
        )

        return {
            "level": level,
            "label": response["label"],
            "message": response["message"],
            "action": response["action"],
            "confidence": confidence,
            "reason": reason,
            "timestamp": datetime.now().isoformat(),
        }

    # =============================================================
    # CHECK PATIENT RISK FACTORS
    # =============================================================

    def _has_risk_factors(
        self,
        context: Optional[Dict]
    ) -> bool:

        if not context:
            return False

        conditions = context.get("conditions", [])
        age = context.get("age", 0)

        # ---------------------------------------------------------
        # Check medical conditions
        # ---------------------------------------------------------

        for factor in self.risk_factors:

            for condition in conditions:

                if factor in condition.lower():

                    return True

        # ---------------------------------------------------------
        # Age > 60
        # ---------------------------------------------------------

        if age > 60:
            return True

        return False

    # =============================================================
    # RECOMMENDATIONS
    # =============================================================

    def get_recommendations(
        self,
        level: str
    ) -> List[str]:

        recommendations = {

            "emergency": [
                "⚠️ CALL 112/108 IMMEDIATELY",
                "Seek emergency medical care immediately",
                "Do not drive yourself if seriously unwell",
                "Have your medical records available if possible",
                "Do not delay emergency treatment",
            ],

            "red": [
                "Visit the nearest hospital as soon as possible",
                "Do not delay medical evaluation",
                "Carry your medical records",
                "Take someone with you if possible",
                "Inform the healthcare professional about your symptoms",
            ],

            "yellow": [
                "Visit the nearest PHC/CHC or consult a doctor",
                "Carry your medical records",
                "Monitor your symptoms closely",
                "Follow existing prescriptions as directed",
                "Seek earlier care if symptoms worsen",
            ],

            "green": [
                "Monitor your symptoms",
                "Rest and stay hydrated if appropriate",
                "Seek medical care if symptoms worsen",
                "Consult a doctor if symptoms persist",
            ],
        }

        return recommendations.get(
            level,
            recommendations["green"]
        )