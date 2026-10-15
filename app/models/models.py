from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="Ground Staff")  # "Supervisor" or "Ground Staff"
    created_at = Column(DateTime(timezone=True), default=utcnow)

    # Relationships
    created_tasks = relationship("Task", back_populates="creator", foreign_keys="Task.created_by")
    assignments = relationship("TaskAssignment", back_populates="staff", foreign_keys="TaskAssignment.staff_id")
    shifts = relationship("Shift", back_populates="staff")


class Zone(Base):
    __tablename__ = "zones"

    id = Column(Integer, primary_key=True, index=True)
    zone_name = Column(String(100), nullable=False, unique=True)
    terminal = Column(String(50), nullable=False)

    tasks = relationship("Task", back_populates="zone")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    zone_id = Column(Integer, ForeignKey("zones.id"), nullable=True)
    priority = Column(String(50), nullable=False, default="Medium")  # Low, Medium, High, Critical
    status = Column(String(50), nullable=False, default="Pending")  # Pending, In Progress, Completed
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    # Relationships
    creator = relationship("User", back_populates="created_tasks", foreign_keys=[created_by])
    zone = relationship("Zone", back_populates="tasks")
    assignments = relationship("TaskAssignment", back_populates="task", cascade="all, delete-orphan")


class TaskAssignment(Base):
    __tablename__ = "task_assignments"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    staff_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_at = Column(DateTime(timezone=True), default=utcnow)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    task = relationship("Task", back_populates="assignments")
    staff = relationship("User", back_populates="assignments", foreign_keys=[staff_id])


class Shift(Base):
    __tablename__ = "shifts"

    id = Column(Integer, primary_key=True, index=True)
    staff_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    shift_start = Column(DateTime(timezone=True), nullable=False, default=utcnow)
    shift_end = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(50), nullable=False, default="Active")  # Active, Ended
    notes = Column(Text, nullable=True)

    staff = relationship("User", back_populates="shifts")
