# Paradox Ticket

Paradox Ticket is a cinematic booking experience for movies, concerts, and live events. Customers can discover events, choose seats from a live visual map, add concessions, pay online or at the venue, receive QR tickets, cancel bookings, and join category-specific waitlists. Organisers and admins have dedicated operational workspaces.

## Run locally

```bash
pnpm install
pnpm --filter @workspace/api-server run dev
# In another terminal, the web workflow runs:
pnpm --filter @workspace/paradox-ticket run dev
```

The project runs as a pnpm workspace. The API is mounted at `/api` and the web app at `/`. The database connection is optional for the included demo mode; the API currently uses a concurrency-safe in-memory service so the full booking journey can be reviewed immediately.

## Demo accounts

The UI includes role-aware demo access:

| Role | Email | Password |
| --- | --- | --- |
| Admin | paradox@gmail.com | Paradox@12345 |
| Organiser | organiser@paradoxticket.com | Organiser@12345 |
| Customer | customer@paradoxticket.com | Customer@12345 |

New registrations are customer accounts. In production, replace the demo auth surface with managed OAuth and password authentication, keeping the same server-side role checks.

## API

All routes are under `/api`.

- `GET /healthz`
- `GET /events?city=&type=&search=`
- `GET /events/:id`
- `GET /shows/:id/seats`
- `POST /shows/:id/holds` with `{ seatIds: string[] }`
- `GET /bookings`
- `POST /bookings` with `{ holdId, email, paymentMethod, foodItems? }`
- `POST /bookings/:id/cancel`
- `POST /waitlist` with `{ eventId, category, email }`
- `POST /support` with `{ name, email, message }`

The OpenAPI source of truth is `lib/api-spec/openapi.yaml`; regenerate typed client and Zod helpers with `pnpm --filter @workspace/api-spec run codegen`.

## Environment

Copy `.env.example` to your local environment when connecting Postgres, transactional email, or a managed auth provider. Never commit `.env`.

## Repository hygiene

Do not commit `node_modules`, `dist`, editor folders, or private environment files. Keep the default branch named `main` and make the repository public when sharing the application.