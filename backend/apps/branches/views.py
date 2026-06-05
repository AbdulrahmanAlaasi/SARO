from rest_framework import viewsets
from rest_framework.permissions import AllowAny

from apps.common.permissions import IsAdminOrBranch
from .models import Branch
from .serializers import BranchSerializer


class BranchViewSet(viewsets.ModelViewSet):
    queryset = Branch.objects.filter(is_active=True)
    serializer_class = BranchSerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]  # public website needs the branch list
        return [IsAdminOrBranch()]
