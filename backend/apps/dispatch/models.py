from django.conf import settings
from django.db import models

from apps.orders.models import Order


class AIRecommendation(models.Model):
    """Log of the (simulated, rule-based) smart-dispatch suggestions."""

    order = models.ForeignKey(
        Order, on_delete=models.CASCADE, related_name="recommendations"
    )
    recommended_driver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="recommendations",
        limit_choices_to={"role": "driver"},
    )
    score = models.FloatField(default=0)
    reason = models.CharField(max_length=255, blank=True)
    accepted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Rec for #{self.order_id}: driver {self.recommended_driver_id} ({self.score})"
