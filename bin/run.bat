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
if "%1"=="stop" goto stop
if "%1"=="down" goto down
if "%1"=="logs" goto logs
if "%1"=="ps" goto ps
if "%1"=="restart" goto restart

:: Vue commands
if "%1"=="vue" goto vue
if "%1"=="vue:lint" goto vue-lint
if "%1"=="vue:format" goto vue-format
if "%1"=="vue:test" goto vue-test
if "%1"=="vue:install" goto vue-install
if "%1"=="vue:uninstall" goto vue-uninstall
if "%1"=="vue:ncu" goto vue-ncu
if "%1"=="vue:update" goto vue-update

:: Django commands
if "%1"=="django" goto django
if "%1"=="shell" goto shell
if "%1"=="script" goto script
if "%1"=="format" goto format
if "%1"=="lint" goto lint
if "%1"=="mypy" goto mypy
if "%1"=="pytest" goto pytest
if "%1"=="pre-commit" goto pre-commit
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
shift
docker compose -f %COMPOSE_FILE% up %*
goto :eof

:start
shift
docker compose -f %COMPOSE_FILE% up --build --remove-orphans %*
goto :eof

:start-lite
docker compose -f %COMPOSE_FILE% up --build --remove-orphans postgres django vue
goto :eof

:stop
shift
docker compose -f %COMPOSE_FILE% stop %*
goto :eof

:down
shift
docker compose -f %COMPOSE_FILE% down %*
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

:: Vue command handlers
:vue
shift
docker compose -f %COMPOSE_FILE% run --rm vue %*
goto :eof

:vue-lint
docker compose -f %COMPOSE_FILE% run --rm vue npm run lint
goto :eof

:vue-format
docker compose -f %COMPOSE_FILE% run --rm vue npm run format
goto :eof

:vue-test
shift
docker compose -f %COMPOSE_FILE% run --rm vue npm run test:unit %*
goto :eof

:vue-install
shift
docker compose -f %COMPOSE_FILE% run --rm vue npm install %*
goto :eof

:vue-uninstall
shift
docker compose -f %COMPOSE_FILE% run --rm vue npm uninstall %*
goto :eof

:vue-ncu
shift
docker compose -f %COMPOSE_FILE% run --rm vue npx npm-check-updates %*
goto :eof

:vue-update
docker compose -f %COMPOSE_FILE% run --rm vue npm update
goto :eof

:: Django command handlers
:django
shift
docker compose -f %COMPOSE_FILE% run --rm django python manage.py %*
goto :eof

:shell
docker compose -f %COMPOSE_FILE% run --rm django python manage.py shell_plus
goto :eof

:script
shift
docker compose -f %COMPOSE_FILE% run --rm django python manage.py runscript %1
goto :eof

:format
shift
:: If no arguments provided, use "." as default
if "%~1"=="" (
    docker compose -f %COMPOSE_FILE% run --rm django ruff format .
) else (
    docker compose -f %COMPOSE_FILE% run --rm django ruff format %*
)
goto :eof

:lint
shift
:: If no arguments provided, use "." as default
if "%~1"=="" (
    docker compose -f %COMPOSE_FILE% run --rm django ruff check .
) else (
    docker compose -f %COMPOSE_FILE% run --rm django ruff check %*
)
goto :eof

:mypy
shift
:: If no arguments provided, use "." as default
if "%~1"=="" (
    docker compose -f %COMPOSE_FILE% run --rm django mypy .
) else (
    docker compose -f %COMPOSE_FILE% run --rm django mypy %*
)
goto :eof

:pytest
shift
docker compose -f %COMPOSE_FILE% run --rm django pytest %*
goto :eof

:pre-commit
shift
docker compose -f %COMPOSE_FILE% run --rm -e GIT_CONFIG_COUNT=1 -e GIT_CONFIG_KEY_0=safe.directory -e GIT_CONFIG_VALUE_0=/app django pre-commit %*
goto :eof

:help
echo Django Hans Management Commands
echo ==================================
echo Usage:
echo   .\bin\run.bat ^<command^>                        # Uses local environment
echo   set ENV=production ^& .\bin\run.bat ^<command^>  # Uses production environment
echo.
echo Basic Commands:
echo   check               - Check Docker installations
echo   build               - Build all containers
echo   up [options]        - Start containers with optional arguments
echo   start [options]     - Build and start containers with orphan removal
echo   stop [options]      - Stop containers with optional arguments
echo   down [options]      - Stop and remove containers with optional arguments
echo   logs                - View container logs
echo   ps                  - List running containers
echo   restart             - Restart all containers
echo.
echo Vue Commands:
echo   vue ^<command^>         - Run any Vue/NPM/Vite command
echo   vue:lint                - Lint Vue code
echo   vue:format              - Format Vue code with Prettier
echo   vue:test [options]      - Run Vue unit tests
echo   vue:install ^<pkg^>     - Install npm package(s)
echo   vue:uninstall ^<pkg^>   - Uninstall npm package(s)
echo   vue:ncu [options]       - Check for npm package updates
echo   vue:update              - Update npm dependencies
echo.
echo Django Commands:
echo   django ^<command^>          - Run any Django management command
echo   shell                       - Open Django shell_plus
echo   script ^<name^>             - Run a Django script
echo   format [paths]              - Format Django code with ruff (defaults to entire codebase)
echo   lint [paths]                - Lint Django code with ruff (defaults to entire codebase)
echo   mypy [paths]                - Run mypy static type checking (defaults to entire codebase)
echo   pytest [options]            - Run Django tests
echo   pre-commit [args]           - Run pre-commit hooks (e.g. run --all-files)
goto :eof
