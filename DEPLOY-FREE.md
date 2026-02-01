# Deploy Backend FREE (No Credit Card)

**Render** — Free tier, no credit card required.

---

## Render Setup (5 minutes)

### 1. Push your code to GitHub
Ensure your repo is on GitHub (main branch).

### 2. Create Render account
1. Go to [render.com](https://render.com) → **Get Started**
2. Sign up with **GitHub** (no credit card needed)

### 3. Deploy via Blueprint
1. In Render Dashboard: **New** → **Blueprint**
2. Connect your GitHub account → select **allowance-ally** repo
3. Render will detect `render.yaml`
4. Click **Apply** (or **Create Resources**)
5. **IMPORTANT:** Under **Instance Type**, select **Free** ($0/month)

### 4. Add environment variables
After the service is created, go to **Environment** tab and add:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Supabase: Project Settings → Database → Connection string (URI) |
| `JWT_SECRET` | Random string, 32+ chars |
| `SUPABASE_JWT_SECRET` | From Supabase Dashboard → Settings → API |

### 5. Get your API URL
After deploy: `https://allowance-ally-api.onrender.com`

API base: **`https://allowance-ally-api.onrender.com/api`**

Update `VITE_API_URL` in Vercel to this URL.

---

## Database: Supabase (PostgreSQL)

The app uses **Supabase** for both auth and data. No separate MySQL needed.

1. **Supabase Dashboard** → Project Settings → Database
2. Copy **Connection string** (URI) → use as `DATABASE_URL`
3. Run `database/setup-supabase.sql` in Supabase SQL Editor (one-time)

---

## Render free tier limits

- **Spin down** after 15 min of no traffic (wakes in ~30–60 sec)
- 750 hours/month
- 512MB RAM

First request after idle may take up to a minute — this is normal.

---

## If Blueprint shows an error

Create the service **manually** instead:

1. **New** → **Web Service** (not Blueprint)
2. Connect repo, select it
3. **Root Directory:** `backend`
4. **Build Command:** `npm install`
5. **Start Command:** `npm start`
6. **Instance Type:** **Free**
7. **Create Web Service**
8. Add env vars in **Environment** tab

---

## Summary

| Step | Action |
|------|--------|
| 1 | Push to GitHub |
| 2 | [render.com](https://render.com) → New → Blueprint |
| 3 | Connect repo, Apply, select **Free** |
| 4 | Add DATABASE_URL, JWT_SECRET, SUPABASE_JWT_SECRET |
| 5 | Set `VITE_API_URL` in Vercel to `https://your-app.onrender.com/api` |
