# Jobify

Jobify is a full-stack hiring platform that connects students and recruiters in one workflow.
It provides role-based dashboards for job posting, applications, resume analysis, chat, interview scheduling, and analytics.
depoyed link - https://jobify-nu-flame.vercel.app/?_vercel_share=UXf06VC18mDWhZfB3UP58KA8EWrluXIs

## Core Features

### Student Features
- Register/login with JWT authentication.
- Build and manage profile information.
- Upload resume PDF and auto-extract skills.
- Resume builder + resume version history.
- Resume score preview against a job.
- Resume improvement and skill suggestions.
- Browse open jobs.
- View recommended jobs based on skill match.
- Apply to jobs and auto-apply using a score threshold.
- Track application statuses.
- Message recruiters in real time and share files.

### Recruiter Features
- Register/login with role-based access.
- Manage recruiter profile and company information.
- Create, edit, archive, and delete jobs.
- Add recruiters to managed jobs.
- View candidate applications with filters.
- Update application status and review notes.
- Search contacts and message candidates.
- Schedule interviews inside chat.
- Track interview status (scheduled/cancelled/completed).
- View analytics dashboard (funnel, trends, response times, skill gaps, pipeline health).

### Platform Features
- Role-based route protection in frontend and backend.
- JWT auth middleware and token version invalidation.
- Login activity tracking.
- Account settings (password change, email update verification, logout all devices, account deletion).
- File uploads for resumes, profile photos, and chat attachments.
- News Feed system (create post, like post, delete post, newest-first feed).

## Tech Stack

- Frontend: React, Vite, React Router, Axios, Tailwind CSS, Recharts, React Spring.
- Backend: Node.js, Express, MongoDB (Mongoose), JWT, Multer, pdf-parse.

## Project Structure

```text
jobify/
  client/   # React + Vite frontend
  server/   # Express + MongoDB backend
```

## Prerequisites

- Node.js 18+ (recommended).
- npm.
- MongoDB connection string.

## Required Libraries and Frameworks (Before Running)

Install these from `package.json` using `npm install` in `server` and `client`.

### Backend Frameworks/Libraries (`server`)

- `express` - API server framework.
- `mongoose` - MongoDB ODM.
- `cors` - Cross-origin request support.
- `dotenv` - Environment variable loader.
- `jsonwebtoken` - JWT auth.
- `bcryptjs` - Password hashing.
- `multer` - File upload handling.
- `pdf-parse` - Resume PDF text extraction.
- `textract` - Text extraction utility support.
- `nodemon` (dev) - Auto-restart server during development.

### Frontend Frameworks/Libraries (`client`)

- `react` and `react-dom` - UI framework.
- `vite` - Frontend dev server and build tool.
- `@vitejs/plugin-react` - React plugin for Vite.
- `react-router-dom` - Routing.
- `axios` - API client.
- `tailwindcss`, `postcss`, `autoprefixer` - Styling pipeline.
- `recharts` - Dashboard charts.
- `@react-spring/web` - UI animations.
- `lucide-react` - Icon library.

### Lint/Tooling (`client`)

- `eslint`
- `@eslint/js`
- `eslint-plugin-react-hooks`
- `eslint-plugin-react-refresh`
- `globals`

## Environment Variables

Create `server/.env` (you can copy from `server/.env.example`):

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

Create `client/.env` (you can copy from `client/.env.example`):

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Installation

### 1. Install backend dependencies

```bash
cd server
npm install
```

### 2. Install frontend dependencies

```bash
cd ../client
npm install
```

## Running the App (Development)

Open two terminals.

### Terminal 1: backend

```bash
cd server
npm run dev
```

Backend runs at `http://localhost:5000`.

### Terminal 2: frontend

```bash
cd client
npm run dev
```

Frontend runs at `http://localhost:5173` (default Vite port).

## All Terminal Commands

### Backend (`server`)

- Install dependencies:

```bash
cd server
npm install
```

- Start backend (production mode):

```bash
npm start
```

- Start backend (development with nodemon):

```bash
npm run dev
```

- Seed demo data:

```bash
npm run seed:demo
```

- Reset and reseed demo data:

```bash
npm run seed:demo:reset
```

- Generate mock data report PDF:

```bash
node scripts/generateMockDataPdf.js
```

### Frontend (`client`)

- Install dependencies:

```bash
cd client
npm install
```

- Start frontend dev server:

```bash
npm run dev
```

- Build production bundle:

```bash
npm run build
```

- Preview production build:

```bash
npm run preview
```

- Run ESLint:

```bash
npm run lint
```

## Demo Data

You can load demo users/jobs/applications with:

```bash
cd server
npm run seed:demo
```

Default password for all seeded demo users:

```text
Password@123
```

## API Base

Frontend API client points to:

```text
VITE_API_BASE_URL (defaults to http://localhost:5000/api if not set)
```

Main backend route groups:

- `/api/auth`
- `/api/profile`
- `/api/resume`
- `/api/jobs`
- `/api/applications`
- `/api/analytics`
- `/api/messages`
- `/api/posts`

News Feed APIs:

- `POST /api/posts` - create a post (`text` required, `imageUrl` optional)
- `GET /api/posts` - fetch all posts (newest first)
- `PUT /api/posts/:id/like` - increment likes
- `DELETE /api/posts/:id` - delete a post

Frontend flow updates:

- After login, users land on `/feed`.
- Student available jobs page: `/student/jobs/available`
- Recruiter analytics page: `/recruiter/analytics`

## Notes

- Uploaded files are served from `server/uploads` at `/uploads/...`.
- Resume parsing currently expects PDF uploads.
- Keep `JWT_SECRET` and `MONGO_URI` private.
- Render free tier uses ephemeral disk, so uploaded files may be lost on restarts/redeploys.

## Deployment (Vercel + Render)

### 1. Deploy backend to Render (Web Service)

Use these settings for the `server` folder:

- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `npm start`

Set Render environment variables:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_secret
NODE_ENV=production
CLIENT_URL=https://your-vercel-domain.vercel.app
```

For Vercel preview links, you can also allow all Vercel subdomains:

```env
CLIENT_URL=https://your-vercel-domain.vercel.app,https://*.vercel.app
```

After deploy, copy your Render backend URL:

```text
https://your-backend-name.onrender.com
```

### 2. Deploy frontend to Vercel (Vite app)

Import the same GitHub repo in Vercel and set:

- Root Directory: `client`
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

Set Vercel environment variable:

```env
VITE_API_BASE_URL=https://your-backend-name.onrender.com/api
```

### 3. Final production wiring

After Vercel gives your final domain:

1. Update Render `CLIENT_URL` to your exact Vercel production URL.
2. Redeploy Render service.
3. In Vercel, keep `VITE_API_BASE_URL` pointed to the Render backend URL with `/api`.
