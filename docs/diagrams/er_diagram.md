# Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    USER ||--o{ TASK : "creates"
    USER ||--o{ TASK_ASSIGNMENT : "assigned to"
    USER ||--o{ SHIFT : "works"
    TASK ||--o{ TASK_ASSIGNMENT : "contains"
    ZONE ||--o{ TASK : "located in"

    USER {
        int id PK
        string name
        string email UK
        string password_hash
        string role "Supervisor / Ground Staff"
        datetime created_at
    }

    TASK {
        int id PK
        string title
        string description
        int zone_id FK
        string priority "Low / Medium / High / Critical"
        string status "Pending / In Progress / Completed"
        int created_by FK
        datetime created_at
    }

    TASK_ASSIGNMENT {
        int id PK
        int task_id FK
        int staff_id FK
        datetime assigned_at
        datetime completed_at
    }

    SHIFT {
        int id PK
        int staff_id FK
        datetime shift_start
        datetime shift_end
        string status "Active / Completed"
    }

    ZONE {
        int id PK
        string zone_name
        string terminal
    }
```

## Entities & Relationships

1. **USER**: Represents ground staff members and supervisors.
2. **TASK**: Ground staff operation tasks created by supervisors.
3. **TASK_ASSIGNMENT**: Junction entity connecting staff to assigned tasks.
4. **SHIFT**: Records staff work shifts and availability windows.
5. **ZONE**: Represents airport terminals and operational zones (e.g. Ramp A, Baggage Hall 2).
