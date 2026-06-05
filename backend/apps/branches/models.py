from django.conf import settings
from django.db import models


class Branch(models.Model):
    name = models.CharField(max_length=120)
    name_ar = models.CharField(max_length=120, blank=True)
    city = models.CharField(max_length=80)
    district = models.CharField(max_length=120, blank=True)
    supervisor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="supervised_branches",
        limit_choices_to={"role": "branch_supervisor"},
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Branches"
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.city})"
