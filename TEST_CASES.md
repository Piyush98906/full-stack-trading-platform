# Test Cases

This document records the test cases used to validate the Full Stack Trading Platform before deployment and submission.

## Testing approach

- Manual functional testing was used for end-to-end user workflows across the landing site, dashboard, and admin panel.
- Automated unit testing was added for backend configuration, stock-data logic, and access-control middleware.
- Production readiness checks were run through frontend and dashboard builds plus backend syntax validation.

## Environment used

- OS: Windows / PowerShell
- Frontend: Vite React app in `frontend`
- Dashboard: Vite React app in `dashboard`
- Backend: Express + MongoDB API in `backend`
- Browser target: Chrome/Edge

## Automated test cases

Run:

```powershell
cd backend
npm test
```

Covered automated cases:

- `ENV-01`: required backend environment variables are enforced.
- `ENV-02`: JWT secret length is validated.
- `ENV-03`: production CORS origins must be configured.
- `ENV-04`: allowed-origin parsing trims trailing slashes and removes duplicates.
- `STK-01`: stock lookup works case-insensitively.
- `STK-02`: unknown stock symbols return no result.
- `STK-03`: stock detail generation returns performance, stats, company profile, and financials.
- `STK-04`: seeded stock dataset contains both indices and tradable equities.
- `ADM-01`: admin middleware blocks unauthenticated requests.
- `ADM-02`: admin middleware blocks non-admin users.
- `ADM-03`: admin middleware allows admin users.

## Manual functional test cases

| ID | Module | Preconditions | Steps | Expected result |
|---|---|---|---|---|
| TC-01 | Landing page | Frontend running | Open the marketing site home page | Home page loads without blank sections or console-blocking errors |
| TC-02 | Landing page navigation | Frontend running | Click `Products`, `Pricing`, `About`, and `Support` in navbar | Each route loads correct page content |
| TC-03 | Frontend to dashboard handoff | Frontend and dashboard URLs configured | Click `Login` and `Open Dashboard` from landing page | User is redirected to dashboard login or register screen |
| TC-04 | User registration success | Backend and dashboard running | Open register page, enter valid name, email, matching password, accept terms, submit | Account is created and user is redirected to dashboard |
| TC-05 | User registration password mismatch | Dashboard running | Enter different values in password and confirm password | Error message `Passwords do not match` is shown |
| TC-06 | User registration terms validation | Dashboard running | Fill all fields but do not accept terms | Error message `Please accept the terms to continue` is shown |
| TC-07 | Login success | Seeded user exists | Login using valid credentials | User is authenticated and lands on dashboard |
| TC-08 | Login invalid credentials | Dashboard running | Submit login with incorrect password | Error message `Invalid credentials` or fallback login error is shown |
| TC-09 | Protected route guard | Logged out session | Try to open `/dashboard` directly | User is redirected to `/login` |
| TC-10 | Stock search | Logged-in dashboard session | Search for a valid symbol such as `TCS` or `RELIANCE` | Matching stocks appear in search results |
| TC-11 | Add to watchlist | Logged-in dashboard session | Add a stock from search results to watchlist | Stock card appears in watchlist and persists in local storage |
| TC-12 | Prevent duplicate watchlist entry | Watchlist already contains a stock | Try adding the same stock again | Duplicate card is not added |
| TC-13 | Remove watchlist item | Watchlist has at least one stock | Click `Remove` on a watchlist card | Stock disappears from watchlist and local storage is updated |
| TC-14 | Refresh watchlist quotes | Watchlist has at least one stock | Click `Refresh Quotes` | Latest quote values are fetched without clearing the list |
| TC-15 | Add funds success | Logged-in user exists | Open Funds page, enter valid amount, choose payment method, submit | Success toast appears and available balance increases |
| TC-16 | Add funds invalid amount | Logged-in user exists | Submit `0`, negative, or non-numeric amount | API rejects request and UI shows error toast |
| TC-17 | Withdraw funds success | User has sufficient balance | Enter valid withdrawal amount and submit | Success toast appears and available balance decreases |
| TC-18 | Withdraw funds insufficient balance | User balance is lower than request | Try withdrawing more than available cash | Error `Insufficient available cash` is shown |
| TC-19 | Buy CNC order success | Logged-in user has sufficient funds | Open a stock buy modal, place `buy` order with valid quantity as `CNC` | Order is created and holdings/funds update when executed |
| TC-20 | Buy order insufficient funds | Logged-in user has low balance | Place a buy order whose total exceeds available balance | Order is rejected with `Insufficient available funds` |
| TC-21 | Sell CNC order validation | User does not own enough shares | Try to sell more quantity than current holding | API returns `Insufficient holding quantity for sell order` |
| TC-22 | Orders page listing | Logged-in user with orders | Open Orders page | Orders are listed in reverse chronological order |
| TC-23 | Holdings page listing | Logged-in user with holdings | Open Holdings page | Holdings table/cards load sorted by stock name |
| TC-24 | Positions page listing | Logged-in user with positions | Open Positions page | Positions load correctly for the logged-in user |
| TC-25 | Profile update success | Logged-in user exists | Edit name, phone, or PAN and save profile | Success response is shown and updated values persist |
| TC-26 | Change password mismatch | Logged-in user exists | Enter different new password and confirm password values | Error `New passwords do not match` is shown |
| TC-27 | Change password wrong current password | Logged-in user exists | Enter incorrect current password and submit | Error `Current password is incorrect` is shown |
| TC-28 | Admin access control | Logged in as normal user | Try opening `/admin` | Access is denied or user is redirected away from admin screen |
| TC-29 | Admin stats load | Logged in as admin user | Open Admin Panel | Orders, holdings, positions, and user stats load successfully |
| TC-30 | Admin order edit/delete | Logged in as admin user with existing orders | Update an order, then delete an order | Changes are reflected in admin data and API responses succeed |
| TC-31 | API health endpoint | Backend running | Open `/health` in browser or call via API client | JSON response contains `status: "ok"` |
| TC-32 | Unknown route handling | Backend running | Call a non-existent API route | Response returns `404` with `Route not found` |

## Build and validation checks

The following commands should be run before deployment:

```powershell
cd frontend
npm run build

cd ../dashboard
npm run build

cd ../backend
npm run validate
npm test
```

## Current testing note

- The dashboard build currently passes with a large bundle-size warning, but this does not block deployment.
- Manual API and UI scenarios that depend on database state should be executed after seeding or using known demo/admin accounts.
