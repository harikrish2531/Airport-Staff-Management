from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Task, TaskAssignment, User, Zone
from app.schemas.schemas import TaskCreate, TaskResponse, TaskStatusUpdate, TaskAssignmentResponse, TaskUpdate
from app.api.deps import get_current_user, require_supervisor

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


@router.get("/stats/summary")
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Return task metrics for live monitoring dashboard."""
    query = db.query(Task)
    if current_user.role.lower() not in ["supervisor", "admin"]:
        query = query.join(TaskAssignment).filter(TaskAssignment.staff_id == current_user.id)

    tasks = query.all()
    total = len(tasks)
    pending = sum(1 for t in tasks if t.status == "Pending")
    in_progress = sum(1 for t in tasks if t.status == "In Progress")
    completed = sum(1 for t in tasks if t.status == "Completed")

    return {
        "success": True,
        "data": {
            "total": total,
            "pending": pending,
            "in_progress": in_progress,
            "completed": completed
        }
    }


@router.get("", response_model=List[TaskResponse])
def get_tasks(
    status_filter: Optional[str] = Query(None, alias="status"),
    zone_id: Optional[int] = None,
    priority: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List tasks. Supervisors view all tasks; Ground Staff view tasks assigned to them.
    Supports filtering by status, zone_id, and priority.
    """
    query = db.query(Task)

    # Ground staff and employees can only view tasks assigned to them
    if current_user.role.lower() not in ["supervisor", "admin"]:
        query = query.join(TaskAssignment).filter(TaskAssignment.staff_id == current_user.id)

    if status_filter:
        query = query.filter(Task.status == status_filter)
    if zone_id:
        query = query.filter(Task.zone_id == zone_id)
    if priority:
        query = query.filter(Task.priority == priority)

    tasks = query.order_by(Task.created_at.desc()).all()
    return tasks


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task_in: TaskCreate,
    current_user: User = Depends(require_supervisor),
    db: Session = Depends(get_db)
):
    """
    Create a new operational ground staff task (Supervisor only).
    Optionally assign a staff member directly upon creation.
    """
    if task_in.zone_id:
        zone = db.query(Zone).filter(Zone.id == task_in.zone_id).first()
        if not zone:
            raise HTTPException(status_code=404, detail="Zone not found")

    new_task = Task(
        title=task_in.title,
        description=task_in.description,
        zone_id=task_in.zone_id,
        priority=task_in.priority,
        status="Pending",
        created_by=current_user.id
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    # Assign staff if provided
    if task_in.assigned_staff_id:
        staff_user = db.query(User).filter(User.id == task_in.assigned_staff_id).first()
        if not staff_user:
            raise HTTPException(status_code=404, detail="Assigned ground staff member not found")

        assignment = TaskAssignment(
            task_id=new_task.id,
            staff_id=staff_user.id,
            assigned_at=datetime.now(timezone.utc)
        )
        db.add(assignment)
        db.commit()
        db.refresh(new_task)

    return new_task


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a single task by ID."""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Ground staff and employees can only view their own tasks
    if current_user.role.lower() not in ["supervisor", "admin"]:
        assignment = db.query(TaskAssignment).filter(
            TaskAssignment.task_id == task_id,
            TaskAssignment.staff_id == current_user.id
        ).first()
        if not assignment:
            raise HTTPException(status_code=403, detail="Access denied")

    return task


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_in: TaskUpdate,
    current_user: User = Depends(require_supervisor),
    db: Session = Depends(get_db)
):
    """Update task details (Supervisor only)."""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task_in.title is not None:
        task.title = task_in.title
    if task_in.description is not None:
        task.description = task_in.description
    if task_in.zone_id is not None:
        task.zone_id = task_in.zone_id
    if task_in.priority is not None:
        task.priority = task_in.priority

    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_200_OK)
def delete_task(
    task_id: int,
    current_user: User = Depends(require_supervisor),
    db: Session = Depends(get_db)
):
    """Delete a task (Supervisor only)."""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()
    return {"success": True, "message": f"Task {task_id} deleted successfully"}


@router.post("/{task_id}/assign", response_model=TaskAssignmentResponse)
def assign_task(
    task_id: int,
    assignment_in: dict,
    current_user: User = Depends(require_supervisor),
    db: Session = Depends(get_db)
):
    """Assign or reassign ground staff to a task (Supervisor only)."""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    staff_id = assignment_in.get("staff_id")
    if not staff_id:
        raise HTTPException(status_code=400, detail="staff_id is required")

    staff = db.query(User).filter(User.id == staff_id).first()
    if not staff or staff.role.lower() != "ground staff":
        raise HTTPException(status_code=400, detail="Invalid ground staff member")

    # Clear existing assignments
    db.query(TaskAssignment).filter(TaskAssignment.task_id == task_id).delete()
    db.commit()

    assignment = TaskAssignment(
        task_id=task_id,
        staff_id=staff_id,
        assigned_at=datetime.now(timezone.utc)
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment


@router.put("/{task_id}/status", response_model=TaskResponse)
def update_task_status(
    task_id: int,
    status_in: TaskStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update task status (Pending -> In Progress -> Completed).
    Ground staff can update assigned tasks; Supervisors can update any task.
    """
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Permission check for ground staff and employees
    if current_user.role.lower() not in ["supervisor", "admin"]:
        assignment = db.query(TaskAssignment).filter(
            TaskAssignment.task_id == task_id,
            TaskAssignment.staff_id == current_user.id
        ).first()
        if not assignment:
            raise HTTPException(status_code=403, detail="You can only update status for tasks assigned to you")

    valid_statuses = ["Pending", "In Progress", "Completed"]
    if status_in.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Status must be one of {valid_statuses}")

    task.status = status_in.status

    # Record completion time on TaskAssignment
    if status_in.status == "Completed":
        assignments = db.query(TaskAssignment).filter(TaskAssignment.task_id == task_id).all()
        for a in assignments:
            a.completed_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(task)
    return task
