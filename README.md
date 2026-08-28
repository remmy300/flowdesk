# FlowDesk

A full-stack project management app for individuals and small teams — organize projects,
track tasks, collaborate with comments, and maintain progress on a drag-and-drop kanban board.

## Tech stack

**Frontend** — Next.js (App Router), TypeScript, Tailwind CSS, shadcn-style UI components,
TanStack Query, React Hook Form + Zod, sonner toasts.

**Backend** — Node.js, Express, PostgreSQL (via Neon), Prisma ORM, JWT auth (httpOnly cookies),
Cloudinary for image/file uploads.

## Project structure

```
flowdesk/
├── server/                 # Express + Prisma API
│   ├── prisma/
│   │   ├── schema.prisma   # User, Project, ProjectMember, Task, Comment, ActivityLog
│   │   └── seed.ts         # Demo data (alice@flowdesk.dev / password123)
│   └── src/
│       ├── routes/         # auth, projects, tasks, comments, users, uploads
│       ├── controllers/    # business logic + access control
│       ├── middleware/     # JWT auth, validation, error handling, uploads
│       └── lib/            # zod schemas, project access helpers
└── client/                 # Next.js app
    ├── app/                # (auth) and (dashboard) route groups
    ├── components/         # ui (shadcn-style), layout, tasks, projects, auth...
    └── hooks/               # TanStack Query hooks
```

## Prerequisites

- Node.js 20+
- A PostgreSQL database (works with Neon/Supabase/local). See `server/.env.example`.

## Setup

### 1. Backend

```bash
cd server
npm install
cp .env.example .env    # edit DATABASE_URL, JWT_SECRET, Cloudinary keys
npx prisma db push      # create tables
npm run db:seed         # optional demo data
npm run dev             # API on http://localhost:4000
```

### 2. Frontend

```bash
cd client
npm install
cp .env.example .env.local   # edit NEXT_PUBLIC_API_URL if needed
npm run dev                  # app on http://localhost:3000 (or 3001 if busy)
```

## Features

- **Auth** — register, login, logout with JWT in httpOnly cookies; profile avatar uploads via Cloudinary.
- **Projects** — create, edit, archive/complete/delete; color-coded; progress tracking; invite members by email.
- **Tasks** — kanban board with HTML5 drag-and-drop across Backlog → To Do → In Progress → In Review → Done;
  priorities, assignees, due dates, and per-task comments.
- **Collaboration** — members with Owner/Admin/Member roles, activity log per project.
- **Dashboard** — overview stats, recent projects, and upcoming tasks.

## Scripts

| Script              | Purpose                                |
| ------------------- | -------------------------------------- |
| `npm run dev`       | API dev server (tsx watch)             |
| `npm run build`     | Compile the API to `dist/`             |
| `npm run db:push`   | Sync Prisma schema to the database     |
| `npm run db:seed`   | Insert demo data                       |
| `npm run db:studio` | Browse the database with Prisma Studio |

Client:

| Script              | Purpose               |
| ------------------- | --------------------- |
| `npm run dev`       | Next.js dev server    |
| `npm run build`     | Production build      |
| `npm run lint`      | ESLint                |
| `npm run typecheck` | TypeScript type check |

## Environment variables

Server (`server/.env`):

| Variable          | Description                                          |
| ----------------- | ---------------------------------------------------- |
| `DATABASE_URL`    | PostgreSQL connection string                         |
| `JWT_SECRET`      | Secret for signing tokens (use a long random string) |
| `JWT_EXPIRES_IN`  | Token lifetime, e.g. `7d`                            |
| `CLIENT_URL`      | Primary frontend origin                              |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins                         |
| `PORT`            | API port (default 4000)                              |
| `CLOUDINARY_*`    | Cloudinary credentials for uploads                   |

Client (`client/.env.local`):

| Variable              | Description                                    |
| --------------------- | ---------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | API base URL, e.g. `http://localhost:4000/api` |

## API overview

```
POST   /api/auth/register        create account
POST   /api/auth/login           log in (sets httpOnly cookie)
POST   /api/auth/logout          log out
GET    /api/auth/me              current user

GET    /api/projects             list my projects (with progress)
POST   /api/projects             create project
GET    /api/projects/:id         project detail + activity log
PATCH  /api/projects/:id         update project (owner only)
DELETE /api/projects/:id         delete project (owner only)

GET    /api/projects/:projectId/members      list members
POST   /api/projects/:projectId/members      add member by email (owner)
PATCH  /api/projects/:projectId/members/:userId  change role (owner)
DELETE /api/projects/:projectId/members/:userId  remove member (owner)

GET    /api/projects/:projectId/tasks   list project tasks
POST   /api/projects/:projectId/tasks   create task
GET    /api/tasks/:id                   task detail + comments
PATCH  /api/tasks/:id                   update task
POST   /api/tasks/:id/move              move task between statuses
DELETE /api/tasks/:id                   delete task

GET/POST /api/tasks/:taskId/comments    list / create comments
PATCH/DELETE /api/comments/:id          edit / delete comment

GET    /api/users/search?q=         search users by name/email
PATCH  /api/users/profile           update profile (name / avatar)
POST   /api/uploads                 upload file to Cloudinary (multipart "file")
```

All routes except `/api/auth/register`, `/api/auth/login`, and `/api/health` require
authentication via the `token` cookie or an `Authorization: Bearer <token>` header.
