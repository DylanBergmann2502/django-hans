@echo off
setlocal EnableDelayedExpansion

:: Navigate to project root
cd %~dp0\..

:: Use ENV from environment or default to local
if "%ENV%"=="" set ENV=local
set SETUP_FILE=deploy/%ENV%/setup.yml
set WEB_FILE=deploy/%ENV%/web.yml

echo [INFO] Checking required dependencies...

:: Check Docker
docker --version > nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Docker is not installed
    exit /b 1
) else (
    echo [OK] Docker is installed
)

:: Check Docker Compose
docker compose version > nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Docker Compose is not installed
    exit /b 1
) else (
    echo [OK] Docker Compose is installed
)

:: Check if Docker daemon is running
docker info > nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Docker daemon is not running. Please start Docker and try again.
    exit /b 1
)

:: Clean up existing containers and volumes
echo [INFO] Cleaning up existing containers and volumes...
docker compose -f %WEB_FILE% down -v
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to clean up existing containers and volumes
    exit /b 1
)

:: Run setup services in detached mode
echo [INFO] Starting setup services...
docker compose -f %SETUP_FILE% up --build -d
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to start setup services
    exit /b 1
)

:: Clean up setup services but keep volumes
echo [INFO] Cleaning up setup services...
docker compose -f %SETUP_FILE% down --remove-orphans

:: Start main application services
echo [INFO] Building and starting all main application services...
docker compose -f %WEB_FILE% up -d --build --remove-orphans
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to start services
    exit /b 1
)

echo [SUCCESS] Setup completed successfully!
echo [INFO] The application is now running. You can access it at:
echo [INFO] - Frontend: http://localhost:5173
echo [INFO] - Backend API: http://localhost:8000
echo [INFO] - Admin interface: http://localhost:8000/admin/
echo [INFO] - Flower dashboard: http://localhost:5555
echo [INFO] - Garage Web UI: http://localhost:3909

exit /b 0
