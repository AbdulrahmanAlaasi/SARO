from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.notifications.models import Notification
from .models import (
    DeliveryMethod,
    Order,
    OrderStatus,
    OrderStatusLog,
    Rating,
    generate_pickup_code,
)
from .serializers import OrderSerializer, RatingSerializer

User = get_user_model()

# Allowed forward transitions for drivers
NEXT_STATUS = {
    OrderStatus.ASSIGNED: [OrderStatus.PICKED_UP, OrderStatus.FAILED],
    OrderStatus.PICKED_UP: [OrderStatus.IN_TRANSIT, OrderStatus.FAILED],
    OrderStatus.IN_TRANSIT: [OrderStatus.DELIVERED, OrderStatus.FAILED],
}


def log_status(order, new_status, by, note=""):
    order.status = new_status
    order.save(update_fields=["status", "updated_at"])
    OrderStatusLog.objects.create(order=order, status=new_status, by=by, note=note)


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Order.objects.select_related("customer", "driver", "branch", "address")
        if user.is_superuser or user.role == "admin":
            return qs
        if user.role == "branch_supervisor":
            branch_ids = user.supervised_branches.values_list("id", flat=True)
            return qs.filter(branch_id__in=branch_ids)
        if user.role == "driver":
            return qs.filter(driver=user)
        return qs.filter(customer=user)

    def perform_create(self, serializer):
        order = serializer.save(customer=self.request.user, status=OrderStatus.CREATED)
        if order.delivery_method == DeliveryMethod.LOCKER and not order.pickup_code:
            order.pickup_code = generate_pickup_code()
            order.save(update_fields=["pickup_code"])
        OrderStatusLog.objects.create(
            order=order, status=OrderStatus.CREATED, by=self.request.user
        )

    # --- Admin/branch: assign a driver ---
    @action(detail=True, methods=["post"])
    def assign(self, request, pk=None):
        if request.user.role not in ("admin", "branch_supervisor") and not request.user.is_superuser:
            return Response({"detail": "Not allowed."}, status=403)
        order = self.get_object()
        driver_id = request.data.get("driver")
        driver = get_object_or_404(User, pk=driver_id, role="driver")
        order.driver = driver
        order.save(update_fields=["driver"])
        log_status(order, OrderStatus.ASSIGNED, request.user, note=f"Assigned to {driver.username}")
        Notification.objects.create(
            user=driver, type="assignment", title="New delivery assigned",
            body=f"Order #{order.id} has been assigned to you.",
        )
        return Response(OrderSerializer(order).data)

    # --- Driver: advance status ---
    @action(detail=True, methods=["post"], url_path="status")
    def set_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get("status")
        if request.user.role == "driver" and order.driver_id != request.user.id:
            return Response({"detail": "Not your order."}, status=403)
        allowed = NEXT_STATUS.get(order.status, [])
        is_staff = request.user.role in ("admin", "branch_supervisor") or request.user.is_superuser
        if new_status not in [s.value for s in allowed] and not is_staff:
            return Response(
                {"detail": f"Cannot move from {order.status} to {new_status}."},
                status=400,
            )
        log_status(order, new_status, request.user, note=request.data.get("note", ""))
        Notification.objects.create(
            user=order.customer, type="status", title="Order update",
            body=f"Order #{order.id} is now {new_status}.",
        )
        return Response(OrderSerializer(order).data)

    # --- Driver: report a delay ---
    @action(detail=True, methods=["post"])
    def delay(self, request, pk=None):
        order = self.get_object()
        order.is_delayed = True
        order.save(update_fields=["is_delayed"])
        OrderStatusLog.objects.create(
            order=order, status=order.status, by=request.user,
            note="DELAY: " + request.data.get("note", ""),
        )
        Notification.objects.create(
            user=order.customer, type="delay", title="Delivery delayed",
            body=f"Order #{order.id} is delayed.",
        )
        return Response(OrderSerializer(order).data)

    # --- Customer: rate a delivered order ---
    @action(detail=True, methods=["post"])
    def rate(self, request, pk=None):
        order = self.get_object()
        if order.customer_id != request.user.id:
            return Response({"detail": "Not your order."}, status=403)
        if order.status != OrderStatus.DELIVERED:
            return Response({"detail": "Only delivered orders can be rated."}, status=400)
        rating, _ = Rating.objects.update_or_create(
            order=order,
            defaults={
                "stars": int(request.data.get("stars", 5)),
                "comment": request.data.get("comment", ""),
            },
        )
        return Response(RatingSerializer(rating).data, status=status.HTTP_201_CREATED)
