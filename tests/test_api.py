"""
Airport Ground Staff Management System - API Test Suite
Tests all core endpoints: Auth, Tasks, Users, Zones, Shifts
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# ============ FIXTURES ============
SUPERVISOR_EMAIL = "test_supervisor@airport.com"
SUPERVISOR_PASS = "testpassword123"
STAFF_EMAIL = "test_staff@airport.com"
STAFF_PASS = "staffpass456"


def get_token(email, password):
    res = client.post("/api/auth/login", json={"email": email, "password": password})
    if res.status_code == 200:
        return res.json()["access_token"]
    return None


def supervisor_headers():
    token = get_token(SUPERVISOR_EMAIL, SUPERVISOR_PASS)
    return {"Authorization": f"Bearer {token}"}


def staff_headers():
    token = get_token(STAFF_EMAIL, STAFF_PASS)
    return {"Authorization": f"Bearer {token}"}


# ============ HEALTH CHECK ============
def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "OK"
    assert "service" in data


# ============ AUTH TESTS ============
def test_register_supervisor():
    res = client.post("/api/auth/register", json={
        "name": "Test Supervisor",
        "email": SUPERVISOR_EMAIL,
        "password": SUPERVISOR_PASS,
        "role": "Supervisor"
    })
    assert res.status_code in [201, 400]


def test_register_staff():
    res = client.post("/api/auth/register", json={
        "name": "Test Staff Member",
        "email": STAFF_EMAIL,
        "password": STAFF_PASS,
        "role": "Ground Staff"
    })
    assert res.status_code in [201, 400]


def test_login_supervisor():
    res = client.post("/api/auth/login", json={
        "email": SUPERVISOR_EMAIL,
        "password": SUPERVISOR_PASS
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert "user" in data
    assert data["user"]["role"] == "Supervisor"


def test_login_staff():
    res = client.post("/api/auth/login", json={
        "email": STAFF_EMAIL,
        "password": STAFF_PASS
    })
    assert res.status_code == 200


def test_login_wrong_password():
    res = client.post("/api/auth/login", json={
        "email": SUPERVISOR_EMAIL,
        "password": "wrongpassword"
    })
    assert res.status_code == 401


def test_get_me():
    headers = supervisor_headers()
    if not headers.get("Authorization") or "None" in headers["Authorization"]:
        pytest.skip("Supervisor not registered yet")
    res = client.get("/api/auth/me", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["email"] == SUPERVISOR_EMAIL


def test_protected_route_no_token():
    res = client.get("/api/auth/me")
    assert res.status_code == 401 or res.status_code == 403


# ============ TASKS TESTS ============
def test_get_tasks_supervisor():
    headers = supervisor_headers()
    if not headers.get("Authorization") or "None" in headers["Authorization"]:
        pytest.skip("Token not available")
    res = client.get("/api/tasks", headers=headers)
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_get_task_stats():
    headers = supervisor_headers()
    if not headers.get("Authorization") or "None" in headers["Authorization"]:
        pytest.skip("Token not available")
    res = client.get("/api/tasks/stats/summary", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "total" in data["data"]
    assert "pending" in data["data"]
    assert "in_progress" in data["data"]
    assert "completed" in data["data"]


def test_create_task_supervisor():
    headers = supervisor_headers()
    if not headers.get("Authorization") or "None" in headers["Authorization"]:
        pytest.skip("Token not available")

    res = client.post("/api/tasks", json={
        "title": "Test Task via API",
        "description": "Automated test task",
        "priority": "Medium"
    }, headers=headers)
    assert res.status_code == 201
    data = res.json()
    assert data["title"] == "Test Task via API"
    assert data["status"] == "Pending"


def test_create_task_staff_forbidden():
    headers = staff_headers()
    if not headers.get("Authorization") or "None" in headers["Authorization"]:
        pytest.skip("Token not available")
    res = client.post("/api/tasks", json={
        "title": "Should fail",
        "priority": "Low"
    }, headers=headers)
    assert res.status_code == 403


def test_update_task_status():
    headers = supervisor_headers()
    if not headers.get("Authorization") or "None" in headers["Authorization"]:
        pytest.skip("Token not available")

    # Get tasks to find one
    tasks_res = client.get("/api/tasks", headers=headers)
    if tasks_res.status_code != 200 or not tasks_res.json():
        pytest.skip("No tasks available")

    task = tasks_res.json()[0]
    task_id = task["id"]

    res = client.put(f"/api/tasks/{task_id}/status", json={"status": "In Progress"}, headers=headers)
    assert res.status_code == 200
    assert res.json()["status"] == "In Progress"


def test_invalid_status():
    headers = supervisor_headers()
    if not headers.get("Authorization") or "None" in headers["Authorization"]:
        pytest.skip("Token not available")

    tasks_res = client.get("/api/tasks", headers=headers)
    if tasks_res.status_code != 200 or not tasks_res.json():
        pytest.skip("No tasks available")

    task_id = tasks_res.json()[0]["id"]
    res = client.put(f"/api/tasks/{task_id}/status", json={"status": "Invalid"}, headers=headers)
    assert res.status_code == 400


# ============ USERS TESTS ============
def test_get_all_staff():
    headers = supervisor_headers()
    if not headers.get("Authorization") or "None" in headers["Authorization"]:
        pytest.skip("Token not available")
    res = client.get("/api/users/staff", headers=headers)
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_staff_cannot_access_staff_list():
    headers = staff_headers()
    if not headers.get("Authorization") or "None" in headers["Authorization"]:
        pytest.skip("Token not available")
    res = client.get("/api/users/staff", headers=headers)
    assert res.status_code == 403


# ============ ZONES TESTS ============
def test_get_zones():
    headers = supervisor_headers()
    if not headers.get("Authorization") or "None" in headers["Authorization"]:
        pytest.skip("Token not available")
    res = client.get("/api/zones", headers=headers)
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_create_zone():
    headers = supervisor_headers()
    if not headers.get("Authorization") or "None" in headers["Authorization"]:
        pytest.skip("Token not available")
    res = client.post("/api/zones", json={
        "zone_name": "Test Zone API",
        "terminal": "Terminal T"
    }, headers=headers)
    assert res.status_code in [201, 400]


def test_create_duplicate_zone():
    headers = supervisor_headers()
    if not headers.get("Authorization") or "None" in headers["Authorization"]:
        pytest.skip("Token not available")
    client.post("/api/zones", json={"zone_name": "DuplicateZone", "terminal": "T1"}, headers=headers)
    res = client.post("/api/zones", json={"zone_name": "DuplicateZone", "terminal": "T1"}, headers=headers)
    assert res.status_code == 400


# ============ SHIFTS TESTS ============
def test_start_shift():
    headers = staff_headers()
    if not headers.get("Authorization") or "None" in headers["Authorization"]:
        pytest.skip("Token not available")

    # End existing shift first if any
    client.post("/api/shifts/end", json={}, headers=headers)

    res = client.post("/api/shifts/start", headers=headers)
    assert res.status_code in [201, 400]  # 400 if already active


def test_get_my_shifts():
    headers = staff_headers()
    if not headers.get("Authorization") or "None" in headers["Authorization"]:
        pytest.skip("Token not available")
    res = client.get("/api/shifts/my", headers=headers)
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_get_active_shift():
    headers = staff_headers()
    if not headers.get("Authorization") or "None" in headers["Authorization"]:
        pytest.skip("Token not available")
    res = client.get("/api/shifts/active", headers=headers)
    assert res.status_code == 200


def test_end_shift():
    headers = staff_headers()
    if not headers.get("Authorization") or "None" in headers["Authorization"]:
        pytest.skip("Token not available")
    # Start first
    client.post("/api/shifts/start", headers=headers)
    # End
    res = client.post("/api/shifts/end", json={}, headers=headers)
    assert res.status_code in [200, 404]


def test_supervisor_get_all_shifts():
    headers = supervisor_headers()
    if not headers.get("Authorization") or "None" in headers["Authorization"]:
        pytest.skip("Token not available")
    res = client.get("/api/shifts", headers=headers)
    assert res.status_code == 200
    assert isinstance(res.json(), list)
