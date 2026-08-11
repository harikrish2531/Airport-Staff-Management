from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import User
from app.schemas.schemas import UserResponse
from app.api.deps import get_current_user, require_supervisor

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("/staff", response_model=List[UserResponse])
def get_ground_staff_members(
    current_user: User = Depends(require_supervisor),
    db: Session = Depends(get_db)
):
    """List all registered Ground Staff members (Supervisor only)."""
    staff_members = db.query(User).filter(User.role.ilike("Ground Staff")).all()
    return staff_members
