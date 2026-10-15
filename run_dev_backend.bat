@echo off
echo ============================================================
echo Starting AeroOps Backend (FastAPI on http://127.0.0.1:8000)
echo ============================================================
call .\venv\Scripts\activate
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
pause
