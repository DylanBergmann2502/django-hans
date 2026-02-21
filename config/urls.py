# config/urls.py
# ruff: noqa
from django.conf import settings
from django.contrib import admin
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.urls import include, path
from redis.asyncio import Redis as AsyncRedis
from health_check.views import HealthCheckView
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)
from drf_spectacular.renderers import OpenApiJsonRenderer as JSONOpenAPIRenderer

urlpatterns = [
    # Django Admin
    path(settings.ADMIN_URL, admin.site.urls),

    # Health Checks
    path(
        "health/",
        HealthCheckView.as_view(
            checks=[
                "health_check.Database",
                "health_check.Cache",
                "health_check.Storage",
                "health_check.contrib.celery.Ping",
                ("health_check.contrib.redis.Redis", {"client": AsyncRedis.from_url(settings.REDIS_URL)}),
            ]
        ),
    ),

    # API base URL
    # Hard code the v1 version, which can simplify
    # the current code organization
    # and can be refactored in the future
    path("api/v1/", include("config.api_router")),

    # Authentication
    path("api/v1/auth/", include("dj_rest_auth.urls")),
    path("api/v1/auth/registration/", include("dj_rest_auth.registration.urls")),

    # API Documentation
    path("api/schema/", SpectacularAPIView.as_view(renderer_classes=[JSONOpenAPIRenderer]), name="api-schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="api-schema"),
        name="api-docs",
    ),
    path(
        "api/redoc/",
        SpectacularRedocView.as_view(url_name="api-schema"),
        name="api-redoc",
    ),
]

# Debug toolbar
if settings.DEBUG and "debug_toolbar" in settings.INSTALLED_APPS:
    import debug_toolbar

    urlpatterns = [path("__debug__/", include(debug_toolbar.urls))] + urlpatterns

if settings.DEBUG:
    # Static file serving when using Gunicorn + Uvicorn for local web socket development
    urlpatterns += staticfiles_urlpatterns()
