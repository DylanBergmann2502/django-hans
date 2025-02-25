@echo off
setlocal

:: Navigate to project root
cd %~dp0\..

:: Use ENV from environment or default to local
if "%ENV%"=="" set ENV=local
set COMPOSE_FILE=deploy/%ENV%/web.yml

:: Validate environment
if not "%ENV%"=="local" if not "%ENV%"=="production" (
    echo Error: Invalid environment. Must be 'local' or 'production'
    exit /b 1
)

if not exist "%COMPOSE_FILE%" (
    echo Error: Compose file not found: %COMPOSE_FILE%
    exit /b 1
)

if "%1"=="" goto help
if "%1"=="check" goto check
if "%1"=="build" goto build
if "%1"=="up" goto up
if "%1"=="start" goto start
if "%1"=="start-lite" goto start-lite
if "%1"=="stop" goto stop
if "%1"=="down" goto down
if "%1"=="logs" goto logs
if "%1"=="ps" goto ps
if "%1"=="restart" goto restart
if "%1"=="vue" goto vue
if "%1"=="django" goto django
if "%1"=="shell" goto shell
if "%1"=="script" goto script
if "%1"=="format" goto format
if "%1"=="freeze" goto freeze
goto help

:check
echo Checking Docker installations...
docker --version
docker compose version
goto :eof

:build
docker compose -f %COMPOSE_FILE% build
goto :eof

:up
docker compose -f %COMPOSE_FILE% up %2 %3 %4 %5 %6 %7 %8 %9
goto :eof

:start
docker compose -f %COMPOSE_FILE% up --build --remove-orphans %2 %3 %4 %5 %6 %7 %8 %9
goto :eof

:start-lite
docker compose -f %COMPOSE_FILE% up --build --remove-orphans postgres django vue
goto :eof

:stop
docker compose -f %COMPOSE_FILE% stop %2 %3 %4 %5 %6 %7 %8 %9
goto :eof

:down
docker compose -f %COMPOSE_FILE% down %2 %3 %4 %5 %6 %7 %8 %9
goto :eof

:logs
docker compose -f %COMPOSE_FILE% logs -f
goto :eof

:ps
docker compose -f %COMPOSE_FILE% ps
goto :eof

:restart
docker compose -f %COMPOSE_FILE% restart
goto :eof

:vue
docker compose -f %COMPOSE_FILE% exec vue %2 %3 %4 %5 %6 %7 %8 %9
goto :eof

:django
docker compose -f %COMPOSE_FILE% run --rm django python manage.py %2 %3 %4 %5 %6 %7 %8 %9
goto :eof

:shell
docker compose -f %COMPOSE_FILE% run --rm django python manage.py shell_plus
goto :eof

:script
docker compose -f %COMPOSE_FILE% run --rm django python manage.py runscript %2
goto :eof

:format
docker compose -f %COMPOSE_FILE% run --rm django ruff format .
goto :eof

:freeze
docker compose -f %COMPOSE_FILE% run --rm django pip list --format=freeze > requirements.lock
goto :eof

:help
echo Digital Signage Management Commands
echo ==================================
echo Usage:
echo   .\bin\run.bat ^<command^>                        # Uses local environment
echo   set ENV=production ^& .\bin\run.bat ^<command^>  # Uses production environment
echo.
echo Basic Commands:
echo   check              - Check Docker installations
echo   build              - Build all containers
echo   up [options]       - Start containers with optional arguments
echo   start [options]    - Build and start containers with orphan removal
echo   start-lite         - Build and start only `django`, `postgres`, and `vue`
echo   stop [options]     - Stop containers with optional arguments
echo   down [options]     - Stop and remove containers with optional arguments
echo   logs               - View container logs
echo   ps                 - List running containers
echo   restart            - Restart all containers
echo.
echo Vue Commands:
echo   vue ^<command^>   - Run any Vue/NPM/Vite command
echo.
echo Django Commands:
echo   django ^<command^>   - Run any Django management command
echo   shell                - Open Django shell_plus
echo   script ^<name^>      - Run a Django script
echo   format               - Format Python code with ruff
echo   freeze               - Update requirements.lock
goto :eof
