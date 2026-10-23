# Test report

Run on 23 October 2026 with Node.js 22.14.0 on Windows.

## Test Summary

| Test Suite | Framework | Tests | Passed | Failed | Duration |
| --- | --- | --- | --- | --- | --- |
| Server API & Unit Suite | Node.js Test Runner (`node:test`) | 26 | 26 | 0 | ~2.4s |
| Real PostgreSQL Integration | `@electric-sql/pglite` (WASM Postgres) | 1 | 1 | 0 | (included above) |
| Client Component & Flow Suite | Vitest + React Testing Library | 10 | 10 | 0 | ~4.6s |
| Production Build | Vite 7 (`npm run build`) | - | Passed | 0 | ~2.3s |
| **Total Test Suite** | | **36** | **36** | **0** | **~7.0s** |

## Backend Code Coverage (`npm run coverage:server`)

Measured with Node.js built-in coverage collector:

```text
-----------------------------------------------------------------------
file                   | line % | branch % | funcs % | uncovered lines
-----------------------------------------------------------------------
server                 |        |          |         | 
 app.js                |  86.36 |    57.14 |   60.00 | 34-35 41-44
 app.test.js           | 100.00 |   100.00 |  100.00 | 
 auth.js               |  95.24 |    95.00 |  100.00 | 40-41
 auth.test.js          | 100.00 |   100.00 |  100.00 | 
 db                    |        |          |         | 
  database.test.js     | 100.00 |   100.00 |  100.00 | 
  postgres.js          |  94.87 |   100.00 |   60.00 | 38-39
  postgres.test.js     | 100.00 |    83.33 |   80.00 | 
  sqlite.js            | 100.00 |   100.00 |  100.00 | 
 middleware.js         | 100.00 |   100.00 |  100.00 | 
 repositories          |        |          |         | 
  userRepository.js    |  94.87 |    91.67 |  100.00 | 35-36
  vehicleRepository.js | 100.00 |    93.33 |  100.00 | 
 routes                |        |          |         | 
  authRoutes.js        |  95.74 |    89.47 |  100.00 | 29-30
  vehicleRoutes.js     | 100.00 |   100.00 |  100.00 | 
 seed.js               | 100.00 |   100.00 |  100.00 | 
 validation.js         |  98.08 |    97.65 |  100.00 | 21-22
 validation.test.js    | 100.00 |   100.00 |  100.00 | 
-----------------------------------------------------------------------
all files              |  98.21 |    95.42 |   93.46 | 
-----------------------------------------------------------------------
```

- **Line coverage:** **98.21%**
- **Branch coverage:** **95.42%**
- **Function coverage:** **93.46%**

## Test Scenarios Covered

1. **Authentication & Security:**
   - User registration with validation and password hashing (`scrypt` with per-user salt).
   - Duplicate email rejection (409 conflict).
   - Password verification with timing-safe string comparison.
   - HS256 signed bearer tokens with expiration and algorithm tampering rejection.
   - Token authentication middleware on protected endpoints (401 on missing/tampered).
   - Role-based authorization (`requireAdmin` returning 403 for non-admin users).
   - Secure role assignment (client cannot declare role; only email matching `ADMIN_EMAIL` receives admin privileges).
   - Current user profile endpoint (`GET /api/auth/me`) returning sanitized user sans hash.

2. **Vehicles & Catalogue:**
   - Input validation on create and update (make, model, category, year range, price, stock, description length, image URL).
   - Case-insensitive search across make and model.
   - Wildcard character escaping (`%` and `_` in search queries treated literally).
   - Filtering by make, model, category, and price range (`minPrice` / `maxPrice`).
   - Rejection of inverted price bounds (`minPrice > maxPrice`).
   - Idempotent seeding ensuring the showroom is populated on first boot.

3. **Concurrency & Inventory Management:**
   - Atomic unit purchases using single conditional updates (`quantity = quantity - 1 WHERE id = ? AND quantity > 0`).
   - Concurrent/subsequent purchase attempts when sold out return 409 with proper error.
   - Admin-only restock increasing stock count atomically (`UPDATE vehicles SET quantity = quantity + ?`).
   - Admin-only vehicle deletion with 204 response and cascading checks.
   - Ownership-based vehicle edits (owners can edit own listings; admins can edit any listing).

4. **Database Engine Portability:**
   - Tested against SQLite in-memory engine.
   - Tested against real PostgreSQL engine via `@electric-sql/pglite` (WebAssembly Postgres) verifying table creation, identity column generation, and parameter binding.

5. **Frontend Components & UX:**
   - `VehicleCard`: dynamic badges, formatted currency, zero-stock disablement (`Unavailable`), and conditional rendering of admin controls.
   - `AuthDialog`: sign-in and registration input binding, validation feedback, and API error surfacing with ARIA roles.
   - `VehicleDialog`: numeric parsing for model year, price, and stock before dispatching.
   - `App`: visitor preview mode, authenticated live catalogue fetching, role-based controls, price filter drawer, and toast notifications.

## Reproducing the Results

```sh
# Run all server and client tests
npm test

# Run server tests with code coverage report
npm run coverage:server

# Run client tests in watch or single-run mode
npm run test:client

# Verify full production build
npm run build
```
