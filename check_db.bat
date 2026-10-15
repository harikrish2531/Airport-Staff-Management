@echo off
echo ============================================================
echo AeroOps - Checking Database Health & Stored Credentials
echo ============================================================
call .\venv\Scripts\activate
python check_database.py
pause
