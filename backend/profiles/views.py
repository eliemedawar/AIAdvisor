from __future__ import annotations

from rest_framework import generics, permissions

from .models import StudentProfile
from .serializers import StudentProfileSerializer


class ProfileView(generics.RetrieveUpdateAPIView):
    """
    Retrieve and update the current user's profile.

    If a profile does not yet exist for the authenticated user, it will be
    created automatically on first access.
    """

    serializer_class = StudentProfileSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self) -> StudentProfile:
        profile, _created = StudentProfile.objects.get_or_create(
            user=self.request.user
        )
        return profile


