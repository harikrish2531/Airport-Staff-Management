# Airport Ground Staff Task Management Platform
> Real-time task allocation, live monitoring, and operational coordination platform for airport ground staff and supervisors.

---

## 1. Overview
Airport ground operations often rely on manual communication, leading to visibility gaps, delayed tasks, and potential flight delays. This platform provides a centralized digital solution enabling supervisors to create, dispatch, and track tasks while allowing ground staff to receive assignments and update task status live in under 5 seconds.

---

## 2. Architecture & Design Diagrams
Detailed system design documents are stored inside the `/docs/diagrams/` folder:
- 📐 [System Architecture Diagram](docs/diagrams/architecture_diagram.md)
- 🗄️ [Entity-Relationship (ER) Diagram](docs/diagrams/er_diagram.md)
- 🧩 [Class & Module Diagram](docs/diagrams/module_diagram.md)

---

## 3. Tech Stack

| Layer | Technology Used | Description |
|---|---|---|
| **Frontend** | HTML5, Vanilla CSS3, JavaScript (ES6+), FontAwesome | Responsive glassmorphic UI with quick demo auth toggle |
| **Backend Framework** | FastAPI (Python 3.10+) | High-performance asynchronous REST API framework |
| **Auth & Security** | PyJWT, Passlib (Bcrypt) | Role-based JWT authentication with hashed credentials |
| **ORM / Data Layer** | SQLAlchemy 2.0 | Declarative object-relational mapper |
| **Database** | SQLite (Dev) / PostgreSQL (Production) | Relational database storage |
| **Build & Tooling** | `pip` & `requirements.txt` | Dependency management |
| **API Documentation** | OpenAPI / Swagger UI | Auto-generated interactive API docs |

---

## 4. Key Features

### Supervisor Module
- **Task Dispatch**: Create ground operation tasks with title, description, priority, zone, and assigned staff member.
- **Ground Staff Assignment**: Assign or reassign tasks dynamically to ground staff.
- **Live Operations Dashboard**: Monitor total, pending, in-progress, and completed tasks in real time.

### Ground Staff Module
- **Task View**: Access assigned operational tasks.
- **Instant Status Transition**: Update task status (`Pending` → `In Progress` → `Completed`) with 1-click controls.

### Authentication & Core Security
- JWT bearer token authentication.
- Encrypted password storage using bcrypt.
- Role-based permissions (`Supervisor` vs `Ground Staff`).

---

## 5. Getting Started

### Prerequisites
- Python 3.10+
- Git

### Installation & Local Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/airport-ground-staff-task-platform.git
   cd airport-ground-staff-task-platform
   ```

2. **Create and Activate Virtual Environment**:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Configuration**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

5. **Run the Development Server**:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

6. **Open in Browser**:
   Navigate to `http://127.0.0.1:8000` to use the web application.

---

## 6. Environment Variables

| Variable Name | Description | Required | Default Value |
|---|---|---|---|
| `DATABASE_URL` | Relational database connection string | No | `sqlite:///./airport_ground_staff.db` |
| `SECRET_KEY` | Secret key used for signing JWT tokens | No | `super-secret-capstone-key-2026-airport-ground-staff` |

---

## 7. API Documentation

Interactive Swagger API documentation is automatically hosted on the backend server:
- **Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## 8. Running Tests

To run automated unit tests:
```bash
pytest tests/
```

---

## 9. Folder Structure

```
airport-ground-staff-task-platform/
├── app/
│   ├── api/             # REST API endpoint routers (auth, tasks, users, zones)
│   ├── core/            # Database session & security/JWT logic
│   ├── models/          # SQLAlchemy ORM models
│   ├── schemas/         # Pydantic request & response schemas
│   ├── static/          # Web UI assets (index.html, style.css, app.js)
│   └── main.py          # FastAPI application initialization & route mounting
├── docs/
│   └── diagrams/        # Architecture, ER, and Module diagrams
├── tests/               # Pytest suite
├── .env.example         # Example environment configuration
├── CHANGELOG.md         # Release history
├── Problem_Statement.md # Capstone problem statement specification
├── requirements.txt     # Python dependencies
└── README.md            # Project documentation
```

---

## 10. Future Enhancements (Phase 3 - Day 41-60)
- AI-based delay prediction and intelligent task priority allocation.
- Real-time WebSockets / Server-Sent Events push updates for status changes.

---

## 11. License
This project is licensed under the MIT License.

---

## 12. Author & Contact
- **Developer**: Capstone Student (Semester 5)
- **Track**: Python (FastAPI)
