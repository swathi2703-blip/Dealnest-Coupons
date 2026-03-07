# Backend (Spring Boot + MongoDB)

This backend uses Spring Boot and MongoDB while keeping the same API contract used by the React frontend.

## Prerequisites

- Java 17+
- Maven 3.9+
- MongoDB running locally or remotely

## Setup

1. Copy env template:

```bash
cd backend
copy .env.example .env
```

Add your Firebase Web API key to `.env`:

```bash
FIREBASE_API_KEY=YOUR_FIREBASE_WEB_API_KEY
```

Set MongoDB Atlas URI in `.env` (replace `<db_password>`):

```bash
MONGODB_URI=mongodb+srv://swathi:<db_password>@cluster0.fbn63jb.mongodb.net/?appName=Cluster0
MONGODB_DB_NAME=dealnest
```

2. Run the application:

```bash
mvn spring-boot:run
```

The API runs on `http://localhost:4000` by default.

## API

- `GET /api/health`
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/listings?active=true&category=Fashion`
- `GET /api/listings?sellerId=<firebase_uid>` (requires `Authorization: Bearer <idToken>`)
- `POST /api/listings` (requires `Authorization: Bearer <idToken>`)
- `DELETE /api/listings/:id` (requires `Authorization: Bearer <idToken>`)

## MongoDB bootstrap

On backend startup, required collections are created automatically if missing:

- `profiles`
- `coupon_listings`
- `transactions`

Required indexes are also created automatically for listing/seller/category/transaction lookups.

## Auth note

- Login/signup is handled by Spring Boot using Firebase Identity Toolkit.
- Protected listing endpoints validate Firebase ID tokens on backend.
- Only `@klh.edu.in` emails are allowed.
