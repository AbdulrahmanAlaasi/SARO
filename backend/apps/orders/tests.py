from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from apps.branches.models import Branch
from apps.orders.models import Order, OrderStatus

User = get_user_model()


def make(username, role, **extra):
    u = User.objects.create(username=username, role=role, **extra)
    u.set_password("Passw0rd!23")
    u.save()
    return u


class AuthTests(APITestCase):
    def test_register_and_login(self):
        r = self.client.post("/api/auth/register/", {
            "username": "newc", "email": "n@x.com", "password": "Passw0rd!23",
            "first_name": "N", "last_name": "C", "role": "customer",
        }, format="json")
        self.assertEqual(r.status_code, 201)
        r = self.client.post("/api/auth/login/", {"username": "newc", "password": "Passw0rd!23"}, format="json")
        self.assertEqual(r.status_code, 200)
        self.assertIn("access", r.data)

    def test_me_requires_auth(self):
        self.assertEqual(self.client.get("/api/auth/me/").status_code, 401)


class OrderLifecycleTests(APITestCase):
    def setUp(self):
        self.admin = make("admin1", "admin", is_superuser=True, is_staff=True)
        self.driver = make("driver1", "driver")
        self.customer = make("cust1", "customer")

    def auth(self, user):
        self.client.force_authenticate(user=user)

    def test_full_lifecycle(self):
        # customer creates order
        self.auth(self.customer)
        r = self.client.post("/api/orders/", {"delivery_method": "home", "priority": "high"}, format="json")
        self.assertEqual(r.status_code, 201)
        oid = r.data["id"]
        self.assertEqual(r.data["status"], "created")

        # admin recommends + assigns
        self.auth(self.admin)
        rec = self.client.post("/api/dispatch/recommend/", {"order": oid}, format="json")
        self.assertEqual(rec.status_code, 200)
        self.assertEqual(rec.data["recommendation"]["recommended_driver"], self.driver.id)
        a = self.client.post(f"/api/orders/{oid}/assign/", {"driver": self.driver.id}, format="json")
        self.assertEqual(a.data["status"], "assigned")
        self.assertEqual(a.data["driver"], self.driver.id)

        # driver advances to delivered
        self.auth(self.driver)
        for s in ["picked_up", "in_transit", "delivered"]:
            r = self.client.post(f"/api/orders/{oid}/status/", {"status": s}, format="json")
            self.assertEqual(r.status_code, 200)
        self.assertEqual(Order.objects.get(pk=oid).status, OrderStatus.DELIVERED)

        # customer rates
        self.auth(self.customer)
        r = self.client.post(f"/api/orders/{oid}/rate/", {"stars": 5, "comment": "Good"}, format="json")
        self.assertEqual(r.status_code, 201)

    def test_locker_generates_pickup_code(self):
        self.auth(self.customer)
        r = self.client.post("/api/orders/", {"delivery_method": "locker"}, format="json")
        self.assertEqual(len(r.data["pickup_code"]), 6)

    def test_customer_cannot_assign(self):
        self.auth(self.customer)
        o = self.client.post("/api/orders/", {"delivery_method": "home"}, format="json").data
        r = self.client.post(f"/api/orders/{o['id']}/assign/", {"driver": self.driver.id}, format="json")
        self.assertEqual(r.status_code, 403)

    def test_driver_only_sees_own_orders(self):
        other = make("driver2", "driver")
        self.auth(self.customer)
        oid = self.client.post("/api/orders/", {"delivery_method": "home"}, format="json").data["id"]
        self.auth(self.admin)
        self.client.post(f"/api/orders/{oid}/assign/", {"driver": self.driver.id}, format="json")
        # other driver cannot see it
        self.client.force_authenticate(user=other)
        self.assertEqual(len(self.client.get("/api/orders/").data), 0)
        # assigned driver can
        self.client.force_authenticate(user=self.driver)
        self.assertEqual(len(self.client.get("/api/orders/").data), 1)


class DispatchTests(APITestCase):
    def test_recommend_balances_load(self):
        admin = make("a", "admin", is_superuser=True)
        d1 = make("d1", "driver")
        make("d2", "driver")
        cust = make("c", "customer")
        branch = Branch.objects.create(name="B", city="Riyadh")
        # give d1 an active order so d2 should be preferred
        Order.objects.create(customer=cust, driver=d1, branch=branch,
                             delivery_method="home", status=OrderStatus.ASSIGNED)
        o = Order.objects.create(customer=cust, branch=branch, delivery_method="home")
        self.client.force_authenticate(user=admin)
        r = self.client.post("/api/dispatch/recommend/", {"order": o.id}, format="json")
        self.assertEqual(r.status_code, 200)
        # top candidate should be the less-loaded driver (d2)
        self.assertEqual(r.data["candidates"][0]["driver_name"], "d2")
