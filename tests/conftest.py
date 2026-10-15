import pytest
from app.core.database import engine, Base, SessionLocal
from app.main import seed_initial_data

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    """Ensure database tables and initial data are seeded before running tests."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_initial_data(db)
    yield
    # Keep or cleanup as necessary
