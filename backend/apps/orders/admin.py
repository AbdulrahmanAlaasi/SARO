from django.contrib import admin

from .models import Order, OrderStatusLog, Rating


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "customer", "driver", "delivery_method", "status", "priority", "is_delayed", "created_at")
    list_filter = ("status", "delivery_method", "priority", "is_delayed")
    search_fields = ("id", "customer__username", "driver__username")


admin.site.register(OrderStatusLog)
admin.site.register(Rating)
