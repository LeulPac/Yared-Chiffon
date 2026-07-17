# Yared Chiffon

A web app for managing Ethiopian cultural chiffon (cloth) inventory.

## Features

- **Admin**: Post chiffons with multiple images, description, and owner phone (hidden from users)
- **Users**: Browse chiffons and report if they have one
- **Private submissions**: Floor, room number, value, and package type (TAQA, Siry, In Meter) — visible only to admin

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment file and set your admin password:

   ```bash
   cp .env.example .env
   ```

3. Start PostgreSQL locally (optional but recommended for local development):

   ```bash
   docker compose up -d
   ```

4. Initialize the database:

   ```bash
   npm run db:push
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Usage

- **Public page** (`/`): Users browse chiffons and click "Do you have this chiffon?" to submit inventory info
- **Admin login** (`/admin`): Sign in with the password from `.env`
- **Admin dashboard** (`/admin/dashboard`): View all chiffons, owner phones, and private submissions
- **Post chiffon** (`/admin/chiffons/new`): Add a new chiffon with images

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Prisma + PostgreSQL

## PostgreSQL providers

This app can work with any PostgreSQL database. Common options:

- Supabase
- Neon
- Railway
- Render
- A managed PostgreSQL instance from your host

Just update `DATABASE_URL` in `.env` with the provider connection string and run `npm run db:push`.
