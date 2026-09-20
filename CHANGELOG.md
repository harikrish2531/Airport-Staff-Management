# Changelog

All notable changes to the Airport Ground Staff Task Platform will be documented in this file.

## [v1.0.0-MVP] - Review-I (Day 11) - 2026-08-11

### Added
- **Problem Statement**: Finalized project specification in `Problem_Statement.md`.
- **Design Diagrams**: Added Architecture Diagram, ER Diagram (5 tables), and Module Diagram in `docs/diagrams/`.
- **Database Layer**: Implemented SQLAlchemy ORM models for `User`, `Zone`, `Task`, `TaskAssignment`, and `Shift`.
- **Security & Auth**: Added bcrypt password hashing, JWT bearer authentication, registration (`/api/auth/register`), and login (`/api/auth/login`) endpoints.
- **Task Management APIs**: Created endpoints for task creation, staff assignment, live status updates (`Pending` → `In Progress` → `Completed`), and dashboard stats.
- **Frontend UI**: Built a responsive, dark glassmorphic web dashboard with role-based features for Supervisors and Ground Staff.
- **Documentation**: Updated `README.md` with complete setup instructions, tech stack table, and diagram links.
