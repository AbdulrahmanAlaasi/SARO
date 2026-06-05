"""Rule-based smart dispatch (simulated — NOT real ML or live traffic).

Scores available drivers for an order using simple, explainable rules:
- same branch / same city as the order  -> location relevance
- current active workload                -> load balancing
- order priority                         -> urgency weighting
Returns ranked candidates; the top one is logged as an AIRecommendation.
"""

from django.contrib.auth import get_user_model

from apps.orders.models import Order, OrderStatus
from .models import AIRecommendation

User = get_user_model()

ACTIVE_STATUSES = [
    OrderStatus.ASSIGNED,
    OrderStatus.PICKED_UP,
    OrderStatus.IN_TRANSIT,
]


def _driver_active_load(driver) -> int:
    return Order.objects.filter(
        driver=driver, status__in=ACTIVE_STATUSES
    ).count()


def score_drivers(order: Order):
    """Return a list of dicts: {driver, score, reason} sorted best-first."""
    drivers = User.objects.filter(role="driver", is_active=True)
    order_city = (order.address.city if order.address else "").lower()
    branch_id = order.branch_id

    results = []
    for d in drivers:
        score = 50.0
        reasons = []

        # Location relevance
        if branch_id and d.supervised_branches.filter(id=branch_id).exists():
            score += 20
            reasons.append("same branch")

        # Workload (lighter load scores higher)
        load = _driver_active_load(d)
        score += max(0, 20 - load * 5)
        reasons.append(f"load={load}")

        # Priority urgency
        if order.priority == "high":
            score += 10
            reasons.append("high priority")

        results.append(
            {"driver": d, "score": round(score, 1), "reason": ", ".join(reasons)}
        )

    results.sort(key=lambda r: r["score"], reverse=True)
    return results


def recommend_driver(order: Order):
    """Compute and persist the top recommendation. Returns AIRecommendation or None."""
    ranked = score_drivers(order)
    if not ranked:
        return None
    best = ranked[0]
    return AIRecommendation.objects.create(
        order=order,
        recommended_driver=best["driver"],
        score=best["score"],
        reason=best["reason"],
    )
