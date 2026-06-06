# CLAUDE.md — SARO working memory

> **This file is my (Claude's) persistent memory for the SARO project.**
> Read it first at the start of every session and after any context compaction to
> understand what the project is, what we've decided, and what we've already built.
> **IMPORTANT: After finishing every task, update this file** — append to the
> Worklog, tick the roadmap, and revise any decision that changed. Keep it accurate
> and concise; it is the source of truth for continuity.

---

## 0. LIVE (production)
- **Frontend:** https://valiant-magic-production-11d8.up.railway.app
- **Backend API:** https://saro-production-62b5.up.railway.app/api  (health: /health/)
- Both deployed on **Railway** (project "zippy-joy") from GitHub `main` (auto-deploy on push).
  Backend service "SARO" root dir `/backend`; frontend service "valiant-magic" root dir `/frontend`.
  DB = Supabase. **Outbound IPv6 enabled on backend** (Supabase direct conn is IPv6-only).
  Demo logins work in prod (admin1/driver1/customer1/branch1, pw Passw0rd!23) — DB already seeded.
- Deploy config: per-service `Procfile` (no root railway.toml). Backend Procfile runs
  migrate+collectstatic+gunicorn; frontend Procfile runs `serve -s dist`. CORS allows
  `*.up.railway.app` + `*.vercel.app` via regex, so frontend↔backend works out of the box.

## 1. What SARO is
**SARO** = Smart Delivery Management Platform. MIS senior project, Al Yamamah University,
2025–2026 (supervisor Dr. Abdullah AlSahly; team: Abdulaziz BinAsakir, Meshari Alsharif,
Abdullah Aref, Faisal Alrayes). Web platform for smart last-mile delivery in the Saudi market.

**4 roles:** customer, driver, admin, branch supervisor.
**Signature features:** rule-based smart dispatch (simulated, NOT real ML), privacy-first
internal messaging (no phone numbers — PDPL), multiple delivery methods (home, neighborhood
smart locker w/ pickup code, home delivery box, over-the-wall), subscriptions, order tracking,
ratings, reports, responsive bilingual UI.
**Out of scope / simulated only:** live National Address API, real maps/GPS, real payment
gateway, physical hardware, real drone/robot delivery, enterprise optimization.

Source doc: `Downloads\SARO MIS Senior Project with Literature Review.docx`
(extracted text in `_docx/extracted.txt`, gitignored). Full plan in `PLAN.md`,
design system in `DESIGN.md`.

## 2. Standing rules (do not violate)
- **Git/GitHub:** repo https://github.com/AbdulrahmanAlaasi/SARO (PUBLIC).
  ALL commits authored as **Abdulrahman <arkom.293@gmail.com>**.
  **NEVER add Claude as co-author/contributor** (no `Co-Authored-By` trailer).
- Commit + push after each completed task/phase.
- **Design identity:** Aramex-inspired *structure* (tracking-first hero, service tiles,
  status clarity, bilingual RTL) but SARO's OWN look — navy, NOT Aramex red.
- Bilingual Arabic-first: use Tailwind **logical** utilities (ps/pe/ms/me, start/end),
  never hard left/right. `dir`/`lang` flip via i18next (wired in `src/i18n.ts`).
- Keep this CLAUDE.md updated after every task.

## 3. Stack
- **Frontend:** Vite + React + TypeScript + Tailwind, React Router v7, TanStack Query,
  axios, i18next (AR/EN + RTL/LTR), recharts. Dir: `frontend/`.
- **Backend:** Django 5.2 + DRF + SimpleJWT + django-cors-headers. Dir: `backend/`
  (venv at `backend/.venv`, apps under `backend/apps/`).
- **DB:** Supabase (managed Postgres) via `DATABASE_URL` env; falls back to sqlite if unset.
  **Approach A** — Django owns auth/ORM/migrations (single source of truth). Do NOT run
  Supabase auth as primary. Optionally adopt Supabase Realtime later for messaging+notifications ONLY.
- **Storage:** Supabase Storage (later phases).
- Tooling present: Node 22, Python 3.14, gh CLI (logged in as AbdulrahmanAlaasi).

## 4. Design tokens (in `frontend/tailwind.config.js` + `DESIGN.md`)
- Primary `navy` #001F5F (50 #EAF0FB, 700 #0A2E7A). CTA `accent` amber #F59E0B (600 #D97706).
- Order-status colors: created #64748B, assigned #6366F1, pickedup #0EA5E9, transit #3B82F6,
  delivered #16A34A, failed #DC2626, delayed #F59E0B.
- Fonts: **IBM Plex Sans Arabic** (AR) + **IBM Plex Sans** (EN). Radius sm6/md10/lg16.
- Reusable classes in `src/index.css`: `.btn-primary .btn-outline .btn-cta .card`.

## 5. How to run
```powershell
# backend
cd backend; .\.venv\Scripts\python.exe manage.py migrate; .\.venv\Scripts\python.exe manage.py runserver
# frontend
cd frontend; npm run dev   # http://localhost:5173
```
Backend API base: http://127.0.0.1:8000/api  ·  admin: /admin/
Copy `backend/.env.example` -> `backend/.env`; set `DATABASE_URL` for Supabase (else sqlite).

## 6. Key files / layout
```
backend/config/settings.py        env-driven; AUTH_USER_MODEL=accounts.User; DRF+JWT+CORS
backend/apps/accounts/            custom User(role,phone,preferred_language), auth API
   models.py serializers.py views.py urls.py  (register/login/refresh/me)
backend/config/urls.py            includes api/auth/
frontend/src/lib/api.ts           axios + JWT + auto-refresh (ACCESS_KEY/REFRESH_KEY)
frontend/src/auth/                AuthContext, ProtectedRoute, types (Role, HOME_BY_ROLE)
frontend/src/pages/               Home, Login, Register, dashboards/
frontend/src/layouts/DashboardLayout.tsx   topbar shell + DashboardPlaceholder
frontend/src/i18n.ts              all AR/EN strings + dir handling
frontend/src/App.tsx              router (public + /app/* role-guarded)
```

## 7. Roadmap (8 phases, Agile — see PLAN.md)
- [x] Phase 0 — scaffold (backend, frontend, auth API, i18n/RTL shell)
- [x] Phase 1 — auth UI + role-based routing (login/register, JWT, role-guarded dashboards)
- [x] Phase 2 — public website (home, services, methods, plans, branches, contact)
- [x] Phase 3 — customer dashboard (create order, addresses, method select, tracking, ratings)
- [x] Phase 4 — driver dashboard (assigned orders, status updates, locker code, over-the-wall, delays)
- [x] Phase 5 — admin + branch dashboards (manage entities, delay monitoring, KPIs/reports)
- [x] Phase 6 — smart dispatch engine (rule-based + AIRecommendation log + assign UI)
- [x] Phase 7 — messaging & notifications (privacy-first internal messaging + notifications bell)
- [x] Phase 8 — testing & launch prep (7 functional tests passing, whitenoise/gunicorn, DEPLOYMENT.md)

PROJECT COMPLETE through launch-ready state. See DEPLOYMENT.md for go-live steps.

## 8. Open items / TODO
- [DONE] Supabase connected (project ref wxzpsnlmhekpwlkcqdbr) via direct connection
  (db.<ref>.supabase.co:5432) in `backend/.env`. Frontend URL+anon key in `frontend/.env`.
  Both .env files gitignored. If direct conn ever fails (IPv6), switch to IPv4 pooler URI.
- Register form currently allows choosing ANY role (for easy testing). Before launch,
  lock admin/branch creation behind admin only (do in Phase 5).
- Data model (orders, lockers, subscriptions, payments, messages, notifications, branches,
  addresses, reports, ai_recommendations) NOT built yet — only accounts.User exists.

## 9. Worklog (newest first)
- **LAUNCHED to production** (Railway). Backend service (root /backend, Procfile:
  migrate+collectstatic+gunicorn) + frontend service (root /frontend, Procfile: serve -s dist,
  added `serve` dep + start script). Removed root railway.toml (monorepo per-service Procfiles).
  Added /health/ endpoint. Settings.py: dynamic ALLOWED_HOSTS for *.up.railway.app + CORS regex
  for *.vercel.app/*.railway.app. Enabled Outbound IPv6 on backend (Supabase direct = IPv6-only)
  — that was the key fix for the healthcheck failures. Set prod env vars via Railway Raw Editor
  (careful: paste cleanly, one per line). Generated public domains for both services. Verified
  live E2E: health 200, register/login/plans API, and admin login → KPIs+charts load from Supabase.
  Vercel was skipped (would need account/OAuth creation — left to user).
- **Professional README**: rewrote README.md — badges, overview, feature tables by role,
  tech stack, mermaid architecture diagram, quick start, testing, roadmap, structure, team, license.
- **UI polish pass**: Swiss-minimal cleanup + tasteful motion. Tailwind keyframes
  (fade-up/fade-in/scale-in/shimmer) + shadow tokens (card/hover/focus); index.css
  refined btn/card/input classes, .card-hover lift, .stagger list entrance, .skeleton
  shimmer, focus-visible rings, prefers-reduced-motion guard. ui.tsx: SVG Icon set
  (replaced ALL emojis), animated Spinner, SkeletonList, dot StatusBadge, animated Modal
  (backdrop blur + scale-in), icon EmptyState. Gradient hero + icon method tiles; page
  fade transitions in DashboardLayout; SVG notifications bell. tsc + build pass; verified
  in preview (AR/RTL home + admin).
- **Phase 8 — testing & launch**: 7 Django functional tests (auth, full order lifecycle,
  locker code, permissions, driver isolation, dispatch load-balancing) all pass on sqlite;
  whitenoise + gunicorn + production hardening (SSL/secure cookies when DEBUG off);
  requirements.txt; DEPLOYMENT.md; collectstatic verified. Live UI verified via preview:
  AR/RTL public site, admin KPIs/charts, manage-orders, smart-dispatch recommend modal.
- **Phases 2-7 frontend** (commit 79e8500): public website; customer/driver/admin/branch
  dashboards; order create+tracking timeline; ratings; addresses; subscriptions;
  smart-dispatch assign UI; privacy-first messaging; notifications bell; recharts KPIs.
  Shared UI kit + domain types. tsc + build pass.
- **Backend data model + API** (commit eb3e979): 10 apps (branches, addresses, lockers,
  orders, subscriptions, payments, messaging, notifications, dispatch, reports); rule-based
  dispatch service; role-permissioned DRF viewsets + custom actions; seed_demo; migrated to
  Supabase; full lifecycle verified end-to-end. Fixed assign() driver-persist bug.
- **Connect Supabase**: DATABASE_URL (direct conn) in backend/.env; migrated all tables to
  Supabase Postgres; verified register→login→/me writes to live DB (user 'supatest').
  Added DISABLE_SERVER_SIDE_CURSORS for pooler safety; frontend/.env(.example) with URL+anon key.
- **Phase 1 + fonts** (commit aed65a6): IBM Plex fonts; axios JWT client w/ auto-refresh;
  AuthContext; ProtectedRoute; bilingual Login/Register; dashboard shell + 4 role dashboards;
  router. Verified register→login→/me end-to-end; frontend prod build passes.
- **Design system** (commit 71b907e): DESIGN.md; Tailwind navy/accent/status tokens; fonts;
  btn/card classes; bilingual hero + tracking input + method tiles + status badges.
- **Phase 0 scaffold** (commit 35d55fe): Django+DRF+JWT+CORS, role-based custom User, auth API
  (register/login/refresh/me), env Supabase/sqlite config; Vite+React+TS+Tailwind, i18n AR/EN RTL.
  (Note: Vite 8 scaffolded vanilla template by mistake — React + plugin added manually.)
- **Setup**: read full project docx; wrote PLAN.md, README.md; created public GitHub repo.
