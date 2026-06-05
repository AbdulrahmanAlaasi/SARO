import random

from django.conf import settings
from django.db import models

from apps.addresses.models import Address
from apps.branches.models import Branch
from apps.lockers.models import Locker


class DeliveryMethod(models.TextChoices):
    HOME = "home", "Home delivery"
    LOCKER = "locker", "Smart locker"
    HOME_BOX = "home_box", "Home box"
    OVER_THE_WALL = "over_the_wall", "Over-the-wall"


class OrderStatus(models.TextChoices):
    CREATED = "created", "Created"
    ASSIGNED = "assigned", "Assigned"
    PICKED_UP = "picked_up", "Picked up"
    IN_TRANSIT = "in_transit", "In transit"
    DELIVERED = "delivered", "Delivered"
    FAILED = "failed", "Failed"


class Priority(models.TextChoices):
    LOW = "low", "Low"
    NORMAL = "normal", "Normal"
    HIGH = "high", "High"


def generate_pickup_code():
    return f"{random.randint(100000, 999999)}"


class Order(models.Model):
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="orders"
    )
    driver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="deliveries",
        limit_choices_to={"role": "driver"},
    )
    branch = models.ForeignKey(
        Branch, on_delete=models.SET_NULL, null=True, blank=True, related_name="orders"
    )
    address = models.ForeignKey(
        Address, on_delete=models.SET_NULL, null=True, blank=True, related_name="orders"
    )
    delivery_method = models.CharField(
        max_length=15, choices=DeliveryMethod.choices, default=DeliveryMethod.HOME
    )
    status = models.CharField(
        max_length=12, choices=OrderStatus.choices, default=OrderStatus.CREATED
    )
    priority = models.CharField(
        max_length=8, choices=Priority.choices, default=Priority.NORMAL
    )
    package_description = models.CharField(max_length=255, blank=True)
    delivery_instructions = models.TextField(
        blank=True, help_text="e.g. over-the-wall placement instructions"
    )
    locker = models.ForeignKey(
        Locker, on_delete=models.SET_NULL, null=True, blank=True, related_name="orders"
    )
    pickup_code = models.CharField(max_length=6, blank=True)
    is_delayed = models.BooleanField(default=False)
    scheduled_time = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Order #{self.pk} ({self.status})"


class OrderStatusLog(models.Model):
    order = models.ForeignKey(
        Order, on_delete=models.CASCADE, related_name="status_logs"
    )
    status = models.CharField(max_length=12, choices=OrderStatus.choices)
    note = models.CharField(max_length=255, blank=True)
    by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"#{self.order_id} -> {self.status}"


class Rating(models.Model):
    order = models.OneToOneField(
        Order, on_delete=models.CASCADE, related_name="rating"
    )
    stars = models.PositiveSmallIntegerField(default=5)
    comment = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"#{self.order_id}: {self.stars}★"
