# ✈️ AeroOps - Airport Ground Staff Task Management Platform

[![Python](https://img.shields.io/badge/Python-3.12%20%7C%203.14-blue?logo=python)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-v0.143.0-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite)](https://vitejs.dev)
[![Tests](https://img.shields.io/badge/Tests-27%2F27%20Passed-brightgreen)](tests/test_api.py)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A centralized, real-time airport ground operations task dispatch, staff coordination, and turnaround monitoring platform. Built to eliminate manual coordination delays, paper checklists, and radio communication gaps in aviation ramp environments.

---

## 📑 Table of Contents

1. [Architectural Overview](#-architectural-overview)
2. [Project Structure](#-project-structure)
3. [Key Features & Problem Statement Fulfillment](#-key-features--problem-statement-fulfillment)
4. [Demo Accounts & Test Credentials](#-demo-accounts--test-credentials)
5. [Quick Start (Development Mode)](#-quick-start-development-mode)
6. [Ready-To-Deploy (Production Mode)](#-ready-to-deploy-production-mode)
7. [API Endpoints](#-api-endpoints)
8. [Automated Test Suite (27/27 Passing)](#-automated-test-suite-2727-passing)

---

## 🏛️ Architectural Overview

The application features a **cleanly decoupled frontend and backend**:

```
                                  +------------------------------+
                                  |   React + Vite Frontend      |
                                  |   (Port 5173 Dev / SPA Prod) |
                                  +--------------+---------------+
                                                 |
                                     REST API & JWT Bearer
                                                 |
                                  +--------------v---------------+
                                  |    FastAPI Backend Server    |
                                  |    (Port 8000)               |
                                  +--------------+---------------+
                                                 |
                                         SQLAlchemy ORM
                                                 |
                                  +--------------v---------------+
                                  |   SQLite Database (v2.0)     |
                                  |   (airport_ground_staff.db)  |
                                  +------------------------------+
```

1. **Frontend (`frontend/`)**: Modern React 19 application built with Vite. Communicates with the backend using Axios with automated JWT auth token interceptors. Includes full responsive command center layouts, 1-click status transitions, delay warning alerts, and real-time shift clocks.
2. **Backend (`app/`)**: High-performance FastAPI server structured with clean controllers, SQLAlchemy ORM models, Pydantic schemas, and bcrypt security authentication.
3. **Unified Production Deployment**: The built React bundle can be served directly by FastAPI from `app/static`, allowing 1-command zero-dependency deployment (`python -m uvicorn app.main:app`), OR deployed independently (e.g., Vercel + Render / Docker).

---

## 📂 Project Structure

```
Airport-Staff-Management/
├── app/                              # FastAPI Backend Source
│   ├── api/                          # Modular API Routers
│   │   ├── auth.py                   # User Registration & JWT Login
│   │   ├── deps.py                   # Auth Dependencies & Role Guards
│   │   ├── shifts.py                 # Duty Logs & Clock In/Out
│   │   ├── tasks.py                  # Task CRUD & Status Progression
│   │   ├── users.py                  # Ground Personnel Management
│   │   └── zones.py                  # Operational Airport Zones
│   ├── core/                         # Core Configurations
│   │   ├── database.py               # SQLAlchemy Database Engine & Session
│   │   └── security.py               # Bcrypt & JWT Access Token Handling
│   ├── models/                       # SQLAlchemy Database Tables
│   │   └── models.py                 # User, Task, TaskAssignment, Shift, Zone
│   ├── schemas/                      # Pydantic Request/Response Validation
│   │   └── schemas.py                # Data Contracts
│   ├── static/                       # Production Built Frontend Files (SPA)
│   └── main.py                       # FastAPI App Entrypoint & Seed Logic
│
├── frontend/                         # React Frontend Source (Decoupled)
│   ├── src/
│   │   ├── api/                      # Axios Client & Interceptors
│   │   │   └── client.js
│   │   ├── components/               # Reusable UI Components
│   │   │   ├── DelayBanner.jsx       # Overdue Delay Warning Alert
│   │   │   ├── Navbar.jsx            # Top Navigation, Clock, User Menu
│   │   │   ├── Sidebar.jsx           # Section Navigation & System Status
│   │   │   ├── TaskModal.jsx         # Dispatch / Edit Task Modal
│   │   │   └── ZoneModal.jsx         # Airport Zone Modal
│   │   ├── context/                  # React State Contexts
│   │   │   ├── AuthContext.jsx       # Auth Token & User Context
│   │   │   └── ToastContext.jsx      # Alert Notifications
│   │   ├── pages/                    # Application Views
│   │   │   ├── DashboardPage.jsx     # Live KPIs & Telemetry
│   │   │   ├── LoginPage.jsx         # Auth & 1-Click Demo Accounts
│   │   │   ├── ShiftsPage.jsx        # Clock In/Out & Shift Records
│   │   │   ├── StaffPage.jsx         # Ground Staff Directory
│   │   │   ├── TasksPage.jsx         # Search, Filter, & Task Tables
│   │   │   └── ZonesPage.jsx         # Terminal Gates & Ramp Zones
│   │   ├── App.jsx                   # React Router & Protected Routes
│   │   ├── index.css                 # AeroOps Cyber-Aviation CSS System
│   │   └── main.jsx                  # React DOM Entry
│   ├── index.html                    # Root HTML
│   ├── package.json                  # Frontend Dependencies
│   └── vite.config.js                # Vite Proxy & Build Settings
│
├── tests/                            # Automated Pytest Suite
│   ├── conftest.py                   # Pytest Fixtures & Database Setup
│   ├── test_api.py                   # 24 Backend API Unit Tests
│   └── test_frontend_integration.py  # 3 SPA Delivery Integration Tests
│
├── build_and_run_prod.bat            # 1-Click Build & Launch Production Server
├── run_dev_backend.bat               # 1-Click Start FastAPI Backend
├── run_dev_frontend.bat              # 1-Click Start Vite React Frontend
├── run_tests.bat                     # 1-Click Run Test Suite
├── Dockerfile                        # Multi-Stage Production Container
├── docker-compose.yml                # Docker Compose Orchestration
├── pytest.ini                        # Pytest Configuration
├── requirements.txt                  # Python Dependencies
└── Problem_Statement.md              # Original Capstone Specification
```

---

## ⚡ Key Features & Problem Statement Fulfillment

| Requirement | Implementation in AeroOps |
| :--- | :--- |
| **Supervisor Role** | Dispatch tasks, assign ground staff, create airport zones, view staff rosters, and monitor live metrics. |
| **Ground Staff Role** | View assigned ramp tasks, 1-click status transitions, and clock in/out shifts. |
| **Success Criteria: < 5s Status Update** | 1-click `[Start Task]` and `[Complete Task]` buttons right on the dashboard feed and table. |
| **Success Criteria: < 1 min Task Assignment** | Pre-populated modal with zone dropdowns and active staff rosters for instant dispatch. |
| **Delay Warning System** | Automatic alert banner identifying pending tasks exceeding the 15-minute operational threshold. |
| **Turnaround Workflow** | `Pending` ➔ `In Progress` ➔ `Completed` status tracking with timestamped completion records. |
| **Attendance & Shifts** | Real-time shift tracking with clock-in timer, duty duration, and handover notes. |

---

## 🔑 Demo Accounts & Test Credentials

The login screen features **1-Click Quick Demo Login** buttons for instant testing without manual typing:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Supervisor** | `supervisor@airport.com` | `admin123` | Full dispatch, zones, staff directory, metrics |
| **Ground Staff 1** | `staff1@airport.com` | `staff123` | View assigned tasks, update status, shifts |
| **Ground Staff 2** | `staff2@airport.com` | `staff123` | View assigned tasks, update status, shifts |
| **Ground Staff 3** | `staff3@airport.com` | `staff123` | View assigned tasks, update status, shifts |

---

## 🚀 Quick Start (Development Mode)

### 1. Start Backend (Terminal 1)
```powershell
# Using the Windows script:
.\run_dev_backend.bat

# Or manually:
.\venv\Scripts\activate
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
Backend API will be running at `http://127.0.0.1:8000` (Interactive Swagger Docs at `http://127.0.0.1:8000/docs`).

### 2. Start React Frontend (Terminal 2)
```powershell
# Using the Windows script:
.\run_dev_frontend.bat

# Or manually:
cd frontend
npm install
npm run dev
```
React Development Server will be running at `http://localhost:5173`.

---

## 🚢 Ready-To-Deploy (Production Mode)

### Option A: Unified Local / Single Server (Windows/Linux)
Build the React frontend into `app/static` and run FastAPI:
```powershell
# 1-Click production launch script:
.\build_and_run_prod.bat
```
Visit `http://127.0.0.1:8000` — both the React SPA and the FastAPI endpoints are served from the single unified port!

### Option B: Docker Container Deployment
```bash
docker compose up --build -d
```
Access the application at `http://localhost:8000`.

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` — Register Supervisor or Ground Staff
- `POST /api/auth/login` — Authenticate and receive JWT access token
- `GET  /api/auth/me` — Get current logged-in user details

### Tasks
- `GET    /api/tasks/stats/summary` — Operational metrics (Total, Pending, In Progress, Completed)
- `GET    /api/tasks` — List tasks with status, priority, and zone filters
- `POST   /api/tasks` — Dispatch new task (Supervisor)
- `GET    /api/tasks/{id}` — Retrieve task details
- `PUT    /api/tasks/{id}` — Edit task details (Supervisor)
- `DELETE /api/tasks/{id}` — Delete task (Supervisor)
- `POST   /api/tasks/{id}/assign` — Assign or reassign staff (Supervisor)
- `PUT    /api/tasks/{id}/status` — Update status (`Pending` ➔ `In Progress` ➔ `Completed`)

### Shifts & Duty Logs
- `GET  /api/shifts` — View all staff shifts (Supervisor)
- `GET  /api/shifts/my` — View current user's shift history
- `GET  /api/shifts/active` — Check active shift status
- `POST /api/shifts/start` — Clock in / start duty shift
- `POST /api/shifts/end` — Clock out / end duty shift with notes

### Airport Zones
- `GET    /api/zones` — List all operational zones and terminals
- `POST   /api/zones` — Add new operational airport zone (Supervisor)
- `DELETE /api/zones/{id}` — Remove zone (Supervisor)

### Staff Directory
- `GET    /api/users/staff` — List all ground staff members (Supervisor)
- `DELETE /api/users/{id}` — Revoke ground staff access (Supervisor)

---

## 🧪 Automated Test Suite (27/27 Passing)

To execute the test suite:
```powershell
# Using the Windows script:
.\run_tests.bat

# Or manually:
.\venv\Scripts\pytest -v
```

### Verified Test Results
```text
tests/test_api.py::test_health_check PASSED                              [  3%]
tests/test_api.py::test_register_supervisor PASSED                       [  7%]
tests/test_api.py::test_register_staff PASSED                            [ 11%]
tests/test_api.py::test_login_supervisor PASSED                          [ 14%]
tests/test_api.py::test_login_staff PASSED                               [ 18%]
tests/test_api.py::test_login_wrong_password PASSED                      [ 22%]
tests/test_api.py::test_get_me PASSED                                    [ 25%]
tests/test_api.py::test_protected_route_no_token PASSED                  [ 29%]
tests/test_api.py::test_get_tasks_supervisor PASSED                      [ 33%]
tests/test_api.py::test_get_task_stats PASSED                            [ 37%]
tests/test_api.py::test_create_task_supervisor PASSED                    [ 40%]
tests/test_api.py::test_create_task_staff_forbidden PASSED               [ 44%]
tests/test_api.py::test_update_task_status PASSED                        [ 48%]
tests/test_api.py::test_invalid_status PASSED                            [ 51%]
tests/test_api.py::test_get_all_staff PASSED                             [ 55%]
tests/test_api.py::test_staff_cannot_access_staff_list PASSED            [ 59%]
tests/test_api.py::test_get_zones PASSED                                 [ 62%]
tests/test_api.py::test_create_zone PASSED                               [ 66%]
tests/test_api.py::test_create_duplicate_zone PASSED                     [ 70%]
tests/test_api.py::test_start_shift PASSED                               [ 74%]
tests/test_api.py::test_get_my_shifts PASSED                             [ 77%]
tests/test_api.py::test_get_active_shift PASSED                          [ 81%]
tests/test_api.py::test_end_shift PASSED                                 [ 85%]
tests/test_api.py::test_supervisor_get_all_shifts PASSED                 [ 88%]
tests/test_frontend_integration.py::test_spa_index_served PASSED         [ 92%]
tests/test_frontend_integration.py::test_spa_assets_served PASSED        [ 96%]
tests/test_frontend_integration.py::test_spa_client_side_routing PASSED  [100%]

======================== 27 passed, 1 warning in 4.67s ========================
```
