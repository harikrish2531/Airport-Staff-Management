@echo off
echo ============================================================
echo Building AeroOps Production Bundle (React into FastAPI static)
echo ============================================================
cd frontend
call npm run build
cd ..
echo.
echo ============================================================
echo Launching Production Unified Server on http://127.0.0.1:8000
echo (Serving React Frontend + FastAPI REST Endpoints)
echo ============================================================
call .\venv\Scripts\activate
uvicorn app.main:app --host 127.0.0.1 --port 8000
pause
