from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom user with a role for SARO's four actor types."""

    class Role(models.TextChoices):
        CUSTOMER = "customer", "Customer"
        DRIVER = "driver", "Driver"
        ADMIN = "admin", "Admin"
        BRANCH_SUPERVISOR = "branch_supervisor", "Branch Supervisor"

    role = models.CharField(
        max_length=20, choices=Role.choices, default=Role.CUSTOMER
    )
    phone = models.CharField(max_length=20, blank=True)  # never exposed in messaging (PDPL)
    preferred_language = models.CharField(
        max_length=2, choices=[("en", "English"), ("ar", "Arabic")], default="ar"
    )

    def __str__(self):
        return f"{self.username} ({self.role})"
