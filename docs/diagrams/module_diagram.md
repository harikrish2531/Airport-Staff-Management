# Class / Module Diagram

```mermaid
classDiagram
    class FastAPI_Main {
        +app: FastAPI
        +startup_event()
    }

    class SecurityHelper {
        +verify_password(plain, hashed) String
        +get_password_hash(password) String
        +create_access_token(data, expires_delta) String
        +get_current_user(token, db) User
    }

    class AuthRouter {
        +register_user(user_in, db) UserResponse
        +login(credentials, db) TokenResponse
        +get_me(current_user) UserResponse
    }

    class TaskRouter {
        +create_task(task_in, current_user, db) TaskResponse
        +get_tasks(status, current_user, db) List~TaskResponse~
        +assign_task(task_id, staff_id, current_user, db) AssignmentResponse
        +update_task_status(task_id, status_in, current_user, db) TaskResponse
    }

    class UserORM {
        +id: int
        +name: str
        +email: str
        +password_hash: str
        +role: str
    }

    class TaskORM {
        +id: int
        +title: str
        +description: str
        +zone_id: int
        +priority: str
        +status: str
        +created_by: int
    }

    class TaskAssignmentORM {
        +id: int
        +task_id: int
        +staff_id: int
        +assigned_at: datetime
        +completed_at: datetime
    }

    class ShiftORM {
        +id: int
        +staff_id: int
        +shift_start: datetime
        +shift_end: datetime
    }

    class ZoneORM {
        +id: int
        +zone_name: str
        +terminal: str
    }

    FastAPI_Main --> AuthRouter
    FastAPI_Main --> TaskRouter
    AuthRouter ..> SecurityHelper
    TaskRouter ..> SecurityHelper
    AuthRouter ..> UserORM
    TaskRouter ..> TaskORM
    TaskRouter ..> TaskAssignmentORM
    TaskORM --> ZoneORM
    TaskAssignmentORM --> UserORM
```

## Module Structure

- **`app.core`**: Database initialization & Security token handlers.
- **`app.models`**: SQLAlchemy ORM models matching database tables.
- **`app.schemas`**: Pydantic request & response validation objects.
- **`app.api`**: FastAPI endpoint routers handling business logic.
