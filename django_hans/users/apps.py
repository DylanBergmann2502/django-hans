# django_hans/users/apps.py
import contextlib

from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class UsersConfig(AppConfig):
    name = "django_hans.users"
    verbose_name = _("Users")

    def ready(self):
        with contextlib.suppress(ImportError):
            pass
