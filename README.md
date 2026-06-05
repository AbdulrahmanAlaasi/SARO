# SARO — Smart Delivery Management Platform

MIS Senior Project · Al Yamamah University · 2025–2026

Web platform connecting customers, drivers, admins, and branch supervisors for smart
last-mile delivery in the Saudi market. See [PLAN.md](PLAN.md) for the full build plan.

## Stack
- **Frontend:** Vite + React + TypeScript + Tailwind (AR/EN, RTL+LTR via i18next)
- **Backend:** Django + DRF + SimpleJWT
- **Database:** Supabase (managed PostgreSQL) — Django owns the ORM/migrations
- **Storage:** Supabase Storage

## Run locally

### Backend
```powershell
cd backend
.\.venv\Scripts\python.exe manage.py migrate
.\.venv\Scripts\python.exe manage.py runserver
```
API at http://127.0.0.1:8000/  ·  admin at /admin/  ·  auth at /api/auth/
Copy `.env.example` to `.env` and set `DATABASE_URL` to use Supabase (else sqlite).

### Frontend
```powershell
cd frontend
npm run dev
```
App at http://localhost:5173/

## Status — ✅ all phases complete (launch-ready)
- [x] Phase 0 — scaffold
- [x] Phase 1 — auth & role routing
- [x] Phase 2 — public website
- [x] Phase 3 — customer dashboard
- [x] Phase 4 — driver dashboard
- [x] Phase 5 — admin + branch dashboards
- [x] Phase 6 — smart dispatch engine
- [x] Phase 7 — messaging & notifications
- [x] Phase 8 — testing & launch prep

See [DEPLOYMENT.md](DEPLOYMENT.md) to go live. Demo logins (after `seed_demo`,
password `Passw0rd!23`): `admin1`, `branch1`, `driver1`, `driver2`, `customer1`.

## Tests
```powershell
cd backend; .\.venv\Scripts\python.exe manage.py test   # 7 functional tests on sqlite
```
