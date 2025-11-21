from __future__ import annotations

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView

from .models import User
from .serializers import LoginSerializer, RegisterSerializer, UserSerializer


def create_jwt_pair_for_user(user: User) -> dict[str, str]:
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


class RegisterView(generics.GenericAPIView):
    """Register a new user and return JWT tokens plus basic user info."""

    serializer_class = RegisterSerializer
    permission_classes = (permissions.AllowAny,)

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        tokens = create_jwt_pair_for_user(user)
        data = {
            "user": UserSerializer(user).data,
            **tokens,
        }
        return Response(data, status=status.HTTP_201_CREATED)


class LoginView(generics.GenericAPIView):
    """Log in an existing user and return JWT tokens plus basic user info."""

    serializer_class = LoginSerializer
    permission_classes = (permissions.AllowAny,)

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        tokens = create_jwt_pair_for_user(user)
        data = {
            "user": UserSerializer(user).data,
            **tokens,
        }
        return Response(data, status=status.HTTP_200_OK)


class MeView(APIView):
    """Return the authenticated user's basic information."""

    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, *args, **kwargs):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class RefreshView(TokenRefreshView):
    """Proxy to SimpleJWT's TokenRefreshView for clarity in routing."""

    permission_classes = (permissions.AllowAny,)


