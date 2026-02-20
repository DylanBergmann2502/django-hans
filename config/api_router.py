# config/api_router.py
from django.conf import settings
from rest_framework.routers import DefaultRouter, SimpleRouter

router = DefaultRouter() if settings.DEBUG else SimpleRouter()

app_name = "api"
urlpatterns = router.urls
