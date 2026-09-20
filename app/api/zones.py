from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Zone
from app.schemas.schemas import ZoneCreate, ZoneResponse, UserResponse
from app.api.deps import get_current_user, require_supervisor

router = APIRouter(prefix="/api/zones", tags=["Zones"])


@router.get("", response_model=List[ZoneResponse])
def get_zones(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List operational airport zones."""
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
