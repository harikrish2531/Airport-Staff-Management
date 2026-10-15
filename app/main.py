from datetime import datetime, timezone
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.database import engine, Base, SessionLocal, get_db
from app.core.security import get_password_hash
from app.models.models import User, Zone, Task, TaskAssignment, Shift
from app.api import auth, tasks, users, zones, shifts


def seed_initial_data(db: Session):
    """Seed initial airport zones and operational accounts on application startup if database is empty."""
    try:
        # Seed default zones if none exist
        if db.query(Zone).count() == 0:
            default_zones = [
                Zone(zone_name="Baggage Claim Hall 1", terminal="Terminal 1"),
                Zone(zone_name="Ramp Area Alpha", terminal="Terminal 1"),
                Zone(zone_name="Aircraft Fueling Bay 4", terminal="Terminal 2"),
                Zone(zone_name="Gate 12 Cleaning Zone", terminal="Terminal 2"),
                Zone(zone_name="Cargo Loading Dock B", terminal="Terminal 3"),
                Zone(zone_name="Aircraft De-icing Station", terminal="Terminal 3"),
            ]
            db.add_all(default_zones)
            db.commit()

        # Seed default Admin & Employee accounts if none exist
        if db.query(User).count() == 0:
            admin_user = User(
                name="Operations Admin",
                email="admin@airport.com",
                password_hash=get_password_hash("Admin@123"),
                role="Admin"
            )
            supervisor_user = User(
                name="Marcus Vance",
                email="supervisor@airport.com",
                password_hash=get_password_hash("Supervisor@123"),
                role="Supervisor"
            )
            employee1 = User(
                name="John Miller",
                email="employee1@airport.com",
                password_hash=get_password_hash("Employee@123"),
                role="Ground Staff"
            )
            employee2 = User(
                name="Sarah Jenkins",
                email="employee2@airport.com",
                password_hash=get_password_hash("Employee@123"),
                role="Ground Staff"
            )
            employee3 = User(
                name="Michael Chen",
                email="employee3@airport.com",
                password_hash=get_password_hash("Employee@123"),
                role="Ground Staff"
            )
            employee4 = User(
                name="Emily Davis",
                email="employee4@airport.com",
                password_hash=get_password_hash("Employee@123"),
                role="Ground Staff"
            )
            employee5 = User(
                name="David Wilson",
                email="employee5@airport.com",
                password_hash=get_password_hash("Employee@123"),
                role="Ground Staff"
            )
            db.add_all([admin_user, supervisor_user, employee1, employee2, employee3, employee4, employee5])
            db.commit()

            # Seed operational airport tasks
            sample_tasks = [
                Task(
                    title="Baggage Handling Flight AI-302",
                    description="Unload and route 140 pieces of luggage from arrival aircraft AI-302.",
                    zone_id=1,
                    priority="High",
                    status="In Progress",
                    created_by=admin_user.id
                ),
                Task(
                    title="Ramp Safety & FOD Inspection",
                    description="Conduct airfield foreign object debris and tarmac safety inspection.",
                    zone_id=2,
                    priority="Critical",
                    status="Pending",
                    created_by=admin_user.id
                ),
                Task(
                    title="Aircraft Refueling Bay 4",
                    description="Refuel Emirates EK-504, estimated 45,000 liters Jet A-1 required.",
                    zone_id=3,
                    priority="High",
                    status="Pending",
                    created_by=supervisor_user.id
                ),
                Task(
                    title="Gate 12 Turnaround & Cleaning",
                    description="Deep cabin turnaround, trash removal and sanitization post arrival.",
                    zone_id=4,
                    priority="Medium",
                    status="Completed",
                    created_by=supervisor_user.id
                ),
                Task(
                    title="Cargo Pallet Loading BA-178",
                    description="Transfer and secure 8 standard LD3 cargo containers for flight BA-178.",
                    zone_id=5,
                    priority="High",
                    status="In Progress",
                    created_by=admin_user.id
                ),
            ]
            db.add_all(sample_tasks)
            db.commit()

            # Refresh to get IDs
            for t in sample_tasks:
                db.refresh(t)

            # Add assignments
            assignments = [
                TaskAssignment(task_id=sample_tasks[0].id, staff_id=employee1.id),
                TaskAssignment(task_id=sample_tasks[1].id, staff_id=employee2.id),
                TaskAssignment(task_id=sample_tasks[2].id, staff_id=employee3.id),
                TaskAssignment(task_id=sample_tasks[3].id, staff_id=employee4.id),
                TaskAssignment(task_id=sample_tasks[4].id, staff_id=employee5.id),
            ]
            db.add_all(assignments)

            # Seed active shifts
            shifts_data = [
                Shift(staff_id=employee1.id, shift_start=datetime.now(timezone.utc), status="Active", notes="Morning Baggage Operations"),
                Shift(staff_id=employee2.id, shift_start=datetime.now(timezone.utc), status="Active", notes="Marshalling Sector Alpha"),
                Shift(staff_id=employee3.id, shift_start=datetime.now(timezone.utc), status="Active", notes="Refueling Bay 4"),
            ]
            db.add_all(shifts_data)
            db.commit()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler - runs on startup and shutdown."""
    # Startup: initialize tables and seed data
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    seed_initial_data(db)
    yield
    # Shutdown: cleanup if needed


app = FastAPI(
    title="Airport Ground Staff Management System API",
    description="Centralized real-time task management system for airport ground staff and supervisors.",
    version="2.0.0",
    lifespan=lifespan
)

# CORS setup - allow frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(users.router)
app.include_router(zones.router)
app.include_router(shifts.router)


@app.get("/health")
def health_check():
    """Health check endpoint for monitoring."""
    return {"status": "OK", "service": "Airport Ground Staff Management System", "version": "2.0.0"}


@app.get("/api/database/status")
def database_status(db: Session = Depends(get_db)):
    """Database status, connectivity verification, and live table record counts."""
    try:
        db.execute(text("SELECT 1"))
        db_connected = True
    except Exception as e:
        return {"status": "error", "database_connected": False, "error": str(e)}

    users_count = db.query(User).count()
    zones_count = db.query(Zone).count()
    tasks_count = db.query(Task).count()
    shifts_count = db.query(Shift).count()
    assignments_count = db.query(TaskAssignment).count()

    db_path = os.path.abspath("airport_ground_staff.db")
    file_size_bytes = os.path.getsize(db_path) if os.path.exists(db_path) else 0

    return {
        "status": "healthy",
        "database_connected": db_connected,
        "engine": "SQLite 3",
        "database_file": db_path,
        "size_bytes": file_size_bytes,
        "table_counts": {
            "users": users_count,
            "zones": zones_count,
            "tasks": tasks_count,
            "shifts": shifts_count,
            "task_assignments": assignments_count
        },
        "verified_at": datetime.now(timezone.utc).isoformat()
    }


# Mount static directory for frontend (serves built frontend)
static_dir = os.path.join(os.path.dirname(__file__), "static")
if not os.path.exists(static_dir):
    os.makedirs(static_dir)

assets_dir = os.path.join(static_dir, "assets")
if os.path.exists(assets_dir):
    app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

app.mount("/static", StaticFiles(directory=static_dir), name="static")


@app.get("/{full_path:path}")
def catch_all(full_path: str):
    """Serve frontend index.html or static files for non-API routes (SPA support)."""
    file_path = os.path.join(static_dir, full_path)
    if full_path and os.path.isfile(file_path):
        return FileResponse(file_path)

    index_file = os.path.join(static_dir, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {
        "message": "Airport Ground Staff Management API is running.",
        "docs": "/docs",
        "health": "/health"
    }
