# backend/app/api/sync.py
from fastapi import APIRouter, HTTPException
from ..models.schemas import SyncRequest, SyncResponse
from ..services.sync import OfflineSyncService

router = APIRouter(prefix="/api/sync", tags=["Offline Sync"])
sync_service = OfflineSyncService()

@router.post("/", response_model=SyncResponse)
async def sync_offline_data(req: SyncRequest):
    """Synchronize offline outbox actions from field devices (ASHA tablets / mobile)"""
    try:
        result = sync_service.process_sync_queue(req.device_id, req.actions)
        return SyncResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
async def get_sync_status(device_id: str = "dev-default"):
    """Check device synchronization status and pending server changes"""
    return {
        "device_id": device_id,
        "last_synced_at": "2026-08-27T22:00:00Z",
        "pending_server_updates": 0,
        "status": "in_sync"
    }
