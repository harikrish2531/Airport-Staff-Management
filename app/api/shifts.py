from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Shift, User
from app.schemas.schemas import ShiftCreate, ShiftEnd, ShiftResponse
from app.api.deps import get_current_user, require_supervisor

router = APIRouter(prefix="/api/shifts", tags=["Shifts"])


@router.get("", response_model=List[ShiftResponse])
def get_all_shifts(
    current_user: User = Depends(require_supervisor),
    db: Session = Depends(get_db)
):
    """List all shift records (Supervisor only)."""
    shifts = db.query(Shift).order_by(Shift.shift_start.desc()).all()
    return shifts


@router.get("/my", response_model=List[ShiftResponse])
def get_my_shifts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List current user's shift history."""
    shifts = db.query(Shift).filter(
        Shift.staff_id == current_user.id
    ).order_by(Shift.shift_start.desc()).all()
    return shifts


@router.get("/active", response_model=Optional[ShiftResponse])
def get_active_shift(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's active shift if any."""
    shift = db.query(Shift).filter(
        Shift.staff_id == current_user.id,
        Shift.status == "Active"
    ).first()
    return shift


@router.post("/start", response_model=ShiftResponse, status_code=status.HTTP_201_CREATED)
def start_shift(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Start a new shift for the current user. Only one active shift allowed at a time."""
    existing = db.query(Shift).filter(
        Shift.staff_id == current_user.id,
        Shift.status == "Active"
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have an active shift. Please end your current shift first."
        )

    shift = Shift(
        staff_id=current_user.id,
        shift_start=datetime.now(timezone.utc),
        status="Active"
    )
    db.add(shift)
    db.commit()
    db.refresh(shift)
    return shift


@router.post("/end", response_model=ShiftResponse)
def end_shift(
    shift_end: Optional[ShiftEnd] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """End the current user's active shift."""
    shift = db.query(Shift).filter(
        Shift.staff_id == current_user.id,
        Shift.status == "Active"
    ).first()
    if not shift:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active shift found. Please start a shift first."
        )

    shift.shift_end = datetime.now(timezone.utc)
    shift.status = "Ended"
    if shift_end and shift_end.notes:
        shift.notes = shift_end.notes

    db.commit()
    db.refresh(shift)
    return shift


@router.get("/staff/{staff_id}", response_model=List[ShiftResponse])
def get_staff_shifts(
    staff_id: int,
    current_user: User = Depends(require_supervisor),
    db: Session = Depends(get_db)
):
    """Get shift history for a specific staff member (Supervisor only)."""
    staff = db.query(User).filter(User.id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff member not found")

    shifts = db.query(Shift).filter(
        Shift.staff_id == staff_id
    ).order_by(Shift.shift_start.desc()).all()
    return shifts
