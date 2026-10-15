from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr


# --- User Schemas ---
class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str = "Ground Staff"  # "Supervisor" or "Ground Staff"


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# --- Zone Schemas ---
class ZoneBase(BaseModel):
    zone_name: str
    terminal: str


class ZoneCreate(ZoneBase):
    pass


class ZoneResponse(ZoneBase):
    id: int

    model_config = {"from_attributes": True}


# --- Task Assignment Schemas ---
class TaskAssignmentBase(BaseModel):
    staff_id: int


class TaskAssignmentCreate(TaskAssignmentBase):
    pass


class TaskAssignmentResponse(BaseModel):
    id: int
    task_id: int
    staff_id: int
    assigned_at: datetime
    completed_at: Optional[datetime] = None
    staff: Optional[UserResponse] = None

    model_config = {"from_attributes": True}


# --- Task Schemas ---
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    zone_id: Optional[int] = None
    priority: str = "Medium"  # Low, Medium, High, Critical


class TaskCreate(TaskBase):
    assigned_staff_id: Optional[int] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    zone_id: Optional[int] = None
    priority: Optional[str] = None


class TaskStatusUpdate(BaseModel):
    status: str  # Pending, In Progress, Completed


class TaskResponse(TaskBase):
    id: int
    status: str
    created_by: int
    created_at: datetime
    creator: Optional[UserResponse] = None
    zone: Optional[ZoneResponse] = None
    assignments: List[TaskAssignmentResponse] = []

    model_config = {"from_attributes": True}


# --- Shift Schemas ---
class ShiftCreate(BaseModel):
    staff_id: int
    shift_start: Optional[datetime] = None
    notes: Optional[str] = None


class ShiftEnd(BaseModel):
    notes: Optional[str] = None


class ShiftResponse(BaseModel):
    id: int
    staff_id: int
    shift_start: datetime
    shift_end: Optional[datetime] = None
    status: str
    staff: Optional[UserResponse] = None

    model_config = {"from_attributes": True}


# --- Standard API Response Wrapper ---
class APIResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None
