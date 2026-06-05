from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from apps.addresses.models import Address
from apps.branches.models import Branch
from apps.lockers.models import Locker
from apps.orders.models import Order, OrderStatus, OrderStatusLog, generate_pickup_code
from apps.subscriptions.models import Plan

User = get_user_model()


class Command(BaseCommand):
    help = "Seed demo data (idempotent) for SARO testing/validation."

    def handle(self, *args, **options):
        def mkuser(username, role, **extra):
            u, created = User.objects.get_or_create(
                username=username,
                defaults={"role": role, "email": f"{username}@saro.test", **extra},
            )
            if created:
                u.set_password("Passw0rd!23")
                u.save()
            return u

        admin = mkuser("admin1", "admin", is_staff=True, is_superuser=True)
        sup = mkuser("branch1", "branch_supervisor")
        d1 = mkuser("driver1", "driver", first_name="Sami")
        d2 = mkuser("driver2", "driver", first_name="Khalid")
        c1 = mkuser("customer1", "customer", first_name="Noura")

        branch, _ = Branch.objects.get_or_create(
            name="Riyadh Central", defaults={"city": "Riyadh", "district": "Olaya", "supervisor": sup}
        )
        Locker.objects.get_or_create(
            name="Olaya Locker A", defaults={"city": "Riyadh", "district": "Olaya", "branch": branch}
        )
        for nm, ar, price in [("Basic", "أساسي", 0), ("Plus", "بلس", 29), ("Pro", "برو", 79)]:
            Plan.objects.get_or_create(name=nm, defaults={"name_ar": ar, "price": price})

        addr, _ = Address.objects.get_or_create(
            customer=c1, label="Home", defaults={"city": "Riyadh", "district": "Olaya", "street": "King Fahd Rd"}
        )

        if not Order.objects.filter(customer=c1).exists():
            o = Order.objects.create(
                customer=c1, branch=branch, address=addr, delivery_method="home",
                priority="high", package_description="Documents",
            )
            OrderStatusLog.objects.create(order=o, status=OrderStatus.CREATED, by=c1)

            o2 = Order.objects.create(
                customer=c1, branch=branch, address=addr, driver=d1,
                delivery_method="locker", status=OrderStatus.ASSIGNED,
                pickup_code=generate_pickup_code(), package_description="Parcel",
            )
            OrderStatusLog.objects.create(order=o2, status=OrderStatus.ASSIGNED, by=admin)

        self.stdout.write(self.style.SUCCESS(
            "Seeded demo data. Logins (password Passw0rd!23): "
            "admin1 / branch1 / driver1 / driver2 / customer1"
        ))
