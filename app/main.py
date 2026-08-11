import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.database import engine, Base, SessionLocal
from app.core.security import get_password_hash
from app.models.models import User, Zone, Task, TaskAssignment
from app.api import auth, tasks, users, zones

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Airport Ground Staff Task Platform API",
    description="Centralized real-time task management system for airport ground staff and supervisors.",
    version="1.0.0"
)

# CORS setup for web frontend interaction
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(users.router)
app.include_router(zones.router)


@app.on_event("startup")
def seed_initial_data():
    """Seed initial airport zones and demo accounts on application startup if database is empty."""
    db: Session = SessionLocal()
    try:
        # Seed default zones if none exist
        if db.query(Zone).count() == 0:
            default_zones = [
                Zone(zone_name="Baggage Claim Hall 1", terminal="Terminal 1"),
                Zone(zone_name="Ramp Area Alpha", terminal="Terminal 1"),
                Zone(zone_name="Aircraft Fueling Bay 4", terminal="Terminal 2"),
                Zone(zone_name="Gate 12 Cleaning Zone", terminal="Terminal 2"),
            ]
            db.add_all(default_zones)
            db.commit()

        # Seed default supervisor & staff accounts if none exist
        if db.query(User).count() == 0:
            demo_supervisor = User(
                name="Alex Morgan (Supervisor)",
                email="supervisor@airport.com",
                password_hash=get_password_hash("admin123"),
                role="Supervisor"
            )
            demo_staff1 = User(
                name="John Doe (Ground Staff)",
                email="staff1@airport.com",
                password_hash=get_password_hash("staff123"),
                role="Ground Staff"
            )
            demo_staff2 = User(
                name="Sarah Jenkins (Ground Staff)",
                email="staff2@airport.com",
                password_hash=get_password_hash("staff123"),
                role="Ground Staff"
            )
            db.add_all([demo_supervisor, demo_staff1, demo_staff2])
            db.commit()

            # Seed a sample initial task
            sample_task = Task(
                title="Baggage Handling Flight AI-302",
                description="Unload and route 140 pieces of luggage from arrival aircraft AI-302.",
                zone_id=1,
                priority="High",
                status="In Progress",
                created_by=demo_supervisor.id
            )
            db.add(sample_task)
            db.commit()
            db.refresh(sample_task)

            assignment = TaskAssignment(
                task_id=sample_task.id,
                staff_id=demo_staff1.id
            )
            db.add(assignment)
            db.commit()
    finally:
        db.close()


# Mount static directory for frontend
static_dir = os.path.join(os.path.dirname(__file__), "static")
if not os.path.exists(static_dir):
    os.makedirs(static_dir)

app.mount("/static", StaticFiles(directory=static_dir), name="static")


@app.get("/")
def read_root():
    """Serve main web application index page."""
    index_file = os.path.join(static_dir, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {"message": "Airport Ground Staff Task Platform API is running. Access /docs for OpenAPI swagger."}


@app.get("/health")
def health_check():
    """Health check endpoint for monitoring."""
    return {"status": "OK", "service": "Airport Ground Staff Task Platform"}
