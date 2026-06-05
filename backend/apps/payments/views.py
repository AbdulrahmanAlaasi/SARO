from rest_framework import viewsets

from .models import Payment
from .serializers import PaymentSerializer


class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == "admin" or user.is_superuser:
            return Payment.objects.all()
        return Payment.objects.filter(customer=user)

    def perform_create(self, serializer):
        serializer.save(customer=self.request.user)
