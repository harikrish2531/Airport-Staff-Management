"""
AeroOps Airport Ground Staff Management System
Database Initialization & Seeding Script

Creates tables and populates production-ready operational accounts:
- admin@airport.com (Password: Admin@123)
- supervisor@airport.com (Password: Supervisor@123)
- employee1@airport.com (Password: Employee@123)
- employee2@airport.com (Password: Employee@123)
- employee3@airport.com (Password: Employee@123)
- employee4@airport.com (Password: Employee@123)
- employee5@airport.com (Password: Employee@123)
"""
import os
import sys
from datetime import datetime, timezone

from app.core.database import engine, Base, SessionLocal
from app.core.security import get_password_hash
from app.models.models import User, Zone, Task, TaskAssignment, Shift


def reset_and_seed_database():
    print("=" * 65)
    print("AeroOps - Initializing and Seeding SQLite Database")
    print("=" * 65)

    # Recreate all tables cleanly
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("[+] Database tables dropped and recreated cleanly.")

    db = SessionLocal()
    try:
        # 1. Airport Zones
        zones_data = [
            Zone(zone_name="Baggage Claim Hall 1", terminal="Terminal 1"),
            Zone(zone_name="Ramp Area Alpha", terminal="Terminal 1"),
            Zone(zone_name="Aircraft Fueling Bay 4", terminal="Terminal 2"),
            Zone(zone_name="Gate 12 Cleaning Zone", terminal="Terminal 2"),
            Zone(zone_name="Cargo Loading Dock B", terminal="Terminal 3"),
            Zone(zone_name="Aircraft De-icing Station", terminal="Terminal 3"),
        ]
        db.add_all(zones_data)
        db.commit()
        for z in zones_data:
            db.refresh(z)
        print(f"[+] Seeded {len(zones_data)} operational airport zones.")

        # 2. Authorized System Accounts (6 Credentials + Supervisor)
        users_data = [
            User(
                name="Operations Admin",
                email="admin@airport.com",
                password_hash=get_password_hash("Admin@123"),
                role="Admin"
            ),
            User(
                name="Marcus Vance",
                email="supervisor@airport.com",
                password_hash=get_password_hash("Supervisor@123"),
                role="Supervisor"
            ),
            User(
                name="John Miller",
                email="employee1@airport.com",
                password_hash=get_password_hash("Employee@123"),
                role="Ground Staff"
            ),
            User(
                name="Sarah Jenkins",
                email="employee2@airport.com",
                password_hash=get_password_hash("Employee@123"),
                role="Ground Staff"
            ),
            User(
                name="Michael Chen",
                email="employee3@airport.com",
                password_hash=get_password_hash("Employee@123"),
                role="Ground Staff"
            ),
            User(
                name="Emily Davis",
                email="employee4@airport.com",
                password_hash=get_password_hash("Employee@123"),
                role="Ground Staff"
            ),
            User(
                name="David Wilson",
                email="employee5@airport.com",
                password_hash=get_password_hash("Employee@123"),
                role="Ground Staff"
            ),
        ]
        db.add_all(users_data)
        db.commit()
        for u in users_data:
            db.refresh(u)
        print(f"[+] Seeded {len(users_data)} authorized system accounts:")
        for u in users_data:
            print(f"    - {u.email:<26} | Role: {u.role:<14} | Name: {u.name}")

        admin_u = users_data[0]
        supervisor_u = users_data[1]
        emp1 = users_data[2]
        emp2 = users_data[3]
        emp3 = users_data[4]
        emp4 = users_data[5]
        emp5 = users_data[6]

        # 3. Operational Tasks
        tasks_data = [
            Task(
                title="Baggage Handling Flight AI-302",
                description="Unload and route 140 pieces of passenger luggage from arrival aircraft AI-302.",
                zone_id=zones_data[0].id,
                priority="High",
                status="In Progress",
                created_by=admin_u.id
            ),
            Task(
                title="Ramp Safety & FOD Inspection",
                description="Conduct thorough foreign object debris sweep and safety inspection across Ramp Sector Alpha.",
                zone_id=zones_data[1].id,
                priority="Critical",
                status="Pending",
                created_by=admin_u.id
            ),
            Task(
                title="Aircraft Refueling Bay 4",
                description="Refuel Emirates EK-504, estimated 45,000 liters Jet A-1 required before turnaround.",
                zone_id=zones_data[2].id,
                priority="High",
                status="Pending",
                created_by=supervisor_u.id
            ),
            Task(
                title="Gate 12 Turnaround & Cleaning",
                description="Deep cabin turnaround, trash removal, tray sanitization and pre-boarding preparation.",
                zone_id=zones_data[3].id,
                priority="Medium",
                status="Completed",
                created_by=supervisor_u.id
            ),
            Task(
                title="Cargo Pallet Loading Flight BA-178",
                description="Transfer and secure 8 standard LD3 cargo pallets into the lower deck cargo hold.",
                zone_id=zones_data[4].id,
                priority="High",
                status="In Progress",
                created_by=admin_u.id
            ),
            Task(
                title="De-icing Station Pre-Check",
                description="Test heating elements and flow valves at de-icing bay ahead of incoming cold weather.",
                zone_id=zones_data[5].id,
                priority="Medium",
                status="Pending",
                created_by=supervisor_u.id
            ),
        ]
        db.add_all(tasks_data)
        db.commit()
        for t in tasks_data:
            db.refresh(t)
        print(f"[+] Seeded {len(tasks_data)} realistic ground staff tasks.")

        # 4. Task Assignments
        assignments_data = [
            TaskAssignment(task_id=tasks_data[0].id, staff_id=emp1.id),
            TaskAssignment(task_id=tasks_data[1].id, staff_id=emp2.id),
            TaskAssignment(task_id=tasks_data[2].id, staff_id=emp3.id),
            TaskAssignment(task_id=tasks_data[3].id, staff_id=emp4.id),
            TaskAssignment(task_id=tasks_data[4].id, staff_id=emp5.id),
        ]
        db.add_all(assignments_data)
        db.commit()
        print(f"[+] Seeded {len(assignments_data)} task assignments.")

        # 5. Active and Historical Shifts
        shifts_data = [
            Shift(staff_id=emp1.id, shift_start=datetime.now(timezone.utc), status="Active", notes="Morning Baggage Turnaround"),
            Shift(staff_id=emp2.id, shift_start=datetime.now(timezone.utc), status="Active", notes="Marshalling & Tarmac Ops"),
            Shift(staff_id=emp3.id, shift_start=datetime.now(timezone.utc), status="Active", notes="Refueling Bay 4 Operations"),
        ]
        db.add_all(shifts_data)
        db.commit()
        print(f"[+] Seeded {len(shifts_data)} active shift sessions.")

        print("=" * 65)
        print("DATABASE INITIALIZED AND READY!")
        print("Database Path: airport_ground_staff.db")
        print("=" * 65)
    except Exception as e:
        db.rollback()
        print(f"[!] Error seeding database: {e}")
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    reset_and_seed_database()
