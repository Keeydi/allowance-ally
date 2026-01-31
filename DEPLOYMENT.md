# Deploy Frontend & Backend via GitHub

**Current setup:** **Vercel** (frontend) + **Railway** (backend). Other options below.

---

## Vercel (frontend) + Railway (backend) — current setup

Frontend runs on **Vercel**; backend runs on **Railway** at `https://allowance-ally-production.up.railway.app`.

### 1. Vercel — frontend (already running)

Your frontend is on Vercel. Ensure these **Environment Variables** are set so the app talks to the backend:

1. Open [vercel.com](https://vercel.com) → your project → **Settings** → **Environment Variables**.
2. Add or update (for **Production**, and optionally Preview/Development):

| Name | Value |
|------|--------|
| `VITE_API_URL` | `https://allowance-ally-production.up.railway.app/api` |
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |

3. **Redeploy** so the new values are used: **Deployments** → … on latest deploy → **Redeploy**.

Build is already set by `vercel.json`: `npm run build`, output `dist`, SPA rewrites.

### 2. Railway — backend

Backend is at **allowance-ally-production.up.railway.app**. In Railway:

- **Settings** → **Networking** → generated domain = that URL.
- **Variables**: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `SUPABASE_JWT_SECRET`.

Push to `main` → Railway auto-deploys the backend; Vercel auto-deploys the frontend.

---

## Option A: GitHub Pages (frontend) + Railway (backend)

No GitHub Actions needed for the backend. Connect the repo to **Railway**; frontend deploys to **GitHub Pages** via the workflow.

### 1. Enable GitHub Pages

Repo → **Settings → Pages** → **Source: GitHub Actions**.

### 2. Deploy backend on Railway

1. Go to [railway.app](https://railway.app) and sign in with **GitHub**.
2. **New Project** → **Deploy from GitHub repo** → select this repo.
3. Railway creates a service. Open it → **Settings**:
   - **Root Directory:** set to `backend`.
4. **Variables** tab: add `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `SUPABASE_JWT_SECRET`.
5. **Settings → Networking** → **Generate domain** (e.g. `https://allowance-ally-production.up.railway.app`).

### 3. Add GitHub repo secrets (for Pages build)

Repo → **Settings → Secrets and variables → Actions**. Add `VITE_API_URL` = `https://allowance-ally-production.up.railway.app/api`, plus `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

---

## Option B: Deploy with GitHub only — Fly.io backend (.github workflows)

Everything runs from **GitHub**: frontend on **GitHub Pages**, backend on **Fly.io**, both deployed by **GitHub Actions** when you push to `main`.

### Quick start (run once)

From the project root in PowerShell:

```powershell
.\scripts\setup-deploy.ps1
```

The script will: install Fly CLI if needed, open Fly login in your browser, and create the Fly app. Then it prints the exact commands and steps for **Fly secrets**, **GitHub secrets**, and **GitHub Pages**. Do those, then push to `main` to deploy.

---

### 1. Enable GitHub Pages (for Fly backend)

1. In your repo: **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.

### 2. One-time: Create the Fly.io app (backend) — Fly option

1. Install [Fly CLI](https://fly.io/docs/hubcli/install/): `winget install flyctl` (Windows) or see [fly.io/docs](https://fly.io/docs/hubcli/install/).
2. Sign in: `fly auth login`.
3. From the project root:
   ```bash
   cd backend
   fly launch --no-deploy
   ```
   When asked for app name, use e.g. `allowance-ally-api` (or leave default). Choose a region. Say **no** to PostgreSQL if you use your own MySQL.
4. Set secrets on Fly (DB, JWT, Supabase):
   ```bash
   fly secrets set DB_HOST=your-db-host DB_PORT=3306 DB_USER=... DB_PASSWORD=... DB_NAME=allowance_ally
   fly secrets set JWT_SECRET=your-jwt-secret SUPABASE_JWT_SECRET=your-supabase-jwt-secret
   ```
5. Get a deploy token: **Fly.io Dashboard → Account → Access Tokens → Create deploy token**. Copy the token.

### 3. Add GitHub repo secrets

In your repo: **Settings → Secrets and variables → Actions → New repository secret**. Add:

| Secret | Value |
|--------|--------|
| `FLY_API_TOKEN` | Your Fly.io deploy token (from step 2.5) |
| `VITE_API_URL` | `https://allowance-ally-api.fly.dev/api` (or your Fly app URL + `/api`) |
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |

### 4. Deploy

- **Frontend:** Push to `main`. The **Deploy Frontend to GitHub Pages** workflow will build and deploy. Your site will be at `https://<your-username>.github.io/<repo-name>/`.
- **Backend:** Push to `main` (changes under `backend/` trigger the **Deploy Backend to Fly.io** workflow). Or run the workflow manually: **Actions → Deploy Backend to Fly.io → Run workflow**.

### 5. Database

The backend expects **MySQL**. Use a hosted MySQL (e.g. [PlanetScale](https://planetscale.com), [Railway](https://railway.app), or your own) and set `DB_*` secrets on Fly (step 2.4).

---

## Option C: Vercel (frontend) + Render (backend)

Use **Render** instead of Railway for the backend. Vercel setup is the same; set `VITE_API_URL` to your Render backend URL + `/api`.

---

### Vercel (frontend)

1. [vercel.com](https://vercel.com) → **Add New… → Project** → import this repo.
2. **Root Directory:** `.` (repo root). Build/Output come from `vercel.json`.
3. **Environment Variables:** `VITE_API_URL` (backend URL + `/api`), `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

### Backend → Render

1. Go to [render.com](https://render.com) and sign in with **GitHub**.
2. **New → Web Service**, connect this repo.
3. **Root Directory:** `backend`.
4. **Runtime:** Node. **Build:** `npm install`. **Start:** `npm start`.
   - Or use the **Blueprint** from this repo: **New → Blueprint**, connect repo; Render will read `render.yaml`.
5. **Environment** (Environment tab), add:
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` (your MySQL or DB)
   - `JWT_SECRET`
   - `SUPABASE_JWT_SECRET` (from Supabase Dashboard → Settings → API → JWT Secret)
   - (Optional) `PORT` — Render sets this; only override if needed.
6. Deploy. Render will give a URL (e.g. `https://allowance-ally-api.onrender.com`).

**Database:** The backend expects **MySQL**. Options:

- Use a hosted MySQL (e.g. [PlanetScale](https://planetscale.com), [Railway](https://railway.app), or your own).
- Put the connection details in the env vars above.

---

---

## GitHub Actions in this repo

| Workflow | What it does |
|----------|----------------|
| **CI** | On push/PR: builds frontend and installs backend deps (no deploy). |
| **Deploy Frontend to GitHub Pages** | On push to `main`: deploys frontend to GitHub Pages (if you use that). |
| **Deploy Backend to Fly.io** | On push to `main` (backend changes): deploys backend to Fly.io (Option B only). |

With **Vercel + Railway**, Vercel and Railway deploy on push; no GitHub deploy workflows needed for frontend/backend.

---

## Summary

| Part      | Current (Vercel + Railway) | Option A        | Option B        | Option C        |
|----------|-----------------------------|-----------------|-----------------|-----------------|
| Frontend | **Vercel**                  | GitHub Pages    | GitHub Pages    | Vercel          |
| Backend  | **Railway**                 | Railway         | Fly.io          | Render          |

---

## Troubleshooting Render ("There's an error above")

If you see **"There's an error above. Please fix it to continue"** when deploying the backend:

### Option A: Create the service manually (no Blueprint)

1. In Render: **New → Web Service** (do **not** use “New → Blueprint”).
2. Connect your GitHub repo and select it.
3. Fill in:
   - **Name:** e.g. `allowance-ally-api` (must be unique in your account).
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Under **Instance Type**, click **Free** ($0/month). If you don’t select a plan, Render can show an error.
5. Click **Create Web Service**. Then add env vars (DB_*, JWT_SECRET, SUPABASE_JWT_SECRET) under the **Environment** tab.

### Option B: If you use the Blueprint (render.yaml)

1. **Scroll up** on the same page — the real error is above the red banner. Fix that message first.
2. Ensure **Instance Type** is selected (Blueprint now sets `plan: free` in `render.yaml`).
3. **Root Directory:** exactly `backend`. **Build:** `npm install`. **Start:** `npm start`.
4. If the name is taken, change the service name in `render.yaml` (e.g. `allowance-ally-api-2`) and try again.

### Other checks

- **Name:** must be unique in your Render account (e.g. `allowance-ally-api` or `yourname-allowance-ally`).
- **Environment variables:** add in Dashboard → Environment: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `SUPABASE_JWT_SECRET`.
- **Free tier:** instances **spin down after ~15 min** of no traffic; the next request can take 30–60 s and look like an error until the instance wakes up.
