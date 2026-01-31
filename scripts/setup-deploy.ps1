# Allowance Ally - One-time deploy setup (GitHub Pages + Fly.io)
# Run from project root: .\scripts\setup-deploy.ps1

$ErrorActionPreference = "Stop"
if ($PSScriptRoot) {
    Set-Location (Split-Path -Parent $PSScriptRoot)
} else {
    Set-Location $PWD
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Allowance Ally - Deploy Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check Fly CLI
Write-Host "[1/4] Checking Fly CLI..." -ForegroundColor Yellow
$fly = Get-Command flyctl -ErrorAction SilentlyContinue
if (-not $fly) {
    Write-Host "  Fly CLI not found. Installing via winget..." -ForegroundColor Yellow
    winget install flyctl --accept-package-agreements --accept-source-agreements
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  Install failed. Install manually: https://fly.io/docs/hubcli/install/" -ForegroundColor Red
        exit 1
    }
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
    Write-Host "  Restart this script or open a new terminal, then run again." -ForegroundColor Yellow
    exit 0
}
Write-Host "  OK" -ForegroundColor Green
Write-Host ""

# 2. Fly auth
Write-Host "[2/4] Fly.io login (browser will open)..." -ForegroundColor Yellow
& flyctl auth login
if ($LASTEXITCODE -ne 0) {
    Write-Host "  Login failed. Run: fly auth login" -ForegroundColor Red
    exit 1
}
Write-Host "  OK" -ForegroundColor Green
Write-Host ""

# 3. Create Fly app from backend (no deploy yet)
Write-Host "[3/4] Creating Fly.io app (backend)..." -ForegroundColor Yellow
Push-Location backend
try {
    # Use existing fly.toml; create app with this name/region without deploying
    & flyctl launch --no-deploy --name allowance-ally-api --region ord --yes 2>$null
    if ($LASTEXITCODE -ne 0) {
        # Maybe app name taken or --yes not supported; try without --yes
        & flyctl launch --no-deploy --name allowance-ally-api --region ord
    }
} finally {
    Pop-Location
}
Write-Host "  OK" -ForegroundColor Green
Write-Host ""

# 4. Remind secrets
Write-Host "[4/4] Next: set secrets and GitHub." -ForegroundColor Yellow
Write-Host ""
Write-Host "--- FLY.IO SECRETS (run in backend folder) ---" -ForegroundColor Cyan
Write-Host "  cd backend"
Write-Host "  fly secrets set DB_HOST=your-host DB_PORT=3306 DB_USER=your-user DB_PASSWORD=your-password DB_NAME=allowance_ally"
Write-Host "  fly secrets set JWT_SECRET=your-jwt-secret SUPABASE_JWT_SECRET=your-supabase-jwt-secret"
Write-Host ""
Write-Host "--- FLY DEPLOY TOKEN ---" -ForegroundColor Cyan
Write-Host "  1. Open https://fly.io/dashboard/personal_access_tokens"
Write-Host "  2. Create token (deploy) and copy it"
Write-Host ""
Write-Host "--- GITHUB REPO SECRETS ---" -ForegroundColor Cyan
Write-Host "  Repo -> Settings -> Secrets and variables -> Actions -> New repository secret"
Write-Host "  Add:"
Write-Host "    FLY_API_TOKEN     = (paste Fly deploy token)"
Write-Host "    VITE_API_URL     = https://allowance-ally-api.fly.dev/api"
Write-Host "    VITE_SUPABASE_URL    = (from your .env)"
Write-Host "    VITE_SUPABASE_ANON_KEY = (from your .env)"
Write-Host ""
Write-Host "--- ENABLE GITHUB PAGES ---" -ForegroundColor Cyan
Write-Host "  Repo -> Settings -> Pages -> Source: GitHub Actions"
Write-Host ""
Write-Host "Then push to main to deploy frontend (Pages) and backend (Fly)." -ForegroundColor Green
Write-Host ""
