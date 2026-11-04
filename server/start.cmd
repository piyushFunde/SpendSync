@echo off
REM ─────────────────────────────────────────────────────────────────────────
REM  SpendSync Backend Startup Script
REM  Reads server\.env and starts Spring Boot
REM ─────────────────────────────────────────────────────────────────────────

cd /d "%~dp0"

REM Load variables from .env file
if exist ".env" (
    for /f "usebackq tokens=1,* delims==" %%A in (".env") do (
        REM Skip comment lines
        echo %%A | findstr /R "^#" >nul || set "%%A=%%B"
    )
    echo [INFO] Loaded .env file
) else (
    echo [WARN] No .env file found. Using defaults from application.yml
    echo [WARN] Create server\.env with MONGODB_URI and JWT_SECRET for production.
)

echo [INFO] Starting SpendSync backend on port %PORT:8080%...
mvn spring-boot:run


