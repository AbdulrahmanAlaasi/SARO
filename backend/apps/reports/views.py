from django.db.models import Avg, Count
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from apps.common.permissions import IsAdminOrBranch
from apps.orders.models import Order, OrderStatus, Rating


@api_view(["GET"])
@permission_classes([IsAdminOrBranch])
def kpis(request):
    orders = Order.objects.all()
    by_status = dict(
        orders.values_list("status").annotate(c=Count("id")).values_list("status", "c")
    )
    by_method = dict(
        orders.values_list("delivery_method")
        .annotate(c=Count("id"))
        .values_list("delivery_method", "c")
    )
    avg_rating = Rating.objects.aggregate(a=Avg("stars"))["a"] or 0
    return Response({
        "total_orders": orders.count(),
        "delayed": orders.filter(is_delayed=True).count(),
        "delivered": orders.filter(status=OrderStatus.DELIVERED).count(),
        "active": orders.exclude(
            status__in=[OrderStatus.DELIVERED, OrderStatus.FAILED]
        ).count(),
        "by_status": by_status,
        "by_method": by_method,
        "avg_rating": round(avg_rating, 2),
    })
