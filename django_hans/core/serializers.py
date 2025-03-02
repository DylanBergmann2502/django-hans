# django_hans/core/serializers.py
from rest_framework import serializers


class HealthCheckSerializer(serializers.Serializer):
    status = serializers.CharField()
    services = serializers.DictField(child=serializers.CharField())
