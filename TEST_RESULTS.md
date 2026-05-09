# Test Results

This document records the execution results for the Full Stack Trading Platform test cases.

## Project

- Project: Full Stack Trading Platform
- Test case reference: [TEST_CASES.md](/C:/Users/Piyush%20Oswal/OneDrive/Desktop/Full%20stack%20trading%20platform/TEST_CASES.md:1)
- Execution date: 2026-05-09
- Test environment: Windows / PowerShell

## Result summary

- Automated backend tests: `14 Passed`, `0 Failed`
- Frontend build check: `Passed`
- Dashboard build check: `Passed`
- Backend syntax validation: `Passed`
- Manual functional cases: `Pending execution`

## Automated execution evidence

### Commands executed

```powershell
cd backend
npm test

cd ../frontend
npm run build

cd ../dashboard
npm run build

cd ../backend
npm run validate
```

### Automated test results

| ID | Test description | Result | Remarks |
|---|---|---|---|
| ADM-01 | adminOnly blocks unauthenticated requests | Pass | Verified through backend automated test suite |
| ADM-02 | adminOnly blocks non-admin users | Pass | Verified through backend automated test suite |
| ADM-03 | adminOnly allows admin users | Pass | Verified through backend automated test suite |
| ENV-01 | required backend environment variables are enforced | Pass | Verified through backend automated test suite |
| ENV-02 | JWT secret length is validated | Pass | Verified through backend automated test suite |
| ENV-03 | production CORS origins must be configured | Pass | Verified through backend automated test suite |
| ENV-04 | allowed-origin parsing trims trailing slashes and removes duplicates | Pass | Verified through backend automated test suite |
| STK-01 | stock lookup works case-insensitively | Pass | Verified through backend automated test suite |
| STK-02 | unknown stock symbols return no result | Pass | Verified through backend automated test suite |
| STK-03 | stock detail generation returns performance, stats, company profile, and financials | Pass | Verified through backend automated test suite |
| STK-04 | seeded stock dataset contains both indices and tradable equities | Pass | Verified through backend automated test suite |
| BLD-01 | frontend production build | Pass | `npm run build` completed successfully |
| BLD-02 | dashboard production build | Pass | `npm run build` completed successfully |
| BLD-03 | backend syntax validation | Pass | `npm run validate` completed successfully |

## Manual functional execution sheet

Use this section while testing the UI and API flows manually. Mark `Pass`, `Fail`, or `Blocked`.

| ID | Module | Result | Remarks |
|---|---|---|---|
| TC-01 | Landing page | Pending |  |
| TC-02 | Landing page navigation | Pending |  |
| TC-03 | Frontend to dashboard handoff | Pending |  |
| TC-04 | User registration success | Pending |  |
| TC-05 | User registration password mismatch | Pending |  |
| TC-06 | User registration terms validation | Pending |  |
| TC-07 | Login success | Pending |  |
| TC-08 | Login invalid credentials | Pending |  |
| TC-09 | Protected route guard | Pending |  |
| TC-10 | Stock search | Pending |  |
| TC-11 | Add to watchlist | Pending |  |
| TC-12 | Prevent duplicate watchlist entry | Pending |  |
| TC-13 | Remove watchlist item | Pending |  |
| TC-14 | Refresh watchlist quotes | Pending |  |
| TC-15 | Add funds success | Pending |  |
| TC-16 | Add funds invalid amount | Pending |  |
| TC-17 | Withdraw funds success | Pending |  |
| TC-18 | Withdraw funds insufficient balance | Pending |  |
| TC-19 | Buy CNC order success | Pending |  |
| TC-20 | Buy order insufficient funds | Pending |  |
| TC-21 | Sell CNC order validation | Pending |  |
| TC-22 | Orders page listing | Pending |  |
| TC-23 | Holdings page listing | Pending |  |
| TC-24 | Positions page listing | Pending |  |
| TC-25 | Profile update success | Pending |  |
| TC-26 | Change password mismatch | Pending |  |
| TC-27 | Change password wrong current password | Pending |  |
| TC-28 | Admin access control | Pending |  |
| TC-29 | Admin stats load | Pending |  |
| TC-30 | Admin order edit/delete | Pending |  |
| TC-31 | API health endpoint | Pending |  |
| TC-32 | Unknown route handling | Pending |  |

## Notes

- The dashboard build passes with a large bundle-size warning, but this is not a functional blocker.
- Manual cases that depend on seeded users or portfolio data should be executed after preparing demo/admin accounts.
- Update this file after each manual test execution so it can be submitted as final testing evidence.
