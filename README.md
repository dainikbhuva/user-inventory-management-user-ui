# User Portal UI

User-facing frontend for company portal users. Same design as `admin-ui`.

## Flow

1. **Admin creates company** → adds subscription (plan with module groups) → adds company user in admin panel.
2. **Company user logs in** at `http://localhost:5174/login` with that email/password.
3. **Or self signup** at `/signup` with company code — saves to `users` table under that company.
4. **After login** → dashboard + sidebar loads modules from the company's active subscription plan.

## Requirements for login

- User exists in `users` table (`role: user` via company user or signup)
- Company is `active`
- Company has an **active subscription** with a plan that includes module groups

## Run

```bash
npm install
npm run dev
```

Port: **5174**

## API endpoints used

| Endpoint | Purpose |
|----------|---------|
| `POST /api/v1/app/auth/login` | Company user login |
| `POST /api/v1/app/auth/register` | Signup (name, email, password, companyCode) |
| `GET /api/v1/app/auth/profile` | User profile |
| `GET /api/v1/app/menu` | Sidebar modules from subscription |
