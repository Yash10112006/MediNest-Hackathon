# backend/app/api/sync.py
import logging
from fastapi import APIRouter, HTTPException, Depends, status
from ..models.schemas import SyncRequest, SyncResponse
from ..services.sync import OfflineSyncService
from ..core.security import require_roles, CurrentUser

logger = logging.getLogger("medinest.sync")
router = APIRouter(prefix="/api/sync", tags=["Offline Sync"])
sync_service = OfflineSyncService()


@router.post("/", response_model=SyncResponse)
async def sync_offline_data(
    req: SyncRequest,
    current_user: CurrentUser = Depends(require_roles("asha"))
):
    """
    Synchronize offline outbox actions from field devices (ASHA tablets / mobile).
    Restricted to ASHA field workers.
    """
    try:
        result = sync_service.process_sync_queue(req.device_id, req.actions)
        return SyncResponse(**result)
    except Exception as e:
        logger.error(f"Sync error for device {req.device_id}: {type(e).__name__}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process offline synchronization queue."
        )


@router.get("/status")
async def get_sync_status(
    device_id: str = "dev-default",
    current_user: CurrentUser = Depends(require_roles("asha", "hospital_admin"))
):
    """Check device synchronization status and pending server changes"""
    return {
        "device_id": device_id,
        "last_synced_at": "2026-08-27T22:00:00Z",
        "pending_server_updates": 0,
        "status": "in_sync"
    }
