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

:: Wait for the setup-complete service to finish
echo [INFO] Waiting for setup services to complete...
set max_attempts=30
set attempt=0

:WAIT_LOOP
if %attempt% geq %max_attempts% (
    echo [ERROR] Setup timed out after %max_attempts% attempts.
    echo [ERROR] Current status of services:
    docker compose -f %SETUP_FILE% ps
    echo [ERROR] Logs:
    docker compose -f %SETUP_FILE% logs
    exit /b 1
)

:: Check if setup-complete service has finished successfully
docker inspect --format="{{.State.Status}}" django_hans_local_setup_complete > temp_status.txt 2>nul
set /p container_status=<temp_status.txt
del temp_status.txt

if "%container_status%"=="exited" (
    docker inspect --format="{{.State.ExitCode}}" django_hans_local_setup_complete > temp_exit.txt 2>nul
    set /p exit_code=<temp_exit.txt
    del temp_exit.txt

    if "%exit_code%"=="0" (
        echo [INFO] Setup completed successfully!
        goto SETUP_COMPLETE
    ) else (
        echo [ERROR] Setup failed with exit code %exit_code%
        docker compose -f %SETUP_FILE% logs
        exit /b 1
    )
)

:: Check if any services failed
docker compose -f %SETUP_FILE% ps > temp_ps.txt
findstr /R "Exit [1-9]" temp_ps.txt > nul
if %ERRORLEVEL% equ 0 (
    echo [ERROR] One or more setup services failed:
    type temp_ps.txt
    del temp_ps.txt
    docker compose -f %SETUP_FILE% logs
    exit /b 1
)
del temp_ps.txt

set /a attempt+=1
echo [INFO] Waiting for setup to complete (attempt %attempt%/%max_attempts%)...
timeout /t 5 /nobreak > nul
goto WAIT_LOOP

:SETUP_COMPLETE
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
echo [INFO] - MinIO Console: http://localhost:9001

exit /b 0
