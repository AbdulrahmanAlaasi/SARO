from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from apps.common.permissions import IsAdmin
from .models import Plan, Subscription
from .serializers import PlanSerializer, SubscriptionSerializer


class PlanViewSet(viewsets.ModelViewSet):
    queryset = Plan.objects.all()
    serializer_class = PlanSerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [IsAuthenticated()]
        return [IsAdmin()]


class SubscriptionViewSet(viewsets.ModelViewSet):
    serializer_class = SubscriptionSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role in ("admin", "branch_supervisor") or user.is_superuser:
            return Subscription.objects.all()
        return Subscription.objects.filter(customer=user)

    def perform_create(self, serializer):
        serializer.save(customer=self.request.user)
