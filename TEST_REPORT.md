# Test Report

Unified verification run (`npm run check`): **45 server tests + 52 client tests = 97 automated tests passed**, followed by a clean Vite production build.

- **Execution Date:** 25 October 2026
- **Runtime:** Node.js 22.14.0 on Windows
- **CI Pipeline:** GitHub Actions automated workflow (`.github/workflows/ci.yml`)

## 1. Test Summary

| Test Suite | Framework / Runner | Tests | Passed | Failed | Duration | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Server API & Unit Suite | Node.js Test Runner (`node:test`) | 45 | 45 | 0 | ~3.5s | PASS |
| Real PostgreSQL Integration | `@electric-sql/pglite` (WASM Postgres) | 1 | 1 | 0 | (in server suite) | PASS |
| Client Component & Flow Suite | Vitest 3.2.7 + React Testing Library | 52 | 52 | 0 | ~25.3s | PASS |
| Production Build | Vite 7.3.7 (`npm run build`) | - | 1,707 modules | 0 | ~11.3s | PASS |
| Live Cloud Deployment Probe | Render HTTPS & `/api/health` | - | 200 OK | 0 | Verified | PASS |
| **Total Automated Suite** | | **97** | **97** | **0** | **~40.1s** | **ALL PASS** |

- **Live Deployed Application:** [https://atelier-motors-yaco.onrender.com/](https://atelier-motors-yaco.onrender.com/)
- **Health Check Probe:** [https://atelier-motors-yaco.onrender.com/api/health](https://atelier-motors-yaco.onrender.com/api/health)
- **CI Workflow Badge:** [https://github.com/Lemonseeds/atelier-motors-inventory/actions/workflows/ci.yml](https://github.com/Lemonseeds/atelier-motors-inventory/actions/workflows/ci.yml)

---

## 2. Backend Code Coverage (`npm run coverage:server`)

Measured with Node.js built-in V8 coverage collector:

```text
-------------------------------------------------------------------------------------------------------
file                   | line % | branch % | funcs % | uncovered lines
-------------------------------------------------------------------------------------------------------
client                 |        |          |         | 
 lib                   |        |          |         | 
  catalog.js           |  83.13 |   100.00 |    0.00 | 67-73 77-83
  vehicleModels.js     | 100.00 |   100.00 |  100.00 | 
server                 |        |          |         | 
 app.js                |  88.00 |    57.14 |   60.00 | 40-41 47-50
 app.test.js           | 100.00 |   100.00 |  100.00 | 
 assistant.test.js     | 100.00 |   100.00 |  100.00 | 
 auth.js               |  95.24 |    95.00 |  100.00 | 40-41
 auth.test.js          | 100.00 |   100.00 |  100.00 | 
 companyKnowledge.js   | 100.00 |   100.00 |  100.00 | 
 db                    |        |          |         | 
  database.test.js     | 100.00 |   100.00 |  100.00 | 
  postgres.js          |  95.24 |    72.73 |   60.00 | 41-42
  postgres.test.js     | 100.00 |    83.33 |   80.00 | 
  sqlite.js            | 100.00 |   100.00 |  100.00 | 
 middleware.js         | 100.00 |   100.00 |  100.00 | 
 modelAssets.test.js   | 100.00 |    80.00 |  100.00 | 
 order.test.js         | 100.00 |   100.00 |  100.00 | 
 repositories          |        |          |         | 
  userRepository.js    | 100.00 |   100.00 |  100.00 | 
  vehicleRepository.js | 100.00 |    94.29 |  100.00 | 
 routes                |        |          |         | 
  assistantRoutes.js   |  91.11 |    77.17 |   84.62 | 141-145 147-151 167 171-174 176-177 179-180 186
  authRoutes.js        | 100.00 |    94.44 |  100.00 | 
  orderRoutes.js       |  97.47 |    40.00 |  100.00 | 67-68
  testDriveRoutes.js   | 100.00 |    68.97 |  100.00 | 
  vehicleRoutes.js     |  98.20 |    97.78 |  100.00 | 95-96
 seed.js               |  77.55 |   100.00 |   66.67 | 39-49
 testDrive.test.js     | 100.00 |   100.00 |  100.00 | 
 validation.js         |  98.50 |    98.08 |  100.00 | 21-22
 validation.test.js    | 100.00 |   100.00 |  100.00 | 
-------------------------------------------------------------------------------------------------------
all files              |  97.11 |    89.29 |   92.11 | 
-------------------------------------------------------------------------------------------------------
```

- **Line Coverage:** **97.11%**
- **Branch Coverage:** **89.29%**
- **Function Coverage:** **92.11%**

---

## 3. Test Scenarios Covered

### 1. Authentication & Security (6 tests)
- User registration with validation and password hashing (`scryptSync` with per-user cryptographic salt).
- Duplicate email conflict rejection (`409 Conflict`).
- Password verification using constant-time equality comparisons (`crypto.timingSafeEqual`) to prevent side-channel timing attacks.
- HS256 stateless Bearer token generation, verification, and tamper rejection.
- Route authentication middleware (`createRequireAuth`) protecting private endpoints.
- Role-based authorization (`requireAdmin`) preventing non-admins from restock or delete operations.
- Server-enforced role assignments (clients cannot set role; only `ADMIN_EMAIL` receives elevation).
- Profile endpoint `GET /api/auth/me` returning sanitized profile without password hashes.

### 2. Vehicle Inventory, Pagination & Sorting (10 tests)
- Full CRUD operations with strict field-level input validation.
- Case-insensitive search across make and model.
- SQL LIKE wildcard escaping (`%` and `_` matched literally, preventing wildcards exploitation).
- Combined filtering by keyword, make, category, and price boundaries.
- Rejection of inverted or malformed price ranges.
- Server-side sorting (`sortBy`: price, year, make, model, quantity, created_at; `sortOrder`: asc, desc).
- Server-side pagination (`page`, `limit`) returning items, `total`, `page`, `limit`, and `totalPages`.
- Idempotent catalog seeding on startup.

### 3. Concurrency & Purchasing (4 tests)
- Atomic stock decrements via conditional SQL updates (`WHERE id = ? AND quantity >= ?`).
- Custom purchase quantities with immediate remaining stock validation.
- Proper HTTP `409 Conflict` when stock is insufficient or vehicle is sold out.
- Atomic restock operations by admin users (`quantity = quantity + ?`).

### 4. Bespoke Orders & Garage Tracking (3 tests)
- Automatic creation of confirmed orders upon purchase with unique VIN (`1AT...`).
- Customer specific order history queries via `GET /api/orders`.
- Admin-controlled order stage progression patch (`PATCH /api/orders/:id/status`) across the 5 production phases.

### 5. Private Test Drive Booking (4 tests)
- Appointment reservations with vehicle selection, future date enforcement (up to 90 days), and time windows.
- Support for Showroom vs. Home Concierge delivery experiences.
- Administrative confirmation and customer cancellation flows.

### 6. AI Concierge & Matchmaking (8 tests)
- Dual hybrid mode: deterministic offline local engine + optional Groq Cloud RAG (`llama-3.3-70b-versatile`).
- Live inventory synchronization in RAG prompts: dynamically resolves prices and stock from current database.
- Multi-turn conversation context preservation (up to 8 turns).
- Automatic graceful fallback to local engine if Groq API encounters network issues, timeouts, or 5xx errors.
- Strict refusal of out-of-domain prompt injection, code generation, and off-topic trivia.

### 7. Database Engine Portability (2 tests)
- Verified compatibility with SQLite file-backed database (`better-sqlite3`).
- Verified compatibility with real PostgreSQL engine via `@electric-sql/pglite` (WebAssembly Postgres) testing parameter translation (`toPostgresPlaceholders`), identity columns, and transactions.

### 8. Client Components & UX (52 Vitest tests)
- `Modal`: accessible keyboard handling, pinned header, scrollable body with `data-lenis-prevent`.
- `VehicleCard`: stock badges, price formatting, action handlers, and admin controls.
- `VehiclePages`: Learn page feature accordion, 3D configurator with orbital view controls, paint swatches, and trim selections.
- `CompanyAssistant`: live chat dialog, markdown list formatting, suggestion chips, and error notifications.
- `PaymentCalculator`: loan vs lease calculations, down-payment sliders, term toggles, and APR credit tiers.
- `MatchmakerQuizModal`: 4-step lifestyle quiz, weighted affinity scoring, and recommendation cards.
- `InteriorPanoramaModal`: 360° cockpit panorama viewer with craft hotspots and dual interior themes.
- `MyGarageModal`: order tracking timeline, digital Monroney window sticker with QR verification, and test drive schedule.
- `AuthDialog` & `VehicleDialog`: form state, validation, error display, and administrative controls.
- `App`: end-to-end user navigation, comparison drawer, and notification toasts.

---

## 4. Reproducing the Results

```sh
# Run full automated test suite (server + client)
npm test

# Run backend test coverage collector
npm run coverage:server

# Run client component unit tests
npm run test:client

# Run full CI verification (tests + production build)
npm run check
```
