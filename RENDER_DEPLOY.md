# Render Deployment Guide

This repository is configured for Render Blueprint deployment using `render.yaml`.

## What was added

- `dealnest/backend/Dockerfile`
- `dealnest/backend/.dockerignore`
- `dealnest/frontend/Dockerfile` (optional, for container hosting)
- `dealnest/frontend/.dockerignore`
- `dealnest/frontend/nginx.conf` (SPA routing)
- `render.yaml` (Render blueprint: backend Docker web service + frontend static web service)

## Deploy Steps

1. Push the latest commit to your GitHub repository.
2. In Render, click **New +** -> **Blueprint**.
3. Select your repository.
4. Render detects `render.yaml` and creates two services:
   - `dealnest-backend` (Docker web service)
   - `dealnest-frontend` (web service with `runtime: static`)
5. Fill all `sync: false` environment variables before first deploy.
6. Deploy `dealnest-backend` first.
7. Copy backend URL (for example `https://your-backend.onrender.com`).
8. Set `VITE_API_BASE_URL` in `dealnest-frontend` to that backend URL.
9. Trigger a new deploy for `dealnest-frontend`.

## Required Backend Env Vars

- `MONGODB_URI`
- `MONGODB_DB_NAME` (default `dealnest`)
- `FIREBASE_API_KEY`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `APP_PAYMENT_PLATFORM_FEE_PERCENT` (default `15`)
- `APP_PAYMENT_PAYOUT_AUTO_ENABLED` (default `true`)
- `APP_PAYMENT_PAYOUT_SOURCE_ACCOUNT_NUMBER`
- `APP_ADMIN_EMAILS`
- `APP_MAIL_FROM` (default `no-reply@dealnest.local`)
- `SPRING_MAIL_HOST` (for example `smtp.gmail.com`)
- `SPRING_MAIL_PORT` (usually `587`)
- `SPRING_MAIL_USERNAME` (SMTP login email)
- `SPRING_MAIL_PASSWORD` (SMTP app password)
- `SPRING_MAIL_SMTP_AUTH` (default `true`)
- `SPRING_MAIL_SMTP_STARTTLS_ENABLE` (default `true`)

## Required Frontend Env Vars

- `VITE_API_BASE_URL` (your backend Render URL)
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

## Notes

- Frontend is configured as Render web service with `runtime: static` because Vite environment variables are injected at build time.
- If you want frontend as Docker service too, use `dealnest/frontend/Dockerfile`, but you must handle build-time env injection in Render for all `VITE_*` values.
