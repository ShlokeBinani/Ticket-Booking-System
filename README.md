# Ticket Booking System

A cinematic booking experience for movies, concerts, and live events. Customers can discover events, choose seats from a live visual map, pay online, receive QR tickets via email, cancel bookings, and join category-specific waitlists.   
 
## Features 
- **Visual Seat Map**: Pick your seats visually.   
- **Seat Hold & Concurrency**: Seats are held for a TTL of 10 minutes when selected. Other users cannot book them simultaneously.
- **Waitlist Logic**: Sold out seats? Join the waitlist, and if a ticket is cancelled, the sweeper cron automatically assigns the seat and emails the first person on the waitlist.
- **QR Codes**: Every booking generates a unique QR code.
- **Role-based Auth**: Organiser, Admin, Customer roles via JWT Authentication. 
- **Postgres Database**: Powered by Drizzle ORM.

## Setup & Running Locally

1. Install dependencies:
```bash
pnpm install
```

2. Environment Variables:
Copy `.env.example` to `.env` and configure your Database and Email API keys.
```bash
cp .env.example .env
```

3. Start the API Server:
```bash
pnpm --filter @workspace/api-server run dev
```

4. Start the Frontend (Vite):
```bash
pnpm --filter @workspace/paradox-ticket run dev
```

## Deployment

### 1. Database (Neon / Supabase)
We recommend using [Neon](https://neon.tech/) or [Supabase](https://supabase.com) for serverless PostgreSQL.
- Create a project and grab your `DATABASE_URL`.
- Run Drizzle migrations to push the schema to the cloud.

### 2. Frontend & Backend (Vercel)
This app is ready to be deployed to [Vercel](https://vercel.com).
- Import this repository to Vercel.
- Set the Root Directory to `artifacts/paradox-ticket` (or set up a monorepo deployment with Vercel routing both frontend and backend).
- Make sure to add `DATABASE_URL`, `SESSION_SECRET`, and `EMAIL_API_KEY` to Vercel Environment Variables.

## Email Integration (Resend / SendGrid)
We use a mock console output for emails locally. For production:
- Replace the email simulation logic in `artifacts/api-server/src/routes/ticketing.ts` and `artifacts/api-server/src/sweeper.ts` with real API calls using your preferred provider (e.g., [Resend](https://resend.com/)).

## Tech Stack
- Frontend: React, Vite, Tailwind CSS, Tanstack Query, Wouter
- Backend: Express, Node.js, Drizzle ORM, PostgreSQL
- Auth: JWT, bcryptjs
## Demo Accounts
- **Admin**: admin@demo.com / 12345678
- **Organiser**: organizer@demo.com / 12345678
