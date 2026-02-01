# Deploy Allowance Ally Backend to Fly.io
# NOTE: Fly.io requires a credit card even for free tier
# For FREE without card: use Render instead - see ../DEPLOY-FREE.md
# Run this AFTER adding payment method at: https://fly.io/dashboard/billing

# Add Fly CLI to PATH
$env:Path = "$env:USERPROFILE\.fly\bin;$env:Path"

# === EDIT THESE VALUES ===
$DATABASE_URL = "postgresql://..."  # Supabase: Project Settings > Database > Connection string (URI)
$JWT_SECRET = "your-secure-random-string-at-least-32-chars"
$SUPABASE_JWT_SECRET = "your-supabase-jwt-secret"  # From Supabase Dashboard > Settings > API

Write-Host "=== Deploying to Fly.io ===" -ForegroundColor Cyan

# Create app if not exists
Write-Host "`n1. Creating app (if needed)..." -ForegroundColor Yellow
flyctl launch --no-deploy --yes --name allowance-ally-api 2>$null

# Set secrets
Write-Host "`n2. Setting secrets..." -ForegroundColor Yellow
flyctl secrets set `
  DATABASE_URL=$DATABASE_URL `
  JWT_SECRET=$JWT_SECRET `
  SUPABASE_JWT_SECRET=$SUPABASE_JWT_SECRET `
  NODE_ENV=production

# Deploy
Write-Host "`n3. Deploying..." -ForegroundColor Yellow
flyctl deploy

Write-Host "`n=== Done! ===" -ForegroundColor Green
Write-Host "Your API: https://allowance-ally-api.fly.dev/api" -ForegroundColor Cyan
Write-Host "Health:   https://allowance-ally-api.fly.dev/api/health" -ForegroundColor Cyan
Write-Host "`nUpdate VITE_API_URL in Vercel to: https://allowance-ally-api.fly.dev/api" -ForegroundColor Yellow
