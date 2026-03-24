# django_hans/core/exceptions.py
import logging

from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import IntegrityError
from rest_framework import status
from rest_framework.exceptions import (
    APIException,
)
from rest_framework.exceptions import (
    ValidationError as DRFValidationError,
)
from rest_framework.response import Response
from rest_framework.views import exception_handler

logger = logging.getLogger(__name__)


class ConflictError(APIException):
    status_code = status.HTTP_409_CONFLICT
    default_detail = "A conflict occurred."
    default_code = "conflict"


class ServiceUnavailableError(APIException):
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    default_detail = "Service temporarily unavailable."
    default_code = "service_unavailable"


def custom_exception_handler(exc, context):
    # Convert Django's ValidationError to DRF's so it gets treated as 422
    if isinstance(exc, DjangoValidationError):
        exc = DRFValidationError(detail=exc.messages)

    # Remap DRF's ValidationError from 400 → 422
    if isinstance(exc, DRFValidationError):
        exc.status_code = status.HTTP_422_UNPROCESSABLE_ENTITY

    # Let DRF handle what it knows (401, 403, 404, 405, 409, 422, 503...)
    response = exception_handler(exc, context)

    if response is not None:
        return response

    # IntegrityError from DB unique/FK constraints → 409
    if isinstance(exc, IntegrityError):
        return Response(
            {"errors": {"detail": "A resource with this data already exists."}},
            status=status.HTTP_409_CONFLICT,
        )

    # Catch-all → 500, log it for investigation
    logger.exception("Unhandled exception in API view: %s", exc)
    return Response(
        {"errors": {"detail": "An unexpected error occurred."}},
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
