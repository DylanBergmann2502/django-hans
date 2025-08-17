# deploy/local/compose/django/Dockerfile
# define an alias for the specific python version used in this file.
FROM docker.io/python:3.13.7-slim-bookworm AS python

# Python build stage
FROM python AS python-build-stage

# Install apt packages
RUN apt-get update && apt-get install --no-install-recommends -y \
  # dependencies for building Python packages
  build-essential \
  # psycopg dependencies
  libpq-dev

# Install uv
RUN pip install uv

# Copy pyproject.toml and install dependencies
COPY ./pyproject.toml .

# Install Python dependencies using uv
RUN uv pip install --system .


# Python 'run' stage
FROM python AS python-run-stage

ARG APP_HOME=/app

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

WORKDIR ${APP_HOME}


# devcontainer dependencies and utils
RUN apt-get update && apt-get install --no-install-recommends -y \
  sudo git bash-completion nano ssh

# Create devcontainer user and add it to sudoers
RUN groupadd --gid 1000 dev-user \
  && useradd --uid 1000 --gid dev-user --shell /bin/bash --create-home dev-user \
  && echo dev-user ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/dev-user \
  && chmod 0440 /etc/sudoers.d/dev-user


# Install required system dependencies
RUN apt-get update && apt-get install --no-install-recommends -y \
  # psycopg dependencies
  libpq-dev  \
  wait-for-it \
  postgresql-client \
  # health checks and pings
  curl \
  # Translations dependencies
  gettext \
  # cleaning up unused files
  && apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false \
  && rm -rf /var/lib/apt/lists/*

# Install uv in runtime stage
RUN pip install uv

# Copy pyproject.toml and install dependencies
COPY ./pyproject.toml .

# Install Python dependencies using uv
RUN uv pip install --system .

COPY ./deploy/local/compose/django/entrypoint /entrypoint
RUN sed -i 's/\r$//g' /entrypoint
RUN chmod +x /entrypoint

COPY ./deploy/local/compose/django/start /start
RUN sed -i 's/\r$//g' /start
RUN chmod +x /start

COPY ./deploy/local/compose/django/migrate /migrate
RUN sed -i 's/\r$//g' /migrate
RUN chmod +x /migrate


COPY ./deploy/local/compose/django/celery/worker/start /start-celery-worker
RUN sed -i 's/\r$//g' /start-celery-worker
RUN chmod +x /start-celery-worker

COPY ./deploy/local/compose/django/celery/beat/start /start-celery-beat
RUN sed -i 's/\r$//g' /start-celery-beat
RUN chmod +x /start-celery-beat

COPY ./deploy/local/compose/django/celery/flower/start /start-flower
RUN sed -i 's/\r$//g' /start-flower
RUN chmod +x /start-flower


# copy application code to WORKDIR
COPY . ${APP_HOME}

ENTRYPOINT ["/entrypoint"]
