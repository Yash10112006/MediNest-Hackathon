# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import (
    auth,
    patients,
    doctors,
    appointments,
    referrals,
    triage,
    schemes,
    asha,
    analytics,
    chatbot,
    voice,
    sync
)
from .core.config import settings

app = FastAPI(
    title="MediNest API",
    description="AI-Powered Rural Healthcare Platform for India",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register All API Routers
app.include_router(auth.router)
app.include_router(patients.router)
app.include_router(doctors.router)
app.include_router(appointments.router)
app.include_router(referrals.router)
app.include_router(triage.router)
app.include_router(schemes.router)
app.include_router(asha.router)
app.include_router(analytics.router)
app.include_router(chatbot.router)
app.include_router(voice.router)
app.include_router(sync.router)

@app.get("/")
async def root():
    return {
        "name": "MediNest API",
        "version": "1.0.0",
        "status": "running",
        "environment": settings.ENVIRONMENT
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": "2026-08-28T00:00:00Z"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)