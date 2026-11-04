@echo off
REM ─────────────────────────────────────────────────────────────────────────
REM  SpendSync Backend Startup Script
REM  Reads server\.env and starts Spring Boot
REM ─────────────────────────────────────────────────────────────────────────

cd /d "%~dp0"

where mvn >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Maven (mvn) was not found in your system PATH.
    echo.
    echo To run the Spring Boot backend:
    echo   1. Install Maven: choco install maven  OR  winget install Apache.Maven
    echo   2. OR run the entire stack with Docker:
    echo      cd ..
    echo      docker compose up --build
    echo.
    pause
    exit /b 1
)

REM Load variables from .env file
if exist ".env" (
    for /f "usebackq tokens=1,* delims==" %%A in (".env") do (
        echo %%A | findstr /R "^#" >nul || set "%%A=%%B"
    )
    echo [INFO] Loaded .env file
) else (
    echo [WARN] No server\.env file found. Using defaults from application.yml
)

echo [INFO] Starting SpendSync backend on port 8080...
mvn spring-boot:run
