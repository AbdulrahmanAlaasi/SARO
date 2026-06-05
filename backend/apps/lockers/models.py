from django.db import models

from apps.branches.models import Branch


class Locker(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        FULL = "full", "Full"
        MAINTENANCE = "maintenance", "Maintenance"

    name = models.CharField(max_length=80)
    branch = models.ForeignKey(
        Branch, on_delete=models.SET_NULL, null=True, blank=True, related_name="lockers"
    )
    city = models.CharField(max_length=80)
    district = models.CharField(max_length=120, blank=True)
    location = models.CharField(max_length=200, blank=True)
    total_slots = models.PositiveIntegerField(default=10)
    available_slots = models.PositiveIntegerField(default=10)
    status = models.CharField(
        max_length=12, choices=Status.choices, default=Status.ACTIVE
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.city})"
