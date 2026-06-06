from datetime import timedelta

from django.db.models import Avg, Count
from django.http import JsonResponse
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from apps.common.permissions import IsAdminOrBranch
from apps.orders.models import Order, OrderStatus, Rating


def health(request):
    """Simple GET health endpoint used by Railway."""
    return JsonResponse({"status": "ok"})


def _scoped_orders(user):
    """Branch supervisors only see their branches' orders; admins see all."""
    qs = Order.objects.all()
    if user.role == "branch_supervisor" and not user.is_superuser:
        branch_ids = user.supervised_branches.values_list("id", flat=True)
        qs = qs.filter(branch_id__in=branch_ids)
    return qs


@api_view(["GET"])
@permission_classes([IsAdminOrBranch])
def kpis(request):
    orders = _scoped_orders(request.user)
    by_status = dict(
        orders.values_list("status").annotate(c=Count("id")).values_list("status", "c")
    )
    by_method = dict(
        orders.values_list("delivery_method")
        .annotate(c=Count("id"))
        .values_list("delivery_method", "c")
    )
    avg_rating = (
        Rating.objects.filter(order__in=orders).aggregate(a=Avg("stars"))["a"] or 0
    )
    total = orders.count()
    delayed = orders.filter(is_delayed=True).count()

    # Orders over the last 7 days
    today = timezone.now().date()
    daily = []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        daily.append({
            "date": day.isoformat(),
            "count": orders.filter(created_at__date=day).count(),
        })

    return Response({
        "total_orders": total,
        "delayed": delayed,
        "delivered": orders.filter(status=OrderStatus.DELIVERED).count(),
        "active": orders.exclude(
            status__in=[OrderStatus.DELIVERED, OrderStatus.FAILED]
        ).count(),
        "delay_rate": round((delayed / total * 100) if total else 0, 1),
        "by_status": by_status,
        "by_method": by_method,
        "avg_rating": round(avg_rating, 2),
        "daily": daily,
    })
