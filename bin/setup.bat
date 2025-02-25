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

:: Run setup services first
echo [INFO] Running setup services...
docker compose -f %SETUP_FILE% up --build -d --remove-orphans
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to start setup services
    exit /b 1
)

:: Wait for setup services to complete their tasks
echo [INFO] Waiting for setup services to complete...

:CHECK_CONTAINERS
docker ps --format "{{.Names}}" > temp_containers.txt
findstr /B /L /C:"django_hans_local_create_minio_buckets" temp_containers.txt > nul
set MINIO_BUCKETS_RUNNING=%ERRORLEVEL%
del temp_containers.txt

if %MINIO_BUCKETS_RUNNING% neq 0 (
    goto SETUP_COMPLETE
)
timeout /t 2 /nobreak > nul
goto CHECK_CONTAINERS

:SETUP_COMPLETE
:: Stop setup services
echo [INFO] Setup services complete. Clean them up...
docker compose -f %SETUP_FILE% down --remove-orphans

echo [INFO] Building project containers...
docker compose -f %WEB_FILE% build
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to build containers
    exit /b 1
)

echo [INFO] Starting PostgreSQL container...
docker compose -f %WEB_FILE% up -d postgres
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to start PostgreSQL
    exit /b 1
)

:: Wait for PostgreSQL to be ready
echo [INFO] Waiting for PostgreSQL to be ready...
timeout /t 10 /nobreak > nul

echo [INFO] Running migrations...
docker compose -f %WEB_FILE% run --rm django python manage.py migrate
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to run migrations
    docker compose -f %WEB_FILE% down
    exit /b 1
)

echo [INFO] Stopping PostgreSQL service...
docker compose -f %WEB_FILE% stop postgres

echo [INFO] Starting all main application services...
docker compose -f %WEB_FILE% up -d --remove-orphans
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
echo [INFO] - MinIO Console: http://localhost:9001

exit /b 0
