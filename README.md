# Full Stack Trading Platform

This repository contains three deployable apps:

- `backend`: Express + MongoDB API
- `frontend`: public marketing site built with Vite + React
- `dashboard`: authenticated trading dashboard built with Vite + React

## Local setup

1. Install dependencies:

```bash
npm install
npm --prefix backend install
npm --prefix frontend install
npm --prefix dashboard install
```

2. Copy environment files:

```bash
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
Copy-Item dashboard/.env.example dashboard/.env
```

3. Start the full stack app:

```bash
npm run dev
```

## Production environment variables

### Backend

- `PORT`: API port provided by your host
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: at least 32 characters
- `NODE_ENV`: `production`
- `CLIENT_URL`: deployed marketing site URL
- `DASHBOARD_URL`: deployed dashboard URL
- `ALLOWED_ORIGINS`: optional comma-separated extra origins such as preview URLs

### Frontend

- `VITE_DASHBOARD_URL`: deployed dashboard URL

### Dashboard

- `VITE_API_URL`: deployed API base URL, for example `https://your-api-domain.com/api`
- `VITE_FRONTEND_URL`: deployed marketing site URL

## Build and deployment checks

Run these checks before deploying:

```bash
cd frontend
npm run build

cd ../dashboard
npm run build

cd ../backend
npm run validate
```

## Recommended deployment layout

### Backend

- Deploy `backend` as a separate Vercel project
- Set the Root Directory to `backend`
- Vercel can run this Express app directly from `backend/index.js`
- Health check path: `/health`

### Frontend

- Deploy `frontend` as a separate Vercel project
- Set the Root Directory to `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Set `VITE_DASHBOARD_URL` to your deployed dashboard domain

### Dashboard

- Deploy `dashboard` as a separate Vercel project
- Set the Root Directory to `dashboard`
- Build command: `npm run build`
- Output directory: `dist`
- Set `VITE_API_URL` to your deployed backend API URL ending with `/api`
- Set `VITE_FRONTEND_URL` to your deployed marketing site domain

## Vercel setup

Create 3 separate Vercel projects from the same repository:

1. `frontend`
2. `dashboard`
3. `backend`

For each project in Vercel:

1. Import the same Git repository.
2. Set the correct Root Directory.
3. Add the environment variables for that app.
4. Deploy once to get the generated `.vercel.app` domain.

Use these environment variables on Vercel:

### `backend`

- `MONGO_URI`
- `JWT_SECRET`
- `NODE_ENV=production`
- `CLIENT_URL=https://<frontend-project>.vercel.app`
- `DASHBOARD_URL=https://<dashboard-project>.vercel.app`
- `ALLOWED_ORIGINS=` optional comma-separated extra origins

### `frontend`

- `VITE_DASHBOARD_URL=https://<dashboard-project>.vercel.app`

### `dashboard`

- `VITE_API_URL=https://<backend-project>.vercel.app/api`
- `VITE_FRONTEND_URL=https://<frontend-project>.vercel.app`

### Vercel deploy order

1. Deploy `backend` first.
2. Deploy `dashboard` with the backend URL.
3. Deploy `frontend` with the dashboard URL.
4. Redeploy `backend` after setting the final frontend and dashboard URLs.

### Preview deployments

Vercel preview deployments create changing URLs for non-production branches. Because the backend uses explicit CORS allowlists, preview builds will only be able to call the API if their preview domains are included through `ALLOWED_ORIGINS` or by using production frontend and dashboard URLs.

## Deployment order

1. Deploy the backend and confirm `GET /health` returns `200`.
2. Deploy the dashboard with the backend API URL.
3. Deploy the frontend with the dashboard URL.
4. Update backend CORS values so the final frontend and dashboard domains are allowed.
