"""
AeroOps Airport Ground Staff Management System
Database Verification & Health Inspection Script

Run this script anytime to check:
1. SQLite database file status and size
2. Active connection test
3. Table integrity and row counts
4. User accounts verification (verifies bcrypt password hashes)
5. Active shifts and task statistics
"""
import os
import sys
import sqlite3
from app.core.security import verify_password


def check_database():
    db_file = os.path.abspath("airport_ground_staff.db")
    print("=" * 70)
    print("AEROOPS DATABASE VERIFICATION & DIAGNOSTIC TOOL")
    print("=" * 70)

    # 1. Check database file
    print("\n[1] Checking SQLite Database File...")
    if not os.path.exists(db_file):
        print(f"[-] ERROR: Database file not found at: {db_file}")
        sys.exit(1)

    file_size_bytes = os.path.getsize(db_file)
    print(f"    [OK] File exists: {db_file}")
    print(f"    [OK] File size:   {file_size_bytes:,} bytes")

    # 2. Test SQLite connection
    print("\n[2] Testing SQLite Connection & Table Schemas...")
    try:
        conn = sqlite3.connect(db_file)
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;")
        tables = [row[0] for row in cursor.fetchall() if not row[0].startswith("sqlite_")]
        print(f"    [OK] Database connection established successfully.")
        print(f"    [OK] Discovered {len(tables)} tables: {', '.join(tables)}")
    except Exception as e:
        print(f"[-] Connection Failed: {e}")
        sys.exit(1)

    # 3. Check Row Counts in each table
    print("\n[3] Querying Record Counts Across Tables...")
    table_counts = {}
    for table in tables:
        cursor.execute(f"SELECT COUNT(*) FROM {table}")
        count = cursor.fetchone()[0]
        table_counts[table] = count
        print(f"    - Table '{table:<16}': {count:>3} records")

    # 4. Verify Authorized Personnel Credentials
    print("\n[4] Verifying Authorized Personnel Logins & Password Hashing...")
    cursor.execute("SELECT id, name, email, password_hash, role FROM users ORDER BY id;")
    users = cursor.fetchall()

    test_creds = {
        "admin@airport.com": "Admin@123",
        "supervisor@airport.com": "Supervisor@123",
        "employee1@airport.com": "Employee@123",
        "employee2@airport.com": "Employee@123",
        "employee3@airport.com": "Employee@123",
        "employee4@airport.com": "Employee@123",
        "employee5@airport.com": "Employee@123",
    }

    all_verified = True
    for user_id, name, email, pw_hash, role in users:
        expected_pass = test_creds.get(email)
        if expected_pass:
            is_valid = verify_password(expected_pass, pw_hash)
            status_text = "VERIFIED (Bcrypt PASS)" if is_valid else "FAILED"
            if not is_valid:
                all_verified = False
            print(f"    - ID {user_id} | {email:<24} | Role: {role:<12} | {status_text}")
        else:
            print(f"    - ID {user_id} | {email:<24} | Role: {role:<12} | Custom Account")

    # 5. Check Live Tasks & Duty Shifts
    print("\n[5] Operational State Overview...")
    cursor.execute("SELECT status, COUNT(*) FROM tasks GROUP BY status;")
    task_stats = dict(cursor.fetchall())
    print(f"    - Task Breakdown: Pending: {task_stats.get('Pending', 0)}, In Progress: {task_stats.get('In Progress', 0)}, Completed: {task_stats.get('Completed', 0)}")

    cursor.execute("SELECT COUNT(*) FROM shifts WHERE status='Active';")
    active_shifts = cursor.fetchone()[0]
    print(f"    - Active Staff On Duty (Shifts): {active_shifts}")

    conn.close()

    print("\n" + "=" * 70)
    if all_verified and table_counts.get("users", 0) >= 6:
        print("[SUCCESS] ALL CHECKS PASSED: Database is ACTIVE, HEALTHY & FULLY FUNCTIONAL!")
    else:
        print("[WARNING] Verification completed with warnings. Check logs above.")
    print("=" * 70)


if __name__ == "__main__":
    check_database()
