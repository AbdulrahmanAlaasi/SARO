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

## Status
- [x] Phase 0 — scaffold (backend, frontend, auth API, i18n/RTL shell)
- [x] Phase 1 — auth & role routing (login/register UI, JWT, role-guarded dashboards)
- [ ] Phase 2 — public website
- [ ] Phase 3 — customer dashboard
- [ ] Phase 4 — driver dashboard
- [ ] Phase 5 — admin + branch dashboards
- [ ] Phase 6 — smart dispatch engine
- [ ] Phase 7 — messaging & notifications
- [ ] Phase 8 — polish & testing
