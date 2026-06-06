from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.accounts.views import UserViewSet
from apps.addresses.views import AddressViewSet
from apps.branches.views import BranchViewSet
from apps.dispatch.views import recommend
from apps.lockers.views import LockerViewSet
from apps.messaging.views import ConversationViewSet
from apps.notifications.views import NotificationViewSet
from apps.orders.views import OrderViewSet, track_order
from apps.payments.views import PaymentViewSet
from apps.reports.views import health, kpis
from apps.subscriptions.views import PlanViewSet, SubscriptionViewSet

router = DefaultRouter()
router.register("users", UserViewSet, basename="user")
router.register("addresses", AddressViewSet, basename="address")
router.register("branches", BranchViewSet, basename="branch")
router.register("lockers", LockerViewSet, basename="locker")
router.register("orders", OrderViewSet, basename="order")
router.register("plans", PlanViewSet, basename="plan")
router.register("subscriptions", SubscriptionViewSet, basename="subscription")
router.register("payments", PaymentViewSet, basename="payment")
router.register("conversations", ConversationViewSet, basename="conversation")
router.register("notifications", NotificationViewSet, basename="notification")

urlpatterns = [
    path("health/", health, name="health"),
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.accounts.urls")),
    path("api/track/<str:code>/", track_order, name="track-order"),
    path("api/dispatch/recommend/", recommend, name="dispatch-recommend"),
    path("api/reports/kpis/", kpis, name="reports-kpis"),
    path("api/", include(router.urls)),
]
