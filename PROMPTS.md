# PROMPTS.md

## 1. Codex Session
Original Codex conversation link (workspace access may be required): https://chatgpt.com/s/cx_6adb8005e3f081d1b8932fc9c771f5a0

### User → Codex (Prompt 1)
```text
use the pdf in the folder and help me create whatever is asked for in the pdf.  Make sure you strictly adhere to the guidelines, i also want you to see to it that the frontend would be clean and beautiful. If necessary make use of tools to make the project better. I also want to get the brownie points, that mentioned at the end of the pdf. Let's go. First make a plan. and then lets execute 
```

### User → Codex (Prompt 2)
```text
use these designs to make the frontend. I have seen this design online.  The opaque feeling to the website makes it feel royal
```

### Codex → ImageGen Prompts
```text
Photorealistic editorial automotive website hero image. A single elegant dark graphite modern sports coupe, three-quarter front view, parked inside a minimal high-end concrete showroom with warm amber architectural light strips and soft daylight, cinematic but realistic, rich reflections, dramatic shadows, premium quiet-luxury feel. Wide horizontal composition with the car concentrated in the right half and generous clean dark negative space on the left for website headline overlay. No logos, no brand marks, no people, no text, no watermark.
```

```text
Photorealistic premium automotive catalog photograph of a silver performance coupe in a modern shadowy studio, three-quarter front view, warm amber rim light and polished concrete floor, wide landscape composition, no logos, no text, no watermark.
```

```text
Photorealistic premium automotive catalog photograph, refined midnight blue luxury SUV in three-quarter front view, parked in a minimalist architectural studio with warm amber lighting, polished concrete, editorial automotive photography, wide landscape composition, no logos, no text, no watermark.
```

```text
Photorealistic premium automotive catalog photograph, elegant pearl white electric sedan in three-quarter front view, minimalist architectural studio, warm amber light and subtle dark shadows, polished concrete floor, editorial automotive photography, wide landscape composition, no logos, no text, no watermark.
```

```text
Photorealistic editorial automotive website hero background. One elegant futuristic silver-blue luxury crossover SUV in exact side profile, facing right, large and centered in the lower middle of frame. The car stands on a pale reflective floor in a spacious open studio with a soft misty desaturated powder-blue sky gradient fading into white haze at the horizon. Airy, opaque, ethereal, quiet luxury, subtle diffused daylight, refined details, realistic proportions. Wide horizontal composition with generous uncluttered blue negative space across the upper half for a centered white headline. No people, no logos, no text, no watermark.
```

```text
Wide photorealistic editorial website hero banner, 16:9. A sleek silver-blue luxury crossover shown in exact side profile, facing right, positioned entirely in the LOWER THIRD of the composition with its roof below the vertical midpoint and wheels near the bottom edge. Expansive clean powder-blue misty sky fills the UPPER HALF with no objects, enough room for large centered white headline. Pale glossy floor, softly diffused daylight, airy opaque blue-gray atmosphere, refined and royal yet minimal. The whole vehicle visible, realistic proportions. No people, no logos, no text, no watermark.
```

---

## 2. Antigravity Session

### User → Antigravity (Prompt 1)
```text
use the pdf in the folder and help me create whatever is asked for in the pdf. Make sure you strictly adhere to the guidelines, i also want you to see to it that the frontend would be clean and beautiful. If necessary make use of tools to make the project better. I also want to get the brownie points, that mentioned at the end of the pdf. Let's go. First make a plan. and then lets execute 
...
ive added all the with codex to you, check all the work and do the needful. It was signing in into render in the end. Also read the pdf to check whether the work done adheres the rules or no.
```

### User → Antigravity (Prompt 2)
```text
Ok now i want you to continue the work which is left
```

### Antigravity Actions & Engineering Flow
1. **Audit & Analysis against PDF Specifications:**
   - Evaluated codebase against all 4 core requirements: backend REST API, real DB persistence, JWT token auth, vehicle inventory endpoints, React/Tailwind frontend, TDD red-green-refactor history, AI co-authorship trailers, and brownie points (live deployment).
   - Identified gaps: monolithic frontend in `main.jsx`, unused Tailwind classes despite import, uncommitted PostgreSQL adapter with N+1 queries, lack of frontend unit tests, and incomplete deployment pipeline for durable database.
2. **Backend TDD Extension (Red -> Green -> Refactor):**
   - *Red:* Authored failing unit test suites (`server/validation.test.js`, `server/auth.test.js`, `server/db/database.test.js`, edge cases in `server/app.test.js`).
   - *Green:* Extracted `validation.js`, `middleware.js`, `repositories/vehicleRepository.js`, `repositories/userRepository.js`, `routes/authRoutes.js`, and `routes/vehicleRoutes.js`.
   - *PostgreSQL Support:* Built real-PostgreSQL test harness using `@electric-sql/pglite` (WebAssembly Postgres) to prove SQL compatibility without requiring a local Docker daemon.
   - *Refactor:* Separated connection initialization in `db/index.js` supporting both SQLite (`inventory.db`) and PostgreSQL (`DATABASE_URL`).
3. **Frontend TDD & Modularization:**
   - *Red:* Configured Vitest + JSDOM + React Testing Library; authored failing component tests for `VehicleCard`, `AuthDialog`, `VehicleDialog`, and `App`.
   - *Green:* Decomposed `main.jsx` into modular React components (`components/Modal.jsx`, `components/VehicleCard.jsx`, `components/AuthDialog.jsx`, `components/VehicleDialog.jsx`, `App.jsx`, `lib/catalog.js`).
   - *Refactor:* Replaced 19KB custom stylesheet with Tailwind CSS v4 `@theme` design tokens and utility classes while preserving the calm, royal showroom aesthetic.
4. **Deployment Preparation:**
   - Created `render.yaml` infrastructure-as-code blueprint for Render deployment (Node.js web service + persistent PostgreSQL database).
   - Updated comprehensive `TEST_REPORT.md` and `README.md`.
