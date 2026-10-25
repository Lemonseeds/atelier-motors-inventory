# Atelier Motors — Car Dealership Inventory System

[![CI](https://github.com/Lemonseeds/atelier-motors-inventory/actions/workflows/ci.yml/badge.svg)](https://github.com/Lemonseeds/atelier-motors-inventory/actions/workflows/ci.yml)
[![Tests](https://img.shields.io/badge/tests-97%20passed-success)](TEST_REPORT.md)
[![Coverage](https://img.shields.io/badge/backend%20coverage-97.1%25-brightgreen)](TEST_REPORT.md)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![OpenAPI](https://img.shields.io/badge/openapi-3.0.3-blue)](docs/openapi.yaml)

A full-stack, test-driven luxury car dealership platform with a calm, royal blue-gray showroom interface. Prospective buyers can explore 3D vehicle configurators, schedule showroom and white-glove home test drives, calculate loan and lease financing, consult an AI concierge grounded in live inventory, track bespoke vehicle orders with generated VINs in "My Garage", and purchase available models with quantity options. Admin users enjoy elevated controls to create, update, restock, and delete inventory listings, and advance customer order fulfillment stages.

- **Live Deployed Application (Brownie Points):** [https://atelier-motors-yaco.onrender.com/](https://atelier-motors-yaco.onrender.com/)
- **API Health Check:** [https://atelier-motors-yaco.onrender.com/api/health](https://atelier-motors-yaco.onrender.com/api/health)
- **OpenAPI 3.0 Specification:** [docs/openapi.yaml](docs/openapi.yaml)
- **Test Evidence & Coverage:** [TEST_REPORT.md](TEST_REPORT.md)
- **Raw AI Chat Logs & Prompts:** [PROMPTS.md](PROMPTS.md)

---

## Screenshots

![Showroom homepage](docs/screenshots/showroom-home.png)

![Vehicle inventory](docs/screenshots/inventory.png)

![Our Experience editorial section](docs/screenshots/our-experience.png)

![About Atelier Motors editorial section](docs/screenshots/about-experience.png)

---

## Architectural Stack

### Backend
- **Runtime:** Node.js 22 LTS (ES Modules)
- **Framework:** Express 5
- **Databases & Portability:**
  - **SQLite** via `better-sqlite3` with Write-Ahead Logging (`WAL`) enabled for local zero-config persistent storage.
  - **PostgreSQL** via `pg` Pool for production cloud deployments (Render).
  - Portability verified with `@electric-sql/pglite` (WebAssembly Postgres in-memory integration testing).
  - Resilient database selector: automatically falls back to local SQLite if cloud PostgreSQL is absent or expires.
- **Authentication & Security:**
  - Cryptographically salted password hashing via Node.js native `scryptSync` (64-byte key length).
  - HMAC-SHA256 (`HS256`) signed stateless Bearer tokens with expiration.
  - Constant-time equality checks (`crypto.timingSafeEqual`) on passwords and signatures to prevent timing side-channel attacks.
  - Role-based access control with server-enforced role assignments (clients cannot set own role; only designated `ADMIN_EMAIL` receives admin elevation).
- **Data Access & Concurrency:**
  - Repository Pattern (`repositories/vehicleRepository.js`, `repositories/userRepository.js`).
  - Atomic inventory decrement and increment (`UPDATE ... WHERE quantity >= ? RETURNING *`) eliminating race conditions and double-selling.
  - Server-side sorting (`sortBy`, `sortOrder`) and pagination (`page`, `limit`).
- **AI Concierge Engine:**
  - Dual hybrid mode: deterministic offline local engine + optional Groq Cloud RAG (`llama-3.3-70b-versatile`).
  - Dynamic RAG system prompt synchronizing live inventory prices and stock directly from the database.
  - Multi-turn conversation context preservation (up to 8 turns).
  - Zero-dependency Node 22 native `globalThis.fetch` implementation with automatic graceful fallback to the local engine upon network timeout or 5xx error.

### Frontend
- **Framework:** React 19 Single Page Application (SPA).
- **Styling:** Tailwind CSS v4 using modern `@theme` design tokens for an opaque, royal blue-gray glassmorphic showroom aesthetic.
- **Motion & Parallax:** Lenis inertial smooth scrolling, GPU-composited CSS variable-driven parallax scenes, clip-path frame reveals, kinetic marquee typography, and pinned cinematic interlude storytelling. Dialog scroll protection via `data-lenis-prevent`.
- **3D Visualization & Visual Assets:**
  - Interactive Three.js 3D vehicle configurator with orbital rotation, customizable paint swatches, and trim selector.
  - 360° hardware-accelerated interior cockpit panorama viewer with craft hotspots.
  - High-resolution editorial photography and vector SVG profile artwork.
- **Icons & Tooling:** `lucide-react`, Vite 7 bundler.

### Testing & Quality Assurance
- **Backend Suite:** Node.js native test runner (`node:test`) + `supertest` + `@electric-sql/pglite`.
- **Frontend Suite:** Vitest 3.2 + JSDOM + React Testing Library + `@testing-library/jest-dom`.
- **E2E Testing:** Playwright test suite (`e2e/inventory-journey.spec.js`) covering full user registration, search, purchase, and sold-out states.
- **Code Coverage:** Built-in V8 code coverage collector (97.1% backend line coverage).
- **Continuous Integration:** GitHub Actions workflow running `npm run check` on every push and PR.

---

## Project Structure

```text
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions CI workflow (npm run check)
├── client/
│   ├── components/
│   │   ├── AuthDialog.jsx       # Sign In & Registration modal with error states
│   │   ├── CompanyAssistant.jsx # Atelier AI concierge chat modal
│   │   ├── EditorialSections.jsx# Editorial storytelling & brand principles
│   │   ├── InteriorPanoramaModal.jsx # 360° cockpit panorama viewer with hotspots
│   │   ├── MatchmakerQuizModal.jsx   # 4-step lifestyle affinity recommendation quiz
│   │   ├── Modal.jsx            # Accessible dialog backdrop with pinned header & lenis scroll prevent
│   │   ├── MyGarageModal.jsx    # Member dashboard, 5-stage order tracker & Monroney sticker
│   │   ├── PaymentCalculator.jsx# Interactive loan & lease payment estimator
│   │   ├── TestDriveModal.jsx   # Private showroom & home concierge test-drive booking
│   │   ├── VehicleCard.jsx      # Inventory card with stock status & admin actions
│   │   ├── VehicleDetailDialog.jsx   # Vehicle technical specifications & action modal
│   │   ├── VehicleDialog.jsx    # Add/edit vehicle form with validation
│   │   └── VehiclePages.jsx     # Vehicle Learn page & 3D orbital configurator
│   ├── lib/
│   │   ├── calendar.js          # RFC 5545 iCalendar (.ics) generation & download
│   │   ├── catalog.js           # Currency formatters, specs & filter functions
│   │   ├── financing.js         # Automotive amortization & lease calculation engine
│   │   ├── matchmaker.js        # Lifestyle scoring affinity engine
│   │   ├── motion.jsx           # Lenis inertial scroll & parallax scene coordinator
│   │   └── vehicleModels.js     # 3D vehicle models and material mappings
│   ├── App.jsx                  # Main application layout, hero & live catalog
│   ├── main.jsx                 # Client entry point
│   └── style.css                # Tailwind CSS v4 design tokens and utility layers
├── docs/
│   ├── openapi.yaml             # Complete OpenAPI 3.0 REST specification
│   ├── COMPANY_KNOWLEDGE_BASE.md# Ground truth company policies & specs
│   └── screenshots/             # UI screenshots
├── e2e/
│   └── inventory-journey.spec.js# Playwright end-to-end journey test
├── server/
│   ├── db/
│   │   ├── index.js             # Database selector (SQLite vs PostgreSQL with fallback)
│   │   ├── sqlite.js            # SQLite driver with WAL pragma & migrations
│   │   └── postgres.js          # PostgreSQL pool adapter & parameter mapping
│   ├── repositories/
│   │   ├── userRepository.js    # User data access and duplicate email handling
│   │   └── vehicleRepository.js # Vehicle CRUD, pagination, sorting & atomic purchase
│   ├── routes/
│   │   ├── assistantRoutes.js   # AI concierge RAG router with live inventory injection
│   │   ├── authRoutes.js        # Auth router: /register, /login, /me
│   │   ├── orderRoutes.js       # Orders router: customer history & stage progression
│   │   ├── testDriveRoutes.js   # Test drive reservation booking router
│   │   └── vehicleRoutes.js     # Vehicles router: CRUD, purchase with quantity, restock
│   ├── app.js                   # Composition root & Express app factory
│   ├── auth.js                  # Token signing & scrypt hashing primitives
│   ├── companyKnowledge.js      # Ground truth knowledge base parser
│   ├── index.js                 # Server bootstrapper & listener
│   ├── middleware.js            # Token authentication & admin authorization guards
│   ├── seed.js                  # Idempotent showroom inventory seeder
│   └── validation.js            # Pure validation functions returning { value, error }
├── Dockerfile                   # Multi-stage production container
├── playwright.config.js         # Playwright test configuration
├── render.yaml                  # Render Blueprint for cloud deployment
├── TEST_REPORT.md               # Complete test and coverage results
└── PROMPTS.md                   # Unedited AI conversation logs
```

---

## Local Setup & Run

### Prerequisites
- Node.js 22.x or later
- npm 10.x or later

### 1. Clone & Install
```sh
git clone https://github.com/Lemonseeds/atelier-motors-inventory.git
cd atelier-motors-inventory
npm ci
```

### 2. Environment Configuration
Copy the example environment template:
```sh
cp .env.example .env
```
Key variables:
- `JWT_SECRET`: A secure random string for token signing (required in production).
- `ADMIN_EMAIL`: The email address that automatically receives `admin` privileges upon registration (e.g. `admin@example.com`).
- `PORT`: Server port (default: `3001`).
- `DATABASE_PATH`: Local SQLite path (default: `./data/inventory.db`).
- `DATABASE_URL`: (Optional) PostgreSQL connection URI for hosted cloud database.
- `GROQ_API_KEY`: (Optional) Free API key from [Groq Console](https://console.groq.com/keys) powering conversational vehicle recommendations with `llama-3.3-70b-versatile` over RAG live inventory. If omitted, the assistant seamlessly falls back to the deterministic local matchmaking engine.
- `GROQ_MODEL`: (Optional, default: `llama-3.3-70b-versatile`).

### 3. Start Development Servers
Run both backend API and Vite client concurrently:
```sh
npm run dev
```
- Frontend: [http://localhost:5173](http://localhost:5173) (proxies `/api` calls to port 3001)
- Backend API: [http://localhost:3001](http://localhost:3001)

### 4. Running in Production Mode
To build and run the production server locally:
```sh
npm run build
npm start
```
Open [http://localhost:3001](http://localhost:3001). The Express server serves both the REST API and the compiled React production bundle from `client/dist`.

### 5. Administrator Access & Credentials
The application automatically provisions a pre-configured Administrator account on boot:
- **Email:** `admin@example.com`
- **Password:** `AdminPass123!`

Click **Sign in** in the top-right navigation bar and enter these credentials (or use the one-click **"Fill demo admin"** button inside the dialog). Once signed in as an Admin:
- **`+ Add vehicle`** button appears in the collection toolbar to add new showroom cars.
- **`Edit details`** button appears on each vehicle card to update pricing, specifications, or imagery.
- **`Restock`** button appears on each vehicle card to add stock units.
- **`Delete`** button appears on each vehicle card to permanently remove vehicles.
- Admin users can also view all customer orders and advance production progression stages.

---

## Running with Docker (Multi-Stage Build)

Build and run the self-contained multi-stage production container:
```sh
docker build -t atelier-motors .

docker run --rm -p 3001:3001 \
  -e JWT_SECRET="replace-with-a-long-random-secret" \
  -e ADMIN_EMAIL="admin@example.com" \
  -v atelier-data:/app/data \
  atelier-motors
```
The multi-stage `Dockerfile` uses a clean `builder` stage to install dependencies and compile the client bundle, copying only the compiled production assets and pruned runtime dependencies into a minimal `runner` image. The persistent volume `atelier-data` ensures your SQLite database persists across container restarts.

---

## REST API Reference & cURL Examples

All `/api/vehicles*`, `/api/orders*`, and `/api/test-drives*` endpoints require a Bearer token in the `Authorization` header: `Authorization: Bearer <token>`.

Complete API schema is available in [docs/openapi.yaml](docs/openapi.yaml).

### Quick cURL Examples

#### 1. Register a Member Account
```sh
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Taylor Morgan", "email": "taylor@example.com", "password": "StrongPassword123!"}'
```

#### 2. Log In & Obtain Token
```sh
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "taylor@example.com", "password": "StrongPassword123!"}'
```
*Save the returned `token` from `{ "token": "..." }` for subsequent authenticated requests.*

#### 3. List Vehicles with Sorting & Pagination
```sh
curl -X GET "http://localhost:3001/api/vehicles?sortBy=price&sortOrder=asc&page=1&limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 4. Search Vehicles by Make & Price Range
```sh
curl -X GET "http://localhost:3001/api/vehicles/search?make=Aurelia&minPrice=80000&maxPrice=100000" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 5. Purchase Vehicle with Custom Quantity & Delivery Address
```sh
curl -X POST http://localhost:3001/api/vehicles/1/purchase \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"quantity": 1, "deliveryAddress": "100 Central Park South, New York, NY", "totalPrice": 89400}'
```

#### 6. Book a Private Test Drive
```sh
curl -X POST http://localhost:3001/api/test-drives \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"vehicleId": 1, "preferredDate": "2026-11-15", "timeWindow": "Morning", "experienceType": "Showroom", "location": "Atelier Flagship"}'
```

#### 7. Consult the Atelier AI Concierge
```sh
curl -X POST http://localhost:3001/api/assistant/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Which car has the highest horsepower and what is its starting price?"}'
```

---

## Testing & TDD Workflow

We followed a disciplined Test-Driven Development (Red-Green-Refactor) pattern.

```sh
# Execute full automated test suite (45 server TAP tests + 52 client Vitest tests = 97 total)
npm test

# Generate backend code coverage report (V8 collector)
npm run coverage:server

# Run client component tests
npm run test:client

# Run Playwright end-to-end journey test (register, search, purchase, sold out)
npm run test:e2e

# Full CI check (test suite + Vite production build)
npm run check
```

### Note on Commit History vs. TDD Cycles
In accordance with honest engineering reporting: Our development process followed strict Red-Green-Refactor cycles locally — authoring failing tests first in `*.test.js` to define API contracts, implementing the minimal code to pass, and refactoring into clean repository and middleware abstractions. However, when publishing to Git, changes were committed in cohesive logical feature sets (e.g., `feat: implement luxury automotive platform features`) rather than pushing micro-commits for each individual failing test step.

---

## Assets & Licensing Transparency

- **3D Vehicle Geometries:** The 3D car models loaded in the Three.js configurator are concept visualizations created by independent artists and licensed under [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/). Explicit on-page attribution links to each creator are rendered directly on the configurator pages via the `ModelCredit` component.
- **Editorial Photography & Panoramas:** All catalog vehicle photography (`hero-v2.webp`, `coupe.webp`, `suv.webp`, `sedan.webp`) and 360° interior cockpit panoramas (`cockpit-panorama.jpg`, `cockpit-ivory.jpg`) were generated specifically for this project using OpenAI ImageGen and Imagen, ensuring zero copyright infringement or uncredited third-party imagery.

---

## Cloud Deployment & Hosted Infrastructure (Brownie Points)

- **Live Application URL:** [https://atelier-motors-yaco.onrender.com/](https://atelier-motors-yaco.onrender.com/)
- **API Health Check:** [https://atelier-motors-yaco.onrender.com/api/health](https://atelier-motors-yaco.onrender.com/api/health)
- **Deployment Platform:** Render (Free Web Service + Managed PostgreSQL Database)

### Operational Details & Cold Starts
1. **Cold Start Delay:** On Render's free tier, inactive web services spin down after 15 minutes of inactivity. The initial request when awakening the server may take **30 to 50 seconds** while the container starts up. Subsequent requests respond instantly.
2. **PostgreSQL Free Tier 30-Day Lifecycle & Automated Fallback:**
   Render's free PostgreSQL instances expire 30 days after creation. To guarantee that reviewers never encounter a broken link or database connection crash even after the 30-day window, our database initialization module (`server/db/index.js`) is architected with an **automatic SQLite fallback**: if the PostgreSQL connection fails or `DATABASE_URL` is unavailable, the application logs a warning and smoothly switches to the persistent file-backed SQLite database (`DATABASE_PATH`), ensuring 100% uptime and zero disruption.

---

## My AI Usage

### Real Engineering Decisions & Why
- **Groq Llama-3.3-70b Integration:** Rather than pulling in heavyweight vendor SDKs, I implemented Groq's completions endpoint using Node 22 native `globalThis.fetch`. The prompt dynamically fetches live seed data so that the model never gives outdated pricing, and if the API key is omitted or the service throttles, it falls back seamlessly to a local rule-based matchmaker.
- **LENIS Parallax vs. Performance:** To create an editorial feel that rivals luxury automotive brands without lag, I used Lenis inertial scrolling coupled with GPU compositing (`translateZ(0)`). DOM measurements and CSS variable writes are strictly batched into two distinct phases to prevent layout thrashing.
- **PostgreSQL Testing without Docker:** To test true PostgreSQL behavior in CI and local development without forcing the evaluator to install Docker or a local Postgres daemon, I incorporated `@electric-sql/pglite` (WebAssembly-compiled Postgres), verifying index creation, identity columns, and transactions directly in memory.

### Concrete Bugs Caught and Corrected
During development, AI scaffolding made several subtle assumptions that I caught through code review and test assertions:
1. **Hardcoded Assistant Prices vs. Seed Data:** Early AI generated assistant prompts had hardcoded prices ($94,200 for Northline Summit X) that diverged from the seed inventory ($76,200). I refactored `assistantRoutes.js` to dynamically look up current vehicle prices from the database, eliminating the discrepancy.
2. **Invented Facts in Dialog Badges:** The AI added generic badges to `VehicleDetailDialog` claiming "Complimentary Concierge Delivery", "4-Year / 50K Mi" warranty, and "150-Point Master Certified", which contradicted our own knowledge base stating that delivery terms are not published. I replaced them with verified technical specifications grounded in `MODEL_SPECS`.
3. **Lenis Scroll Trapping in Modals:** When opening modals, Lenis's `isStopped` flag suppressed global window `wheel` events, making the quiz and order tracking popups unscrollable on desktop trackpads. I configured a custom `prevent` selector filter on Lenis and added `data-lenis-prevent` to modal bodies so that internal modal scrolling works flawlessly.
4. **Unstringified JSON in API Client:** The AI passed a raw object to `fetch` in `TestDriveModal.jsx`, which caused the browser to transmit `[object Object]` and triggered an Express `SyntaxError: Unexpected token 'o', [object Object] is not valid JSON`. I updated `client/api.js` to automatically detect and `JSON.stringify` object bodies, and added unit tests in `api.test.js` to guarantee it never happens again.

Raw prompt exchanges and conversation logs are preserved verbatim in [PROMPTS.md](PROMPTS.md).

---

## Authors & Contributors

- **Author:** [Ayrton / Lemonseeds](https://github.com/Lemonseeds) (`ayrtonjoep@gmail.com`) — Project owner, full-stack architecture, TDD implementation, database layer, parallax motion system, cloud deployment, and quality assurance.
- **AI Augmentation & Co-Authors:**
  - [OpenAI Codex](https://github.com/codex) (`codex@openai.com`) — Initial boilerplate scaffolding, base endpoint drafting, and test harness setup.
  - [Google Antigravity / Gemini](https://github.com/gemini-code-assist) (`gemini-code-assist@users.noreply.github.com`) — Architecture audit, PostgreSQL PGlite harness, Tailwind CSS v4 design tokens, Groq RAG concierge, and test suite expansion.
