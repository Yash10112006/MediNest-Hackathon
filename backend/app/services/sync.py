# backend/app/services/sync.py
from typing import List, Dict
from datetime import datetime

class OfflineSyncService:
    """
    Service for processing offline outbox actions and conflict resolution
    for ASHA worker tablets and offline mobile apps.
    """

    def process_sync_queue(self, device_id: str, actions: List[Dict]) -> Dict:
        synced_count = 0
        conflicts = []

        for action in actions:
            action_type = action.get("type", "unknown")
            action_id = action.get("id")
            
            # Simple conflict check demo logic
            if action.get("conflict_flag"):
                conflicts.append({
                    "action_id": action_id,
                    "reason": "Record modified on server after offline timestamp",
                    "server_version": datetime.now().isoformat()
                })
            else:
                synced_count += 1

        return {
            "status": "success" if not conflicts else "partial_success",
            "synced_count": synced_count,
            "conflicts": conflicts
        }
