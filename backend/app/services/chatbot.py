# backend/app/services/chatbot.py

import asyncio
import logging
import re
import time
import uuid
from typing import Dict, Optional

from google import genai
from google.genai import types

from .triage import TriageEngine
from ..core.config import settings

logger = logging.getLogger(__name__)


def detect_language(text: str) -> str:
    """Detect language context (Hindi/Hinglish vs English) to inform Gemini."""
    if not text:
        return "English"
    if re.search(r"[\u0900-\u097F]", text):
        return "Hindi"
    hinglish_keywords = {
        "mere", "meri", "mera", "mujhe", "pet", "dard", "hai", "hain",
        "bahut", "bukhar", "sir", "sirdard", "ulti", "kamzori", "chakkar",
        "din", "se", "kal", "kuch", "nahi", "kya", "batao", "hona", "peeda",
        "saans", "khansi", "dast", "peshab", "khana", "paani", "lag", "raha", "rahi"
    }
    words = set(re.findall(r"\b\w+\b", text.lower()))
    if words.intersection(hinglish_keywords):
        return "Hindi/Hinglish"
    return "English"


class MedicalChatbotService:
    """
    MediNest AI Healthcare Conversational Assistant (Gemini-First Architecture).

    Architecture:
        1. Duplicate message protection (prevents redundant processing of double submissions)
        2. Deterministic TriageEngine safety analysis
        3. Emergency firewall (Bypasses Gemini immediately if red-flags detected)
        4. Gemini AI generation:
           - Full conversation history + clinical triage context provided
           - Gemini independently decides what to say and what follow-up question is useful
           - Natural language, empathetic, concise (1-2 sentences)
        5. Graceful quota/timeout handling with automatic cooldown recovery:
           - On 429 RESOURCE_EXHAUSTED: activates cooldown and returns safe temporary message
           - After cooldown: automatically resumes calling Gemini
    """

    def __init__(self, model: Optional[str] = None):
        self.triage_engine = TriageEngine()

        # Quota management & recovery cooldown
        self.gemini_quota_exhausted = False
        self.gemini_quota_retry_at: Optional[float] = None
        self.quota_cooldown_seconds = 60.0

        if not settings.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is missing from backend/.env")

        http_options = types.HttpOptions(
            timeout=60000,  # 60s socket timeout
            retry_options=types.HttpRetryOptions(attempts=1),
        )

        self.client = genai.Client(
            api_key=settings.GEMINI_API_KEY,
            http_options=http_options,
        )

        self.model = (
            model
            or getattr(settings, "GEMINI_MODEL", None)
            or "gemini-3.6-flash"
        )

        self.app_timeout = 65.0
        self.max_history_messages = 10

        # Isolated in-memory sessions:
        # { session_id: { "messages": [...], "language": "English"|"Hindi" } }
        self.sessions: Dict[str, Dict] = {}

    def _call_gemini(self, prompt: str) -> str:
        """Call Gemini and return the complete generated response."""
        response = self.client.models.generate_content(
            model=self.model,
            contents=prompt,
            config=types.GenerateContentConfig(
                max_output_tokens=2048,
                temperature=0.7,
                automatic_function_calling=types.AutomaticFunctionCallingConfig(
                    disable=True
                ),
            ),
        )

        print("[GEMINI DEBUG] Response received")
        print("[GEMINI DEBUG] Response type:", type(response).__name__)

        # ---------------------------------------------------------
        # PRIMARY: Gemini SDK's response.text
        # ---------------------------------------------------------
        complete_text = ""
        try:
            if response.text:
                complete_text = response.text.strip()
                print("[GEMINI DEBUG] response.text length:", len(complete_text))
        except Exception as e:
            print("[GEMINI DEBUG] response.text unavailable:", e)

        # ---------------------------------------------------------
        # FALLBACK: reconstruct text from candidates/parts
        # ---------------------------------------------------------
        if not complete_text:
            text_parts = []
            for candidate in (response.candidates or []):
                content = getattr(candidate, "content", None)
                if not content:
                    continue
                for part in (getattr(content, "parts", None) or []):
                    part_text = getattr(part, "text", None)
                    if part_text:
                        text_parts.append(part_text)
            complete_text = "".join(text_parts).strip()

        # ---------------------------------------------------------
        # NEVER RETURN AN EMPTY RESPONSE
        # ---------------------------------------------------------
        if not complete_text:
            raise ValueError("Gemini returned an empty response.")

        print("[GEMINI DEBUG] FINAL RESPONSE:", repr(complete_text))
        print("[GEMINI DEBUG] FINAL LENGTH:", len(complete_text))

        return complete_text

    def _build_conversation(self, messages) -> str:
        """Format recent conversation history."""
        recent = messages[-self.max_history_messages:]
        lines = []
        for item in recent:
            role = item["role"].upper()
            content = item["content"].strip()
            lines.append(f"{role}: {content}")
        return "\n".join(lines)

    async def generate_response(
        self,
        message: str,
        patient_id: Optional[str] = None,
        session_id: Optional[str] = None,
        language: Optional[str] = None,
    ) -> Dict:

        # ---------------------------------------------------------
        # 1. VALIDATE MESSAGE INPUT
        # ---------------------------------------------------------
        if not message or not message.strip():
            return {
                "response": (
                    "Please describe the health problem or symptoms you are experiencing so I can assist you."
                ),
                "session_id": session_id or str(uuid.uuid4()),
                "triage_level": "green",
                "confidence": 1.0,
                "reason": "No symptom information provided.",
                "next_question": None,
                "is_complete": False,
            }

        message = message.strip()

        # ---------------------------------------------------------
        # 2. SESSION INITIALIZATION & ISOLATION
        # ---------------------------------------------------------
        if not session_id:
            session_id = str(uuid.uuid4())

        if session_id not in self.sessions:
            self.sessions[session_id] = {
                "messages": [],
                "language": "English",
            }

        session = self.sessions[session_id]

        if language:
            clean_lang = language.lower()
            if "mr" in clean_lang or "marathi" in clean_lang:
                session["language"] = "Marathi"
            elif "hi" in clean_lang or "hindi" in clean_lang:
                session["language"] = "Hindi"
            elif "en" in clean_lang or "english" in clean_lang:
                session["language"] = "English"
        else:
            detected_lang = detect_language(message)
            if detected_lang != "English":
                session["language"] = detected_lang

        lang = session.get("language", "English")

        # ---------------------------------------------------------
        # 3. DUPLICATE MESSAGE PROTECTION
        # ---------------------------------------------------------
        last_patient_msg = next((m for m in reversed(session["messages"]) if m["role"] == "patient"), None)
        if last_patient_msg and last_patient_msg["content"].strip().lower() == message.lower():
            print(f"[TRIAGE] session={session_id}: Duplicate patient message detected. Returning previous response.")
            last_assistant_msg = next((m for m in reversed(session["messages"]) if m["role"] == "assistant"), None)
            dup_reply = (
                last_assistant_msg["content"]
                if last_assistant_msg
                else "I have already received your message. Please share any additional details you would like to add."
            )
            return {
                "response": dup_reply,
                "session_id": session_id,
                "triage_level": "green",
                "confidence": 0.75,
                "reason": "Duplicate patient message received.",
                "next_question": None,
                "is_complete": False,
            }

        # ---------------------------------------------------------
        # 4. SAVE PATIENT MESSAGE & BUILD HISTORY
        # ---------------------------------------------------------
        session["messages"].append({
            "role": "patient",
            "content": message,
        })
        session["messages"] = session["messages"][-self.max_history_messages:]
        conversation_text = self._build_conversation(session["messages"])

        # ---------------------------------------------------------
        # 5. DETERMINISTIC SAFETY ANALYSIS
        # ---------------------------------------------------------
        triage_res = self.triage_engine.analyze(conversation_text)
        triage_level = triage_res.get("level", "green")
        triage_reason = triage_res.get("reason", "Standard symptom assessment.")
        confidence = triage_res.get("confidence", 0.85)

        print(f"[TRIAGE] session={session_id}, detected_level={triage_level}, reason={triage_reason}")

        # ---------------------------------------------------------
        # 6. EMERGENCY FIREWALL (DETERMINISTIC OVERRIDE - NO GEMINI)
        # ---------------------------------------------------------
        if triage_level == "emergency":
            print(f"[TRIAGE] session={session_id}: EMERGENCY WARNING TRIGGERED. Gemini bypassed.")
            if lang == "Marathi":
                emergency_text = (
                    "🚨 तातडीचा वैद्यकीय इशारा (EMERGENCY WARNING)\n\n"
                    "तुमच्या लक्षणांवरून गंभीर वैद्यकीय आणीबाणीची स्थिती असू शकते. "
                    "कृपया तात्काळ १०८ किंवा ११२ वर कॉल करा किंवा जवळच्या रुग्णालयात जा. "
                    "उशीर न करता तात्काळ वैद्यकीय मदत घ्या."
                )
            elif lang == "Hindi":
                emergency_text = (
                    "🚨 आपातकालीन चेतावनी (EMERGENCY WARNING)\n\n"
                    "आपके द्वारा बताए गए लक्षण गंभीर आपातकालीन स्थिति का संकेत हो सकते हैं। "
                    "कृपया तुरंत नजदीकी अस्पताल जाएं या 112/108 आपातकालीन सेवा पर कॉल करें। "
                    "तत्काल चिकित्सीय सहायता प्राप्त करें।"
                )
            else:
                emergency_text = (
                    "🚨 EMERGENCY WARNING\n\n"
                    "Your symptoms may indicate a medical emergency. "
                    "Please call 112/108 or seek emergency medical care immediately. "
                    "Do not wait for further triage."
                )

            session["messages"].append({
                "role": "assistant",
                "content": emergency_text,
            })

            return {
                "response": emergency_text,
                "session_id": session_id,
                "triage_level": "emergency",
                "confidence": triage_res.get("confidence", 0.98),
                "reason": triage_reason,
                "next_question": None,
                "is_complete": True,
            }

        # ---------------------------------------------------------
        # 7. QUOTA COOLDOWN RECOVERY CHECK
        # ---------------------------------------------------------
        now = time.time()
        if self.gemini_quota_exhausted:
            if self.gemini_quota_retry_at is not None and now >= self.gemini_quota_retry_at:
                print(f"[GEMINI] Quota cooldown of {self.quota_cooldown_seconds}s expired. Attempting Gemini again.")
                self.gemini_quota_exhausted = False
                self.gemini_quota_retry_at = None
            else:
                remaining = round((self.gemini_quota_retry_at - now), 1) if self.gemini_quota_retry_at else 0
                print(f"[GEMINI] Quota currently exhausted (cooldown remaining: {remaining}s). Using safe fallback.")
                if lang == "Marathi":
                    fallback_msg = (
                        "तात्पुरत्या स्वरूपात AI सहाय्यक अनुपलब्ध आहे. कृपया थोड्या वेळाने पुन्हा प्रयत्न करा. "
                        "जर तुमची लक्षणे गंभीर असतील, तर कृपया जवळच्या प्राथमिक आरोग्य केंद्रात (PHC) किंवा डॉक्टरांकडे जा."
                    )
                elif lang == "Hindi":
                    fallback_msg = (
                        "अस्थायी रूप से AI सहायक अनुपलब्ध है। कृपया कुछ देर बाद पुनः प्रयास करें। "
                        "यदि आपके लक्षण गंभीर हैं या बढ़ रहे हैं, तो तुरंत नजदीकी स्वास्थ्य केंद्र (PHC) या डॉक्टर से संपर्क करें।"
                    )
                else:
                    fallback_msg = (
                        "I am temporarily unable to access the AI assistant. Please try again shortly. "
                        "If your symptoms are severe or worsening, please seek medical care at your nearest Primary Health Centre (PHC) or clinic."
                    )

                session["messages"].append({
                    "role": "assistant",
                    "content": fallback_msg,
                })
                return {
                    "response": fallback_msg,
                    "session_id": session_id,
                    "triage_level": triage_level,
                    "confidence": confidence,
                    "reason": triage_reason,
                    "next_question": None,
                    "is_complete": False,
                }

        # ---------------------------------------------------------
        # 8. GEMINI CONVERSATIONAL PROMPT
        # ---------------------------------------------------------
        prompt = f"""
You are MediNest, an AI healthcare triage assistant designed to help patients in rural India.

You are NOT a doctor and must not provide a definitive diagnosis.

Have a natural, empathetic conversation with the patient.

Analyze the patient's current message together with the conversation history.

Ask only the most useful follow-up question when more information is needed.

Do NOT follow a fixed questionnaire.

Do NOT ask questions that the patient has already answered.

If the patient already provided duration, severity, location, associated symptoms, or other relevant information, use that information instead of asking for it again.

Adapt your response to what the patient actually says.

Keep responses concise, clear, and easy to understand (1-2 sentences).

Selected Language for this session: {lang}
If the session language is Marathi or the patient uses Marathi, respond naturally and clearly in polite Marathi (मराठी).
If the session language is Hindi or the patient uses Hindi/Hinglish, respond naturally in Hindi (हिंदी).
If the session language is English, respond in simple, clear English.

Do not claim certainty or provide a confirmed diagnosis.

If symptoms sound concerning but are not clearly an emergency, recommend appropriate professional medical evaluation.

Conversation history:
{conversation_text}

Latest patient message:
{message}

Triage information:
Level: {triage_level}
Reason: {triage_reason}

Return ONLY the patient-facing response.
"""

        # ---------------------------------------------------------
        # 9. EXECUTE GEMINI CALL WITH ASYNC TIMEOUT & ERROR RESILIENCE
        # ---------------------------------------------------------
        start_time = time.time()
        print(f"[GEMINI] Request started: model={self.model}, session={session_id}")

        try:
            response_text = await asyncio.wait_for(
                asyncio.to_thread(self._call_gemini, prompt),
                timeout=self.app_timeout,
            )

            elapsed = round(time.time() - start_time, 2)
            print(f"[GEMINI] Request succeeded in {elapsed}s: model={self.model}")

            if not response_text:
                raise ValueError("Empty response text returned by Gemini API.")

            # Successful Gemini response: reset quota flag
            self.gemini_quota_exhausted = False
            self.gemini_quota_retry_at = None

            session["messages"].append({
                "role": "assistant",
                "content": response_text,
            })

            return {
                "response": response_text,
                "session_id": session_id,
                "triage_level": triage_level,
                "confidence": confidence,
                "reason": triage_reason,
                "next_question": None,
                "is_complete": False,
            }

        except Exception as e:
            elapsed = round(time.time() - start_time, 2)
            err_str = str(e)

            if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str or "quota" in err_str.lower():
                self.gemini_quota_exhausted = True
                self.gemini_quota_retry_at = time.time() + self.quota_cooldown_seconds
                print("==========================================")
                print(f"[GEMINI] Quota exhausted (429). Setting cooldown for {self.quota_cooldown_seconds}s.")
                print("==========================================")
            else:
                print("==========================================")
                print(f"[GEMINI] API error ({type(e).__name__}) after {elapsed}s: {e}")
                print("==========================================")

            # Minimal, honest, safe fallback
            fallback_msg = (
                "I am temporarily unable to access the AI assistant. Please try again shortly. "
                "If your symptoms are severe or worsening, please seek medical care at your nearest Primary Health Centre (PHC) or clinic."
                if lang == "English"
                else (
                    "अस्थायी रूप से AI सहायक अनुपलब्ध है। कृपया कुछ देर बाद पुनः प्रयास करें। "
                    "यदि आपके लक्षण गंभीर हैं या बढ़ रहे हैं, तो तुरंत नजदीकी स्वास्थ्य केंद्र (PHC) या डॉक्टर से संपर्क करें।"
                )
            )

            session["messages"].append({
                "role": "assistant",
                "content": fallback_msg,
            })

            return {
                "response": fallback_msg,
                "session_id": session_id,
                "triage_level": triage_level,
                "confidence": confidence,
                "reason": triage_reason,
                "next_question": None,
                "is_complete": False,
                "error": type(e).__name__,
            }