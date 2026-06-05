# SARO — Deployment & Launch Guide

SARO ships as two deployables: a **Django API** (backend) and a **static React build**
(frontend). The database is **Supabase Postgres**.

## 0. Prerequisites
- Supabase project (already created). Have the `DATABASE_URL` (Session pooler URI).
- A backend host (Render, Railway, Fly.io, or any VPS) and a static host (Vercel,
  Netlify, Cloudflare Pages) for the frontend.

## 1. Backend (Django API)

### Environment variables (set on the host, never commit)
```
DJANGO_SECRET_KEY=<long-random-string>
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=api.yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com
DATABASE_URL=postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres
```

### Build & release commands
```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
# create the first admin (interactive) OR use seed_demo for a demo environment
python manage.py createsuperuser
```

### Start command (production)
```bash
gunicorn config.wsgi:application --bind 0.0.0.0:$PORT
```
WhiteNoise serves static files; no separate static server needed. With `DEBUG=False`
the app enables SSL redirect, secure cookies, and proxy-SSL header handling.

## 2. Frontend (React build)

### Environment variables (build-time, set on the static host)
```
VITE_API_URL=https://api.yourdomain.com/api
VITE_SUPABASE_URL=https://<ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

### Build
```bash
cd frontend
npm ci
npm run build      # outputs frontend/dist/
```
Deploy `frontend/dist/` as a static site. Add a SPA rewrite so all routes fall back to
`index.html` (Vercel/Netlify: redirect `/* -> /index.html` 200).

## 3. Go-live checklist
- [ ] `DJANGO_DEBUG=False` and a strong `DJANGO_SECRET_KEY` set
- [ ] `DJANGO_ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS` point at real domains
- [ ] `migrate` run against Supabase; `collectstatic` run
- [ ] Real admin created; demo accounts removed (or skip `seed_demo` in prod)
- [ ] Lock self-registration of admin/branch roles (see CLAUDE.md open items)
- [ ] HTTPS on both API and frontend
- [ ] Rotate the Supabase DB password if it was ever shared in plaintext

## 4. Local development
```bash
# backend
cd backend && .\.venv\Scripts\python.exe manage.py runserver
# frontend
cd frontend && npm run dev
```

## 5. Tests
```bash
cd backend && .\.venv\Scripts\python.exe manage.py test   # runs on in-memory sqlite
```
