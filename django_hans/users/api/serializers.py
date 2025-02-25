# django_hans/users/api/serializers.py
from rest_framework import serializers

from django_hans.users.models import User


class UserSerializer(serializers.ModelSerializer[User]):
    class Meta:
        model = User
        fields = ["name", "url", "email", "is_active", "is_staff", "is_superuser"]

        extra_kwargs = {
            "url": {"view_name": "api:user-detail", "lookup_field": "pk"},
        }
