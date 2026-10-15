from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import User
from app.schemas.schemas import UserResponse, UserCreate
from app.core.security import get_password_hash
from app.api.deps import get_current_user, require_supervisor

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("/staff", response_model=List[UserResponse])
def get_ground_staff_members(
    current_user: User = Depends(require_supervisor),
    db: Session = Depends(get_db)
):
    """List all registered Ground Staff / Employee members (Supervisor and Admin only)."""
    staff_members = db.query(User).filter(
        ~User.role.ilike("Supervisor"),
        ~User.role.ilike("Admin")
    ).all()
    return staff_members


@router.get("/all", response_model=List[UserResponse])
def get_all_users(
    current_user: User = Depends(require_supervisor),
    db: Session = Depends(get_db)
):
    """List all registered users (Supervisor only)."""
    users = db.query(User).all()
    return users


@router.get("/{user_id}", response_model=UserResponse)
def get_user_by_id(
    user_id: int,
    current_user: User = Depends(require_supervisor),
    db: Session = Depends(get_db)
):
    """Get user details by ID (Supervisor only)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.delete("/{user_id}", status_code=status.HTTP_200_OK)
def delete_user(
    user_id: int,
    current_user: User = Depends(require_supervisor),
    db: Session = Depends(get_db)
):
    """Delete a user (Supervisor only). Cannot delete yourself."""
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot delete your own account")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()
    return {"success": True, "message": f"User {user_id} deleted successfully"}
