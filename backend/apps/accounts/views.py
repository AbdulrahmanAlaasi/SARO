from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.permissions import IsAdminOrBranch
from .serializers import RegisterSerializer, UserSerializer

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class MeView(APIView):
    def get(self, request):
        return Response(UserSerializer(request.user).data)


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """Admin/branch: list & view users, optionally filtered by ?role=driver."""

    serializer_class = UserSerializer
    permission_classes = [IsAdminOrBranch]

    def get_queryset(self):
        qs = User.objects.all().order_by("username")
        role = self.request.query_params.get("role")
        return qs.filter(role=role) if role else qs
