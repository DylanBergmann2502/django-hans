# Django Hans

This is an opinionated Django boilerplate built on top of Django Cookie Cutter for REST API/SPA apps.

[![Built with Cookiecutter Django](https://img.shields.io/badge/built%20with-Cookiecutter%20Django-ff69b4.svg?logo=cookiecutter)](https://github.com/cookiecutter/cookiecutter-django/)
[![Ruff](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/astral-sh/ruff/main/assets/badge/v2.json)](https://github.com/astral-sh/ruff)

License: MIT

## Techstack

### Backend

- `Django` + `DRF`
- `Django Allauth` (for admin site MVC compatibility)
- `SimpleJWT` + `djoser` (If you don't like this combo, have a look at `django-rest-knox` and/or `dj-rest-auth`, or enhance `SimpleJWT` with HTTPOnly Cookies)

### Frontend

- `Vue.js` + `Pinia` + `Vue Router`
- `PrimeVue` + `TailwindCSS`

### Others

- `Postgres`
- `MinIO/S3`
- `Sentry`
- `Celery`

## Basic Commands

### Installation

- Make sure you have `docker` and `docker compose` installed:

    ```sh
    docker  --version
    docker compose version
    ```

- Set up the project for the first time (developing on `WSl`, `MacOS`, or `Linux` is recommended):

    ```sh
    chmod +x ./bin/setup
    chmod +x ./bin/run
    ./bin/setup
    ```

- If you prefer working with `Docker Desktop`:

    ```sh
    .\bin\setup.bat
    ```

- Have a look at `./bin/run` (or `.\bin\run.bat` for Windows) as it contains many shortcut for ease of development as well as `./bin/setup` (or `.\bin\setup.bat` for Windows) for setting up your project unanimously across team members.

## Useful Commands

- To start up the development server, run:

    ```sh
    docker compose -f deploy/local/web.yml up --build --remove-orphans
    ```

- To run `django` command, use:

    ```sh
    docker compose -f deploy/local/web.yml run --rm django python manage.py <command>
    ```

- To access `django` shell, run:

    ```sh
    docker compose -f deploy/local/web.yml run --rm django python manage.py shell_plus
    ```

- To run `django` script, run:

    ```sh
    docker compose -f deploy/local/web.yml run --rm django python manage.py runscript <script filename>
    ```

- To format python code with `ruff`, run:

    ```sh
    docker compose -f deploy/local/web.yml run --rm django ruff format .
    ```

- To freeze the dependencies to `requirements.lock`, run:

    ```sh
    docker compose -f deploy/local/web.yml run --rm django pip list --format=freeze > requirements.lock
    ```

## Notes

- You should generate new secrets for env variables in `deploy/local/.envs` and `deploy/production/.envs`.

- The current production `nginx` only serves as a proxy and a webserver to host frontend assets. I'm expecting you to have a `master nginx` elsewhere to handle domain routing and/or SSl/TLS termination. If not, you can update the `deploy/production/compose/nginx/nginx.conf` to handle them here and expose port `443` of the `nginx` service in `deploy/production/web.yml`.
