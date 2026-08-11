# System Architecture Diagram

```mermaid
graph TD
    subgraph Client Layer
        Browser["Web Browser (Ground Staff / Supervisor UI)"]
        HTML["HTML5 / CSS3 / JavaScript (Fetch API)"]
    end

    subgraph Backend Layer (FastAPI)
        Main["FastAPI Application (app.main)"]
        AuthRouter["Auth Router (/api/auth)"]
        TaskRouter["Task Router (/api/tasks)"]
        UserRouter["User Router (/api/users)"]
        Security["Security Helper (JWT & Bcrypt)"]
    end

    subgraph Data Access Layer
        ORM["SQLAlchemy ORM (app.models)"]
        DB[(SQLite / PostgreSQL Database)]
    end

    Browser -->|HTTP REST Requests / JSON| Main
    Main --> AuthRouter
    Main --> TaskRouter
    Main --> UserRouter
    AuthRouter --> Security
    TaskRouter --> Security
    AuthRouter --> ORM
    TaskRouter --> ORM
    UserRouter --> ORM
    ORM --> DB
```

## Component Overview

1. **Client Layer**:
   - Web application accessible by Supervisors and Ground Staff.
   - Communicates with the REST backend via standard HTTP JSON requests.

2. **Backend API Layer (FastAPI)**:
   - Handles route dispatching, input validation using Pydantic schemas, and authentication using JWT tokens.
   - Enforces role-based permissions (`Supervisor` vs `Ground Staff`).

3. **Data Access Layer**:
   - Managed by SQLAlchemy ORM.
   - SQLite for local development and PostgreSQL for production deployments.
