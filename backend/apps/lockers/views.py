from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from apps.common.permissions import IsAdminOrBranch
from .models import Locker
from .serializers import LockerSerializer


class LockerViewSet(viewsets.ModelViewSet):
    queryset = Locker.objects.all()
    serializer_class = LockerSerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [IsAuthenticated()]
        return [IsAdminOrBranch()]
