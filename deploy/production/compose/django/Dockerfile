# deploy/production/compose/django/Dockerfile
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

RUN addgroup --system django \
  && adduser --system --ingroup django django


# Install required system dependencies
RUN apt-get update && apt-get install --no-install-recommends -y \
  # psycopg dependencies
  libpq-dev \
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


COPY --chown=django:django ./deploy/production/compose/django/entrypoint /entrypoint
RUN sed -i 's/\r$//g' /entrypoint
RUN chmod +x /entrypoint

COPY --chown=django:django ./deploy/production/compose/django/start /start
RUN sed -i 's/\r$//g' /start
RUN chmod +x /start

COPY --chown=django:django ./deploy/production/compose/django/migrate /migrate
RUN sed -i 's/\r$//g' /migrate
RUN chmod +x /migrate


COPY --chown=django:django ./deploy/production/compose/django/celery/worker/start /start-celery-worker
RUN sed -i 's/\r$//g' /start-celery-worker
RUN chmod +x /start-celery-worker

COPY --chown=django:django ./deploy/production/compose/django/celery/beat/start /start-celery-beat
RUN sed -i 's/\r$//g' /start-celery-beat
RUN chmod +x /start-celery-beat

COPY --chown=django:django ./deploy/production/compose/django/celery/flower/start /start-flower
RUN sed -i 's/\r$//g' /start-flower
RUN chmod +x /start-flower


# copy application code to WORKDIR
COPY --chown=django:django . ${APP_HOME}

# make django owner of the WORKDIR directory as well.
RUN chown -R django:django ${APP_HOME}

# Make staticfiles directory with proper permissions
USER root
RUN mkdir -p /app/staticfiles && \
    chown -R django:django /app/staticfiles && \
    chmod -R 755 /app/staticfiles

USER django

ENTRYPOINT ["/entrypoint"]
