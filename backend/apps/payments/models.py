from django.conf import settings
from django.db import models

from apps.orders.models import Order
from apps.subscriptions.models import Subscription


class Payment(models.Model):
    """Simulated payment record (no real gateway — out of scope)."""

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PAID = "paid", "Paid"
        FAILED = "failed", "Failed"

    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="payments"
    )
    order = models.ForeignKey(
        Order, on_delete=models.SET_NULL, null=True, blank=True, related_name="payments"
    )
    subscription = models.ForeignKey(
        Subscription, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="payments",
    )
    amount = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    method = models.CharField(max_length=30, default="card")
    status = models.CharField(
        max_length=10, choices=Status.choices, default=Status.PAID
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.amount} SAR ({self.status})"
