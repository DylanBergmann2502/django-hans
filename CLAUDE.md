# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Django Hans is an opinionated Django boilerplate for REST API + SPA (Single Page Application) development. It pairs a Django backend with a Vue.js frontend, containerized via Docker Compose.

## Common Commands

All development commands route through `./bin/run` (or `./bin/run.bat` on Windows). Initial setup uses `./bin/setup`.

### Setup & Lifecycle
```bash
./bin/setup          # First-time setup: pulls images, runs migrations, starts services
./bin/run start      # Build and start all services (removes orphans)
./bin/run start:lite # Start only Django, PostgreSQL, Vue (minimal stack)
./bin/run stop       # Stop containers
./bin/run down       # Stop and remove containers
./bin/run logs       # View container logs
./bin/run ps         # List running containers
./bin/run restart    # Restart all containers
```

### Django
```bash
./bin/run django <cmd>          # Run any Django management command
./bin/run django migrate        # Run migrations
./bin/run django makemigrations # Create migrations
./bin/run django createsuperuser
./bin/run shell                 # Django shell_plus
./bin/run script <name>         # Run a script via django-extensions
```

### Testing & Code Quality
```bash
./bin/run pytest           # Run all Python tests
./bin/run pytest <path>    # Run specific test file or directory
./bin/run format           # Format Python code with Ruff
./bin/run lint             # Lint Python code with Ruff
./bin/run mypy             # Run mypy type checking
```

### Frontend (Vue)
```bash
./bin/run vue <cmd>           # Run any npm command inside Vue container
./bin/run vue:lint            # ESLint with auto-fix
./bin/run vue:format          # Format with Prettier
./bin/run vue:test            # Run Vitest unit tests
./bin/run vue:install <pkg>   # Install npm package
./bin/run vue:uninstall <pkg> # Uninstall npm package
./bin/run vue:update          # Update npm packages
./bin/run vue:ncu             # Check for npm package updates
```

### E2E Tests (Playwright)
```bash
# One-time setup inside the Vue container:
npx playwright install
# Then run:
./bin/run vue test:e2e      # Headless E2E tests
./bin/run vue test:e2e:ui   # Interactive UI mode
```

## Architecture

### Stack
- **Backend:** Django 5.x, Django REST Framework, SimpleJWT + dj-rest-auth (auth), Celery + Redis (async tasks), PostgreSQL 18
- **Frontend:** Vue 3 + TypeScript, Pinia (state), Vue Router, PrimeVue + TailwindCSS 4, VueUse, Axios, Vitest, Playwright
- **Storage:** Garage (S3-compatible)
- **Monitoring:** Sentry (production), Flower (Celery), django-health-check at `/health/`

### Directory Layout
- `config/` — Django project configuration (settings, URLs, Celery, ASGI/WSGI)
- `django_hans/` — Django apps (`users/`, `core/`, `contrib/`)
- `web/` — Vue.js SPA (`src/pages/`, `src/layouts/`, `src/stores/`, `src/services/`, `src/router/`, `src/types/`)
- `deploy/local/` — Local Docker Compose (`web.yml`, `setup.yml`, `.envs/`)
- `deploy/production/` — Production Docker Compose with Nginx
- `bin/` — Shell scripts for development workflow
- `newsql/` — Optional Docker Compose files for alternative datastores (Kafka, Cassandra, etc.)

### Settings Structure
Settings are split across `config/settings/`:
- `base.py` — Shared configuration (apps, middleware, auth backends)
- `local.py` — Debug mode, debug toolbar, hot reload
- `production.py` — Gunicorn/Uvicorn, Sentry, S3 storage
- `test.py` — Test database overrides

### Authentication
- Custom `User` model in `django_hans/users/` uses **email** as `USERNAME_FIELD` (no username field)
- JWT via SimpleJWT + dj-rest-auth at `/api/v1/auth/` and `/api/v1/auth/registration/`
- Access token lifetime: 60 minutes; refresh token: 7 days
- django-allauth (`account` + `socialaccount`) is installed as a required dependency of dj-rest-auth registration — not used directly by the app
- Email verification is disabled by default (`ACCOUNT_EMAIL_VERIFICATION: "none"`) — set to `"mandatory"` to require it
- Custom `RegisterSerializer` in `django_hans/users/serializers.py` drops the username field, accepting only `email`, `password1`, `password2`

### API
- DRF router defined in `config/api_router.py`, mounted at `/api/v1/`
- Uses `DefaultRouter` in DEBUG mode (browsable API), `SimpleRouter` in production
- OpenAPI schema at `/api/schema/`, Swagger UI at `/api/docs/`, ReDoc at `/api/redoc/` (admin-only)
- ATOMIC_REQUESTS is enabled — each request runs in a transaction

### Celery
- App defined in `config/celery_app.py`; autodiscovers tasks from all installed apps
- Tasks use `@shared_task` decorator (see `django_hans/users/tasks.py` for example)
- Celery Beat runs as a separate container for scheduled tasks
- Flower dashboard available locally at http://localhost:5555

