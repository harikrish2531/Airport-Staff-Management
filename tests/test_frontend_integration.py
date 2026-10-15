"""
Integration test to verify that the built React SPA frontend
is correctly served alongside the API endpoints.
"""
import os
from fastapi.testclient import TestClient
from app.main import app


def test_spa_index_served():
    with TestClient(app) as client:
        response = client.get("/")
        assert response.status_code == 200
        assert '<div id="root">' in response.text
        assert "AeroOps" in response.text


def test_spa_assets_served():
    with TestClient(app) as client:
        # Check assets directory
        static_assets = os.path.join(os.path.dirname(__file__), "..", "app", "static", "assets")
        if os.path.exists(static_assets):
            files = os.listdir(static_assets)
            for file_name in files:
                response = client.get(f"/assets/{file_name}")
                assert response.status_code == 200
                assert len(response.content) > 0


def test_spa_client_side_routing():
    with TestClient(app) as client:
        # Routes like /tasks, /shifts, /login should serve index.html
        for route in ["/login", "/tasks", "/shifts", "/zones", "/staff"]:
            response = client.get(route)
            assert response.status_code == 200
            assert '<div id="root">' in response.text
