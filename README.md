# Atelier Motors

A full-stack car dealership inventory system with a calm, blue-gray showroom interface. Buyers can browse, search, register, log in, and purchase vehicles. Admin users can add, edit, delete, and restock inventory. The API stores data in SQLite and protects inventory routes with signed bearer tokens.

## Screenshots

![Showroom homepage](docs/screenshots/showroom-home.png)

![Vehicle inventory](docs/screenshots/inventory.png)

## Stack

- **API:** Node.js 22, Express 5, SQLite via `better-sqlite3`
- **Frontend:** React 19, HTML5, CSS3, Tailwind CSS 4, Vite
- **Tests:** Node's built-in test runner, Supertest, isolated SQLite database

## Run locally

1. Install Node.js 22 or later and run `npm ci` in the repository root.
2. Copy `.env.example` to `.env`. Set a unique `JWT_SECRET` and set `ADMIN_EMAIL` to the email you will use when registering the admin account.
3. Start both development servers with `npm run dev`.
4. Open [http://localhost:5173](http://localhost:5173). The API runs on port 3001, and Vite proxies `/api` requests to it.

The first start seeds three example vehicles. To run the built application with one server, run `npm run build` followed by `npm start`, then open [http://localhost:3001](http://localhost:3001). The SQLite file is created at `data/inventory.db` unless `DATABASE_PATH` is set. Data persists across restarts.

For production, **set `JWT_SECRET`**. The server refuses to start in production without it. Register the email matching `ADMIN_EMAIL` to receive the admin role. All other registrations receive the user role; clients cannot choose their own role.

## Run with Docker

Build the image with `docker build -t atelier-motors .`. Run it with a persistent volume and environment values, for example:

```sh
docker run --rm -p 3001:3001 \
  -e JWT_SECRET="replace-with-a-long-random-secret" \
  -e ADMIN_EMAIL="admin@example.com" \
  -v atelier-data:/app/data \
  atelier-motors
```

The container serves the built frontend and API together. On a hosted Docker service, set the same environment variables, expose port 3001, and mount a persistent disk at `/app/data`. Without the disk, SQLite inventory will be lost when the container is replaced. A hosted URL can be added here after a deployment account is connected.

## API

All vehicle routes require `Authorization: Bearer <token>`.

| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register` | Create a user account |
| POST | `/api/auth/login` | Sign in and receive a token |
| GET | `/api/auth/me` | Read the current account |
| GET | `/api/vehicles` | List vehicles |
| GET | `/api/vehicles/search` | Search by `q`, `make`, `model`, `category`, `minPrice`, `maxPrice` |
| POST | `/api/vehicles` | Add a vehicle |
| PUT | `/api/vehicles/:id` | Edit an owned vehicle or any vehicle as admin |
| DELETE | `/api/vehicles/:id` | Delete a vehicle (admin only) |
| POST | `/api/vehicles/:id/purchase` | Purchase one unit; returns 409 if sold out |
| POST | `/api/vehicles/:id/restock` | Add units (admin only) |

The `POST /api/vehicles` route is available to authenticated users as specified in the kata. The frontend exposes listing management in the admin interface. Vehicle writes validate required fields, nonnegative prices, nonnegative integer stock, and valid model years. Passwords use scrypt with a per-user salt. Purchases use a single conditional SQLite update so two requests cannot sell the final unit twice.

## Tests and development history

Run `npm test` for the API tests and `npm run check` for tests plus a production build. Results and coverage are recorded in [TEST_REPORT.md](TEST_REPORT.md). The Git history starts with a failing behavior-test commit and follows with implementation commits; every AI-assisted commit includes a `Co-authored-by` trailer.

## My AI Usage

I used **OpenAI Codex** to translate the kata into an implementation plan, draft the initial failing API tests, implement the Express and React code, debug build and UI issues, and write this documentation. I used **OpenAI ImageGen** to create project-local showroom photography; the hero and card images were generated for this project rather than copied from another dealership website. I supplied visual references and asked Codex to carry over their opaque blue-gray mood into an original responsive layout.

AI made the initial build faster, but its output still needed direct checks. The test suite caught backend behavior, and browser inspection led to a second hero image with more sky so the headline stayed legible. The local smoke test verified registration, purchase stock updates, and admin inventory controls. The raw user prompts and image-generation prompts are preserved in [PROMPTS.md](PROMPTS.md). The original AI session is also available through the link there for members with workspace access.

## Deployment status

The app is ready for a Docker host with a persistent disk. A public repository URL and live application URL require a connected publishing and hosting account; add them here after publishing.
