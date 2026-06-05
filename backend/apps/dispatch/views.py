from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from apps.common.permissions import IsAdminOrBranch
from apps.orders.models import Order
from .serializers import AIRecommendationSerializer
from .services import recommend_driver, score_drivers


@api_view(["POST"])
@permission_classes([IsAdminOrBranch])
def recommend(request):
    """Return ranked driver candidates for an order and log the top pick."""
    order = get_object_or_404(Order, pk=request.data.get("order"))
    ranked = score_drivers(order)
    rec = recommend_driver(order)
    return Response({
        "recommendation": AIRecommendationSerializer(rec).data if rec else None,
        "candidates": [
            {"driver": r["driver"].id, "driver_name": r["driver"].username,
             "score": r["score"], "reason": r["reason"]}
            for r in ranked[:5]
        ],
    })
