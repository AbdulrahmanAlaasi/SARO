from django.conf import settings
from django.db import models


class Address(models.Model):
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="addresses"
    )
    label = models.CharField(max_length=60, help_text="e.g. Home, Work")
    city = models.CharField(max_length=80)
    district = models.CharField(max_length=120, blank=True)
    street = models.CharField(max_length=200, blank=True)
    # Saudi National Address short code (stored only; live API is out of scope)
    national_address = models.CharField(max_length=20, blank=True)
    notes = models.CharField(max_length=255, blank=True)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Addresses"
        ordering = ["-is_default", "-created_at"]

    def __str__(self):
        return f"{self.label} — {self.city}"
