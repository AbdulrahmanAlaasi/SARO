from rest_framework import serializers

from .models import AIRecommendation


class AIRecommendationSerializer(serializers.ModelSerializer):
    driver_name = serializers.CharField(
        source="recommended_driver.username", read_only=True
    )

    class Meta:
        model = AIRecommendation
        fields = (
            "id", "order", "recommended_driver", "driver_name",
            "score", "reason", "accepted", "created_at",
        )
