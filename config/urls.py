# config/urls.py
# ruff: noqa
from django.conf import settings
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework.authtoken.views import obtain_auth_token

urlpatterns = [
    # Django Admin
    path(settings.ADMIN_URL, admin.site.urls),

    # System urls
    path("", include("django_hans.core.urls")),

    # API base URL
    # Hard code the v1, which can simplify the current code organization and can be refactored in the future
    path("api/v1/", include("config.api_router")),

    # Authentication
    path("api/v1/auth/token/", obtain_auth_token),

    # API Documentation
    path("api/schema/", SpectacularAPIView.as_view(), name="api-schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="api-schema"),
        name="api-docs",
    ),
]

# Debug toolbar
if settings.DEBUG and "debug_toolbar" in settings.INSTALLED_APPS:
    import debug_toolbar
    urlpatterns = [path("__debug__/", include(debug_toolbar.urls))] + urlpatterns
