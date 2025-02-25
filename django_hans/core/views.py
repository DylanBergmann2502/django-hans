# django_hans/core/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db import connections
from django.db.utils import OperationalError
from redis import Redis
from django.conf import settings
import logging
from drf_spectacular.utils import extend_schema
from .serializers import HealthCheckSerializer


logger = logging.getLogger(__name__)


@extend_schema(responses=HealthCheckSerializer)
@api_view(["GET"])
@permission_classes([AllowAny])
def health_check_view(request):
    """
    Basic health check endpoint that verifies:
    1. The API is responsive
    2. Database connections are working
    3. Redis connection is working (if used)
    """
    health_status = {
        'status': 'ok',
        'services': {
            'database': 'ok',
            'redis': 'ok'
        }
    }

    # Check database connection
    try:
        for name in connections:
            connections[name].cursor()
    except OperationalError:
        health_status['status'] = 'error'
        health_status['services']['database'] = 'error'
        logger.error("Database health check failed")

    # Check Redis connection if REDIS_URL is configured
    try:
        redis_client = Redis.from_url(settings.REDIS_URL)
        redis_client.ping()
    except Exception as e:
        health_status['status'] = 'error'
        health_status['services']['redis'] = 'error'
        logger.error(f"Redis health check failed: {str(e)}")

    status_code = 200 if health_status['status'] == 'ok' else 503
    return Response(health_status, status=status_code)
