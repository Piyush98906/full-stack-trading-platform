# Full Stack Trading Platform

Full Stack Trading Platform is a web-based stock trading simulation system built to mirror the core workflow of a modern trading app. It combines a public product site, an authenticated trading dashboard, and an Express + MongoDB backend that handles authentication, portfolio state, order logic, and market-data-backed stock flows.

The project is designed for academic demonstration and full stack practice. Users can register, sign in, search stocks, inspect stock details, place buy and sell orders, track holdings and positions, manage funds, and review order history through a dashboard-oriented interface. The backend also exposes admin-facing operational views and supports Upstox-backed market data with a safe seeded fallback.

## Apps in This Repository

1. `frontend`  
   Public marketing site built with React and Vite.

2. `dashboard`  
   Authenticated trading dashboard built with React and Vite.

3. `backend`  
   Express and MongoDB API that handles authentication, orders, holdings, positions, funds, profile data, admin routes, and market data services.

## Core Features

1. Secure user registration and login with JWT-based authentication
2. Protected dashboard routes for authenticated users
3. Stock and index search with market-data-backed enrichment
4. Detailed stock views with chart-oriented performance data
5. Buy and sell order workflows with validation
6. Holdings and positions management
7. Funds tracking and transaction history
8. Admin panel for users, orders, holdings, and positions
9. Upstox-backed market data with seeded fallback behavior
10. Separate deployable frontend, dashboard, and backend apps

## Tech Stack

1. Frontend: React, Vite
2. Dashboard: React, Vite
3. Backend: Node.js, Express.js
4. Database: MongoDB
5. Authentication: JWT
6. Market Data: Upstox token-based integration with local fallback
7. Deployment: Vercel-style multi-project deployment

## Project Architecture

The repository is organized as a multi-app project.

1. The `frontend` app is the public entry point and product-facing site.
2. The `dashboard` app is the core trading workspace for authenticated users.
3. The `backend` app exposes the API and business logic layer.
4. MongoDB stores users, orders, holdings, positions, and fund transaction data.
5. Upstox-backed token-based services can supply quotes, search results, and chart data when configured.

## Market Data Behavior

The application supports two market-data modes.

1. Live-like mode  
   If a valid Upstox token is configured in the backend, the app can enhance stock search, quotes, and chart-related data using external market data.

2. Fallback mode  
   If no token is configured, the app still works using the seeded stock dataset and generated chart behavior. This makes the project reliable for local development, demonstration, and academic evaluation.

Recommended backend setup for market-data-only usage:

```env
UPSTOX_ANALYTICS_TOKEN=your_generated_token_here
```

If you already have a standard market-data token, you can use:

```env
UPSTOX_ACCESS_TOKEN=your_access_token_here
```

Useful backend status endpoints:

1. `GET /api/auth/upstox/status`
2. `GET /api/stocks/provider-status`

## Local Development

### Prerequisites

1. Node.js 18 or newer
2. npm
3. MongoDB connection string

### Install Dependencies

```bash
npm install
npm --prefix backend install
npm --prefix frontend install
npm --prefix dashboard install
```

### Create Environment Files

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
Copy-Item dashboard/.env.example dashboard/.env
```

### Default Local URLs

1. Frontend: `http://localhost:5173`
2. Dashboard: `http://localhost:5174`
3. Backend API: `http://localhost:5000/api`

### Start the Project

```bash
npm run dev
```

## Environment Variables

### Backend

1. `PORT`  
   API port provided by the host or local environment

2. `MONGO_URI`  
   MongoDB connection string

3. `JWT_SECRET`  
   Secret used to sign JWT tokens. Use at least 32 characters.

4. `NODE_ENV`  
   Use `development` locally and `production` in deployment

5. `CLIENT_URL`  
   Public frontend URL

6. `DASHBOARD_URL`  
   Dashboard URL

7. `ALLOWED_ORIGINS`  
   Optional comma-separated extra origins such as preview URLs

8. `UPSTOX_ANALYTICS_TOKEN`  
   Optional read-only token for market-data-only usage

9. `UPSTOX_ACCESS_TOKEN`  
   Optional standard Upstox market data token

### Frontend

1. `VITE_DASHBOARD_URL`  
   Dashboard base URL

### Dashboard

1. `VITE_API_URL`  
   Backend API base URL, for example `http://localhost:5000/api`

2. `VITE_FRONTEND_URL`  
   Public frontend base URL

## Suggested Local Configuration

### `backend/.env`

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_with_at_least_32_characters
NODE_ENV=development
CLIENT_URL=http://localhost:5173
DASHBOARD_URL=http://localhost:5174
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
UPSTOX_ANALYTICS_TOKEN=
UPSTOX_ACCESS_TOKEN=
```

### `frontend/.env`

```env
VITE_DASHBOARD_URL=http://localhost:5174
```

### `dashboard/.env`

```env
VITE_API_URL=http://localhost:5000/api
VITE_FRONTEND_URL=http://localhost:5173
```

## Main Backend Modules

1. Authentication  
   Registration, login, current-user retrieval, JWT issue and protected routes

2. Market Data  
   Stock search, market overview, stock detail enrichment, quote resolution, and fallback logic

3. Orders  
   Buy and sell order creation, execution-state handling, holdings or positions updates, and funds adjustment

4. Portfolio  
   Holdings, positions, and funds state retrieval

5. Profile  
   User profile information including PAN and phone details

6. Admin  
   User, order, holding, and position visibility for administrative review

## Validation and Trading Logic

The system applies practical backend validation before recording trading activity.

1. Registration validates required user details.
2. Authentication checks credentials before dashboard access is granted.
3. Order placement verifies stock input, quantity, price rules, and portfolio conditions.
4. Buy orders check available funds before execution.
5. Sell orders check available holding or position quantity before execution.
6. Funds, holdings, and positions are updated according to the order mode and product type.

## Build and Verification

Run these checks before deploying:

```bash
cd backend
npm test
npm run validate

cd ../dashboard
npm run build

cd ../frontend
npm run build
```

## Deployment Structure

The project is intended to be deployed as three separate apps.

1. `backend`
2. `dashboard`
3. `frontend`

### Recommended Deploy Order

1. Deploy the backend first.
2. Deploy the dashboard using the backend API URL.
3. Deploy the frontend using the dashboard URL.
4. Update backend CORS settings using the final frontend and dashboard domains.

## Live Deployment Links

1. Frontend: `https://full-stack-trading-platform-rhma.vercel.app/`
2. Dashboard: `https://full-stack-trading-platform-virid.vercel.app/`
3. Backend API: `https://trading-platform-backend-seven.vercel.app/api`

## Repo Usage Notes

1. This project is best treated as a trading simulation and portfolio workflow platform, not a licensed production brokerage platform.
2. Live market-data behavior depends on backend token configuration.
3. If external data is unavailable, the seeded dataset keeps the demo flow stable.

## Future Improvements

1. Real-time market feed support through WebSocket integration
2. More advanced charting and analytics
3. Notification and alert workflows
4. Expanded admin controls
5. Richer trade history and downloadable reporting
6. Deeper portfolio analytics
