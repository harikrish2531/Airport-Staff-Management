import os
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_read_root():
    response = client.get("/")
    assert response.status_code == 200


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "OK"


def test_register_and_login_user():
    # Register test supervisor
    user_data = {
        "name": "Test Supervisor",
        "email": "test_supervisor@airport.com",
        "password": "testpassword123",
        "role": "Supervisor"
    }
    response = client.post("/api/auth/register", json=user_data)
    assert response.status_code in [201, 400]  # 201 created or 400 if already exists

    # Login
    login_data = {
        "email": "test_supervisor@airport.com",
        "password": "testpassword123"
    }
    login_res = client.post("/api/auth/login", json=login_data)
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    assert token is not None
