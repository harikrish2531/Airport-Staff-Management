from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Zone, Task
from app.schemas.schemas import ZoneCreate, ZoneResponse, UserResponse
from app.api.deps import get_current_user, require_supervisor

router = APIRouter(prefix="/api/zones", tags=["Zones"])


@router.get("", response_model=List[ZoneResponse])
def get_zones(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all operational airport zones."""
    zones = db.query(Zone).all()
    return zones


@router.post("", response_model=ZoneResponse, status_code=status.HTTP_201_CREATED)
def create_zone(
    zone_in: ZoneCreate,
    current_user: UserResponse = Depends(require_supervisor),
    db: Session = Depends(get_db)
):
    """Create a new airport zone (Supervisor only)."""
    existing = db.query(Zone).filter(Zone.zone_name == zone_in.zone_name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Zone name already exists")

    zone = Zone(zone_name=zone_in.zone_name, terminal=zone_in.terminal)
    db.add(zone)
    db.commit()
    db.refresh(zone)
    return zone


@router.get("/{zone_id}", response_model=ZoneResponse)
def get_zone(
    zone_id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a zone by ID."""
    zone = db.query(Zone).filter(Zone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    return zone


@router.delete("/{zone_id}", status_code=status.HTTP_200_OK)
def delete_zone(
    zone_id: int,
    current_user: UserResponse = Depends(require_supervisor),
    db: Session = Depends(get_db)
):
    """Delete an airport zone (Supervisor only). Cannot delete zone with active tasks."""
    zone = db.query(Zone).filter(Zone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")

    # Check if zone has associated tasks
    task_count = db.query(Task).filter(Task.zone_id == zone_id).count()
    if task_count > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete zone with {task_count} associated task(s). Reassign tasks first."
        )

    db.delete(zone)
    db.commit()
    return {"success": True, "message": f"Zone {zone_id} deleted successfully"}
