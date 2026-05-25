"""Authentication backends for the portfolio admin."""

from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend
from django.db.models import Q

UserModel = get_user_model()


class UsernameOrEmailBackend(ModelBackend):
    """Let users sign in with either their username or their email address.

    Django's default ``ModelBackend`` matches on username only. This subclass
    looks up the account by username *or* email (both case-insensitive) and
    otherwise defers to ``ModelBackend`` for permission checks.
    """

    def authenticate(self, request, username=None, password=None, **kwargs):
        # The admin form posts the value under the user model's USERNAME_FIELD.
        if username is None:
            username = kwargs.get(UserModel.USERNAME_FIELD)
        if username is None or password is None:
            return None

        try:
            user = UserModel._default_manager.get(
                Q(username__iexact=username) | Q(email__iexact=username)
            )
        except UserModel.DoesNotExist:
            # Run the default hasher once to keep the timing similar to a real
            # lookup (mirrors ModelBackend's defence against user enumeration).
            UserModel().set_password(password)
            return None
        except UserModel.MultipleObjectsReturned:
            # Ambiguous — e.g. the same email on several accounts. Refuse rather
            # than guess which user was meant.
            return None

        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None
