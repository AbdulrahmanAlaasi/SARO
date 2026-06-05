# SARO — Implementation Plan

Smart Delivery Management Platform · React + Django + Supabase · Bilingual AR/EN (RTL+LTR)

## 1. Stack & Architecture

| Layer | Technology |
|-------|-----------|
| Frontend | Vite + React + TypeScript + Tailwind CSS, React Router, TanStack Query, i18next (AR/EN + RTL/LTR), Recharts |
| Backend | Django + Django REST Framework, SimpleJWT (role-based auth) |
| Database | Supabase (managed PostgreSQL) — Django owns ORM & migrations |
| Storage | Supabase Storage (ratings photos, locker proof, attachments) |
| Smart Dispatch | Rule-based Django service module (availability + proximity + priority) |
| Realtime (optional, Phase 5+) | Supabase Realtime for messaging + notifications only |

**Decision:** Supabase = Postgres + Storage only (Approach A). Django is the single source of truth for auth, models, and business rules. No dual auth.

Repo layout:
```
SARO/
  backend/        # Django project (config) + apps
  frontend/       # Vite React app
  docs/           # ER diagram, API spec, the source report
  PLAN.md
```

## 2. Data Model (Django apps & models)

- **accounts**: User (custom, role: customer|driver|admin|branch_supervisor), Profile
- **branches**: Branch (name, city, area, supervisor FK)
- **addresses**: Address (customer FK, national_address, city, district, geo, label)
- **orders**: Order (customer, driver, branch, address, delivery_method, status, priority, pickup_code, timestamps), OrderStatusLog
- **delivery**: Locker (branch, location, status), LockerSlot, DeliveryMethod enum
- **subscriptions**: Plan, Subscription (customer, plan, status, period)
- **payments**: Payment (order/subscription, amount, status) — simulated
- **messaging**: Conversation, Message (sender, receiver, order FK) — phone-free
- **notifications**: Notification (user, type, payload, read)
- **dispatch**: smart-dispatch service + AIRecommendation log
- **reports**: aggregation endpoints (KPIs, delays, driver performance)

Delivery methods: `home`, `locker`, `home_box`, `over_the_wall`.
Order statuses: `created → assigned → picked_up → in_transit → delivered/failed` (+ `delayed` flag).

## 3. API surface (DRF)
`/api/auth/` (register, login, refresh, me) · `/api/orders/` · `/api/orders/{id}/status/` · `/api/dispatch/recommend/` · `/api/lockers/` · `/api/subscriptions/` · `/api/messages/` · `/api/notifications/` · `/api/branches/` · `/api/reports/` — all role-permissioned.

## 4. Phased build (Agile, mirrors the report)

- **Phase 0 — Scaffold:** repos, Django+DRF, Vite+React+Tailwind, Supabase connection, i18n/RTL shell, base layout & theme.
- **Phase 1 — Auth & roles:** custom user, JWT, register/login, role routing/guards, profile.
- **Phase 2 — Public website:** home, services, delivery methods, subscription plans, branches, contact (AR/EN).
- **Phase 3 — Customer dashboard:** create order, address mgmt, delivery-method selection, order tracking, ratings.
- **Phase 4 — Driver dashboard:** assigned orders, status updates, locker deposit + pickup code, over-the-wall instructions, report delay.
- **Phase 5 — Admin + branch dashboards:** manage orders/drivers/customers/branches/lockers/subscriptions, delay monitoring, KPIs/reports.
- **Phase 6 — Smart dispatch:** rule-based recommendation engine + AIRecommendation log + admin assign UI.
- **Phase 7 — Messaging & notifications:** privacy-first internal messaging (optionally Supabase Realtime), notifications.
- **Phase 8 — Polish & testing:** responsiveness, functional/usability tests, seed/demo data, validation vs FRs/NFRs.

## 5. Compliance baked in (from the doc)
- PDPL: never expose phone numbers in messaging; role-based field access; encrypt secrets.
- NCA cloud posture: env-based secrets, HTTPS, least-privilege DB.
- National Address: stored as a field now; live API = future work.

## 6. Out of scope (simulated/stub only)
Live National Address API, real maps/GPS, real payment gateway, physical locker/box/wall hardware, drone/robot delivery, enterprise optimization.
