from rest_framework import serializers

from .models import Conversation, Message


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source="sender.username", read_only=True)

    class Meta:
        model = Message
        fields = ("id", "conversation", "sender", "sender_name", "body", "is_read", "created_at")
        read_only_fields = ("sender", "is_read")


class ConversationSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source="customer.username", read_only=True)
    driver_name = serializers.CharField(source="driver.username", read_only=True)

    class Meta:
        model = Conversation
        fields = ("id", "order", "customer", "customer_name", "driver", "driver_name", "created_at", "messages")
