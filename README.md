# User Portal UI

User-facing frontend for the inventory management system. Same design system as `admin-ui`, configured for regular users (user table login).

## Features (current)

- Auth pages: Login, Signup, Forgot Password, Verify OTP, Reset Password
- Protected dashboard after login
- User API auth: `/api/v1/app/auth/*`

## Setup

```bash
npm install
npm run dev
```

Runs on **http://localhost:5174** (admin-ui uses 5173).

## Login

Use a user account with `role: user` from the users table. Login endpoint:

`POST http://localhost:3000/api/v1/app/auth/login`

## Environment

Copy `.env.example` to `.env` and adjust API URL if needed.
