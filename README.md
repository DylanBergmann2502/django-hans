# Django Hans

An opinionated Django + Vue boilerplate for REST API / SPA development.

[![Built with Cookiecutter Django](https://img.shields.io/badge/built%20with-Cookiecutter%20Django-ff69b4.svg?logo=cookiecutter)](https://github.com/cookiecutter/cookiecutter-django/)
[![Ruff](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/astral-sh/ruff/main/assets/badge/v2.json)](https://github.com/astral-sh/ruff)

License: MIT

## Tech Stack

### Backend
- **Django** + **Django REST Framework**
- **SimpleJWT** + **dj-rest-auth** — JWT auth with token refresh, server-side logout blacklisting
- **Django Allauth** — required dependency of dj-rest-auth registration (`account` + `socialaccount` only)
- **Celery** + **Redis** — async task queue with Beat scheduler
- **PostgreSQL 18**

### Frontend
- **Vue** + **TypeScript** + **Vite**
- **Pinia** — state management (composition API style)
- **Vue Router**
- **PrimeVue** + **TailwindCSS**
- **VueUse** — reactive utilities (`useStorage` for token management, etc.)
- **Axios** — HTTP client with JWT interceptors and auto token refresh
- **Vitest** — unit tests
- **Playwright** — E2E tests (configured, browsers installed separately)

### Infrastructure
- **Garage** — S3-compatible object storage
- **Nginx** — production reverse proxy + static asset serving
- **Sentry** — error monitoring (production)
- **Flower** — Celery task monitoring

## Service URLs (local)

| Service | URL |
|---|---|
| Vue frontend | http://localhost:5173 |
| Django API | http://localhost:8000 |
| Swagger UI | http://localhost:8000/api/docs/ |
| Django admin | http://localhost:8000/admin/ |
| Flower | http://localhost:5555 |
| Garage S3 API | http://localhost:3900 |
| Garage Web UI | http://localhost:3909 |

## Setup

Requires `docker` and `docker compose`.

```sh
docker --version
docker compose version
```

**Unix (WSL, macOS, Linux):**

```sh
chmod +x ./bin/setup ./bin/run
./bin/setup
```

**Windows (Docker Desktop):**

```bat
.\bin\setup.bat
```

The `./bin/setup` script pulls images, runs migrations, and starts all services. See `./bin/run` (or `.\bin\run.bat`) for all available dev shortcuts.

## Common Commands

All commands route through `./bin/run`:

### Lifecycle

```sh
./bin/run start        # Build and start all services
./bin/run stop         # Stop containers
./bin/run down         # Stop and remove containers
./bin/run logs         # Tail container logs
```

### Django

```sh
./bin/run django migrate
./bin/run django makemigrations
./bin/run django createsuperuser
./bin/run shell                    # shell_plus
./bin/run script <name>            # run a django-extensions script
```

### Python code quality

```sh
./bin/run pytest           # Run all tests
./bin/run pytest <path>    # Run specific file or directory
./bin/run format           # Ruff format
./bin/run lint             # Ruff lint
./bin/run mypy             # Type checking
```

### Frontend (Vue)

```sh
./bin/run vue:test         # Vitest unit tests
./bin/run vue:lint         # ESLint with auto-fix
./bin/run vue:format       # Prettier
./bin/run vue:install <pkg>
./bin/run vue:update       # Update npm packages
```

For E2E tests, install Playwright browsers once, then run:

```sh
npx playwright install     # one-time, inside the Vue container
./bin/run vue test:e2e
./bin/run vue test:e2e:ui  # interactive UI mode
```

## Notes

- Generate fresh secrets for `deploy/local/.envs/` and `deploy/production/.envs/` before running.
- The production Nginx config is intentionally minimal — it proxies Django and serves the Vue build. It assumes a **master Nginx** upstream handles domain routing and SSL/TLS termination. If you want to terminate SSL here, update `deploy/production/compose/nginx/nginx.conf` and expose port `443` in `deploy/production/web.yml`.
