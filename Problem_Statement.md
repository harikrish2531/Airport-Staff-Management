# Problem Statement

## 1. Title

**Airport Ground Staff Task Management Platform**

---

## 2. Domain

Airport Operations

---

## 3. Users

### Ground Staff
- Receive assigned tasks (baggage handling, cleaning, fueling, etc.).
- View assigned tasks.
- Update task status.

### Supervisor
- Create and assign tasks.
- Monitor task progress.
- View dashboard and staff performance.

---

## 4. Problem Statement

Airport ground operations often rely on paper checklists, phone calls, or walkie-talkies to assign and track tasks. Supervisors cannot easily determine who is working on a task, whether it has started, or if it has been delayed.

This lack of real-time visibility leads to communication gaps, missed tasks, operational inefficiencies, and sometimes flight delays.

For example, a supervisor may assign three staff members to unload baggage from an arriving aircraft but has no immediate way to confirm whether the work has started or been completed until someone manually reports back.

A centralized digital task management platform can eliminate these issues by providing live task tracking and better coordination.

---

## 5. Proposed Solution

The system will provide:

- Supervisor login
- Ground Staff login
- Task creation
- Task assignment
- Task status updates
- Dashboard for monitoring all tasks
- Delay warning for overdue pending tasks

Task Status Flow:

```
Pending
    ↓
In Progress
    ↓
Completed
```

---

## 6. Core Database Tables

### User
- id
- name
- email
- password_hash
- role

### Task
- id
- title
- description
- zone
- priority
- status
- created_by (FK → User)

### TaskAssignment
- id
- task_id (FK → Task)
- staff_id (FK → User)
- assigned_at
- completed_at

### Shift
- id
- staff_id (FK → User)
- shift_start
- shift_end

### Zone
- id
- zone_name
- terminal

---

## 7. User Roles

| Role | Permissions |
|------|-------------|
| Ground Staff | View assigned tasks, update task status |
| Supervisor | Create tasks, assign staff, monitor dashboard |

---

## 8. Success Criteria

- Staff should update task status within **5 seconds**.
- Supervisor should assign a task within **1 minute**.
- Dashboard should reflect updated task status immediately after refresh.
- All task records should be stored securely in the database.

---

## 9. Out of Scope

- Real GPS tracking of staff
- Native Android/iOS application
- Multi-airport support (MVP limitation)
- AI-based automatic task allocation
- AI-based delay prediction (Future enhancement)

---

## 10. Technology Stack

### Backend
- Python
- FastAPI

### Database
- SQLite (Development)
- PostgreSQL (Future)

### Frontend
- HTML
- CSS
- JavaScript

### Version Control
- Git
- GitHub

---

## 11. Expected Outcome

The platform should improve communication between supervisors and ground staff, reduce manual coordination, increase operational efficiency, and minimize delays in airport ground operations through a centralized web-based task management system.