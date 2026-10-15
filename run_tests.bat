@echo off
echo ============================================================
echo Running Full AeroOps Backend & Integration Test Suite
echo ============================================================
call .\venv\Scripts\activate
pytest -v
pause
