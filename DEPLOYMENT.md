# Deploy Frontend & Backend via GitHub

You can deploy both the **frontend** (Vite/React) and **backend** (Node/Express) by connecting this GitHub repo to hosting platforms. Push to `main` (or `master`) and they auto-deploy.

---

## 1. Frontend → Vercel (recommended)

1. Go to [vercel.com](https://vercel.com) and sign in with **GitHub**.
2. Click **Add New… → Project**, import this repo.
3. **Root Directory:** leave as `.` (repo root).
4. **Build:** already set by `vercel.json`:
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. **Environment variables** (Settings → Environment Variables), add:
   - `VITE_API_URL` = your backend API URL (e.g. `https://allowance-ally-api.onrender.com/api` **after** backend is deployed)
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
6. Deploy. Vercel will build and host the frontend and give you a URL (e.g. `https://allowance-ally.vercel.app`).

**Important:** Set `VITE_API_URL` to your **backend** URL so the app calls the right API in production.

---

## 2. Backend → Render (recommended)

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

## 3. Wire frontend to backend

1. After the backend is deployed, copy its URL (e.g. `https://allowance-ally-api.onrender.com`).
2. In **Vercel** (frontend project) → Settings → Environment Variables, set:
   - `VITE_API_URL` = `https://allowance-ally-api.onrender.com/api`
3. Redeploy the frontend (Deployments → … → Redeploy) so the new env is used.

---

## 4. GitHub CI (optional)

This repo includes a **GitHub Actions** workflow (`.github/workflows/ci.yml`) that:

- On every push/PR to `main` (or `master`): builds the frontend and installs backend deps.

No deploy step is in the workflow; deployment is done by **Vercel** and **Render** when you connect the repo. The workflow only checks that the app builds.

---

## Summary

| Part      | Platform | Connect repo → auto-deploy on push |
|----------|----------|-------------------------------------|
| Frontend | Vercel   | Yes; set `VITE_API_URL`, Supabase vars |
| Backend  | Render   | Yes; set DB + JWT + `SUPABASE_JWT_SECRET` |

Both can be deployed via GitHub by connecting the same repo to Vercel (frontend) and Render (backend).
