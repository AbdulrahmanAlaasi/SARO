from rest_framework import serializers

from .models import Order, OrderStatusLog, Rating


class OrderStatusLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderStatusLog
        fields = ("id", "status", "note", "by", "created_at")


class RatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rating
        fields = ("id", "order", "stars", "comment", "created_at")
        read_only_fields = ("order",)


class OrderSerializer(serializers.ModelSerializer):
    status_logs = OrderStatusLogSerializer(many=True, read_only=True)
    rating = RatingSerializer(read_only=True)
    customer_name = serializers.CharField(source="customer.username", read_only=True)
    driver_name = serializers.CharField(source="driver.username", read_only=True, default=None)

    class Meta:
        model = Order
        fields = (
            "id", "customer", "customer_name", "driver", "driver_name", "branch",
            "address", "delivery_method", "status", "priority",
            "package_description", "delivery_instructions", "locker", "pickup_code",
            "is_delayed", "scheduled_time", "created_at", "updated_at",
            "status_logs", "rating",
        )
        read_only_fields = (
            "customer", "driver", "status", "pickup_code", "is_delayed",
            "created_at", "updated_at",
        )
