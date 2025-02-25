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
