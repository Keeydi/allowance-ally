# Scripts

## setup-deploy.ps1

One-time setup for deploying via **GitHub Pages** (frontend) and **Fly.io** (backend).

**Run from project root (PowerShell):**

```powershell
.\scripts\setup-deploy.ps1
```

It will:

1. Install Fly CLI if missing (`winget install flyctl`)
2. Open Fly.io login in your browser
3. Create the Fly app for the backend (no deploy yet)
4. Print the exact steps for Fly secrets, GitHub secrets, and enabling Pages

Then add the secrets and enable Pages as printed; push to `main` to deploy both frontend and backend.

See [DEPLOYMENT.md](../DEPLOYMENT.md) for full details.
