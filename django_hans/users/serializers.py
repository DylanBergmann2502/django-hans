# django_hans/users/serializers.py
from allauth.account.adapter import get_adapter
from allauth.account.utils import setup_user_email
from django.contrib.auth import authenticate
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import exceptions, serializers


class LoginSerializer(serializers.Serializer):
    """
    Custom login serializer — email + password only, no username field.
    Replaces dj-rest-auth's default LoginSerializer via REST_AUTH setting.
    """

    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(
            self.context["request"],
            email=attrs["email"],
            password=attrs["password"],
        )
        if not user:
            msg = "Unable to log in with provided credentials."
            raise exceptions.ValidationError(msg)
        if not user.is_active:
            msg = "User account is disabled."
            raise exceptions.ValidationError(msg)
        attrs["user"] = user
        return attrs


class RegisterSerializer(serializers.Serializer):
    """
    Custom registration serializer — email + password only, no username field.
    Replaces dj-rest-auth's default RegisterSerializer via REST_AUTH setting.
    """

    email = serializers.EmailField(required=True)
    password1 = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    def validate_email(self, email):
        return get_adapter().clean_email(email)

    def validate_password1(self, password):
        return get_adapter().clean_password(password)

    def validate(self, data):
        if data["password1"] != data["password2"]:
            raise serializers.ValidationError(
                {"password2": "The two password fields didn't match."},
            )
        return data

    def get_cleaned_data(self):
        return {
            "email": self.validated_data.get("email", ""),
            "password1": self.validated_data.get("password1", ""),
        }

    def save(self, request):
        adapter = get_adapter()
        user = adapter.new_user(request)
        self.cleaned_data = self.get_cleaned_data()
        user = adapter.save_user(request, user, self, commit=False)
        if "password1" in self.cleaned_data:
            try:
                adapter.clean_password(self.cleaned_data["password1"], user=user)
            except DjangoValidationError as exc:
                raise serializers.ValidationError(
                    detail=serializers.as_serializer_error(exc),
                ) from exc
        user.save()
        setup_user_email(request, user, [])
        return user
