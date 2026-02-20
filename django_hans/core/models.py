# django_hans/core/models.py
import uuid

from django.db import models
from model_utils.models import TimeStampedModel


class BaseModel(TimeStampedModel):
    """Base model for all models in the project"""

    class Meta:
        abstract = True

    @property
    def created_at(self):
        return self.created

    @property
    def updated_at(self):
        return self.modified


class UUIDBaseModel(BaseModel):
    """Base model with a UUIDv7 primary key"""

    id = models.UUIDField(primary_key=True, default=uuid.uuid7, editable=False)

    class Meta:
        abstract = True