### Environment Variables
Environment files live in `deploy/local/.envs/` (`.django`, `.postgres`, `.vue`) and `deploy/production/.envs/`. Use `merge_production_dotenvs_in_dotenv.py` to merge production env files into a single `.env`.

## Service URLs (Local Development)
| Service | URL |
|---------|-----|
| Vue frontend | http://localhost:5173 |
| Django API | http://localhost:8000 |
| API docs (Swagger) | http://localhost:8000/api/docs/ |
| Django admin | http://localhost:8000/admin/ |
| Flower (Celery) | http://localhost:5555 |
| Garage S3 API | http://localhost:3900 |
| Garage Web UI | http://localhost:3909 |
| Garage Admin API | http://localhost:3903 |

## Django App Conventions

### Adding a New App
1. Create `django_hans/{app_name}/` with standard structure: `models.py`, `admin.py`, `serializers.py`, `views.py`, `apps.py`, `tasks.py`
2. In `apps.py`, name must be `"django_hans.{app_name}"`
3. Add to `LOCAL_APPS` in `config/settings/base.py`
4. Register viewsets in `config/api_router.py`: `router.register(r'app-name', AppNameViewSet)`

### Models
- Extend `django_hans.core.models.BaseModel` (which extends `model_utils.TimeStampedModel`) to get `created` and `modified` timestamps plus `created_at`/`updated_at` property aliases.

### Testing
- Use `factory_boy` for test fixtures (see `django_hans/users/tests/factories.py` for the `UserFactory` pattern)
- pytest uses `--reuse-db` — test database is reused between runs; use `--create-db` to force recreation
- Settings module for tests: `config.settings.test`

## Vue Frontend Conventions

### File Naming
- Page components: `*Page.vue` (e.g., `LoginPage.vue`)
- Layouts: `*Layout.vue` in `src/layouts/`
- Unit tests: `*.spec.ts` in `__tests__/` subdirectories alongside source files

### Auth Store (`src/stores/auth.ts`)
- Token refs are exported at module level using `useStorage('access_token', null)` — this allows the Axios interceptor to import and share the same reactive refs
- The store watches the `accessToken` ref to sync `isAuthenticated` and auto-fetch the user profile when a token appears (handles cross-tab login)
- On 401, the Axios response interceptor in `src/services/axios.ts` attempts one token refresh before clearing tokens and redirecting to `/login`

### Router (`src/router/`)
- Route meta field `authRequired` controls access: `true` = protected (redirects to `/login?redirect=...`), `false` = guests only (authenticated users are blocked), `undefined` = public

### PrimeVue & Styling
- PrimeVue is configured with the **Aura** theme preset; dark mode is disabled (`darkModeSelector: 'none'`)
- Components are auto-imported via `unplugin-vue-components` + `PrimeVueResolver` — no manual imports needed
- `tailwindcss-primeui` bridges PrimeVue's design tokens with Tailwind classes
- Use semantic color tokens (e.g., `surface-200`, `text-color`) rather than raw hex values

## Code Quality

Pre-commit hooks run automatically on commit: basic file checks, django-upgrade (targeting Django 6.0 syntax), Ruff lint, and Ruff format. Run manually with `pre-commit run --all-files`.

- **Ruff** is configured with an extensive ruleset (see `pyproject.toml`). Migrations and `config/urls.py` are excluded from linting.
- **mypy** uses Django and DRF stubs; excludes migrations.
- **pytest** reuses the test database between runs (`--reuse-db`). Coverage is collected for `django_hans/*` excluding migrations and test files.
- **ESLint** uses flat config (`web/eslint.config.ts`) with Vue, TypeScript, and Prettier integration.

## Garage S3

Garage runs as a single container. Config at `deploy/local/compose/garage/garage.toml`.

- S3 API: port `3900`, region name must be `garage` (matches `s3_region` in the toml)
- Admin API: port `3903`, requires `admin_token` bearer auth
- Web UI: `khairul169/garage-webui` on port `3909`, needs `GARAGE_ADMIN_TOKEN` env var

**Key format:**
- Access key ID: must start with `GK` followed by exactly 12 hex bytes (e.g. `GK5461d36b1ebf0cf4ee601aee`)
- Secret key: must be exactly 32 hex bytes / 64 hex chars

**`DJANGO_AWS_S3_REGION_NAME=garage` is required** — without it botocore can't sign requests for the custom endpoint and Garage returns 400.

**Init flow** (`setup.yml`) — `create_garage_bucket` uses a custom Alpine+garage init image (`Dockerfile.init`) because the garage image is scratch-based (no shell). It: assigns node layout → applies layout → creates bucket → imports key → grants permissions.

## Docker Notes
- Django container is based on `ghcr.io/astral-sh/uv:python3.14-bookworm-slim` and uses **uv** for dependency management (not pip directly).
- Non-root user `dev-user` (uid 1000) is used inside containers.
- Production uses Gunicorn + Uvicorn workers behind Nginx. The Nginx config assumes a master upstream Nginx handles SSL — update `deploy/production/compose/nginx/nginx.conf` if terminating SSL here.
