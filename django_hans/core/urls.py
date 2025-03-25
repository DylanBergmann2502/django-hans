# django_hans/core/urls.py
from django.urls import path

from .views import health_check_view

app_name = "core"

urlpatterns = [
    path("_health/", health_check_view, name="health_check_view"),
]
