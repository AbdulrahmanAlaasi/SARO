from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.notifications.models import Notification
from apps.orders.models import Order
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer


class ConversationViewSet(viewsets.ModelViewSet):
    serializer_class = ConversationSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.role == "admin":
            return Conversation.objects.all()
        return Conversation.objects.filter(Q(customer=user) | Q(driver=user))

    @action(detail=False, methods=["post"], url_path="for-order")
    def for_order(self, request):
        """Get or create the conversation for an order (links customer + driver)."""
        order = get_object_or_404(Order, pk=request.data.get("order"))
        if not order.driver_id:
            return Response({"detail": "Order has no assigned driver yet."}, status=400)
        if request.user.id not in (order.customer_id, order.driver_id) and request.user.role != "admin":
            return Response({"detail": "Not allowed."}, status=403)
        convo, _ = Conversation.objects.get_or_create(
            order=order, customer=order.customer, driver=order.driver
        )
        return Response(ConversationSerializer(convo).data)

    @action(detail=True, methods=["post"])
    def send(self, request, pk=None):
        convo = self.get_object()
        if request.user.id not in (convo.customer_id, convo.driver_id):
            return Response({"detail": "Not allowed."}, status=403)
        msg = Message.objects.create(
            conversation=convo, sender=request.user, body=request.data.get("body", "")
        )
        recipient = convo.driver if request.user.id == convo.customer_id else convo.customer
        Notification.objects.create(
            user=recipient, type="message", title="New message",
            body=f"New message on order #{convo.order_id}.",
        )
        return Response(MessageSerializer(msg).data)
