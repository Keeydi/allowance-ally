# Create MySQL Database for Allowance Ally
# PowerShell script to create the database using init.sql (consolidated schema)

Write-Host "Creating Allowance Ally Database..." -ForegroundColor Cyan
Write-Host ""

# Try to find MySQL
$mysqlPath = $null
$possiblePaths = @(
    "mysql",
    "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe",
    "C:\Program Files\MySQL\MySQL Server 8.1\bin\mysql.exe",
    "C:\xampp\mysql\bin\mysql.exe",
    "C:\wamp64\bin\mysql\mysql8.0.xx\bin\mysql.exe"
)

foreach ($path in $possiblePaths) {
    if ($path -eq "mysql") {
        $cmd = Get-Command mysql -ErrorAction SilentlyContinue
        if ($cmd) {
            $mysqlPath = "mysql"
            break
        }
    } else {
        if (Test-Path $path) {
            $mysqlPath = $path
            break
        }
    }
}

if (-not $mysqlPath) {
    Write-Host "ERROR: MySQL not found in common locations" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please either:" -ForegroundColor Yellow
    Write-Host "1. Add MySQL to your PATH, or" -ForegroundColor Yellow
    Write-Host "2. Run this command manually with the full path to mysql.exe" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Example:" -ForegroundColor Cyan
    Write-Host '  & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p < setup.sql' -ForegroundColor White
    Write-Host ""
    $manualPath = Read-Host "Or enter the full path to mysql.exe (press Enter to skip)"
    if ($manualPath -and (Test-Path $manualPath)) {
        $mysqlPath = $manualPath
    } else {
        exit 1
    }
}

# Get MySQL credentials
$mysqlUser = Read-Host "Enter MySQL username (default: root)"
if ([string]::IsNullOrWhiteSpace($mysqlUser)) {
    $mysqlUser = "root"
}

$securePassword = Read-Host "Enter MySQL password" -AsSecureString
$mysqlPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
)

# Get current directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
# Try setup.sql first (final version), fall back to init.sql
$schemaFile = Join-Path $scriptDir "setup.sql"
if (-not (Test-Path $schemaFile)) {
    $schemaFile = Join-Path $scriptDir "init.sql"
}

if (-not (Test-Path $schemaFile)) {
    Write-Host "ERROR: setup.sql or init.sql not found in $scriptDir" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Creating database..." -ForegroundColor Yellow

# Build command
if ($mysqlPath -eq "mysql") {
    if ([string]::IsNullOrWhiteSpace($mysqlPassword)) {
        $command = "mysql -u $mysqlUser < `"$schemaFile`""
    } else {
        $command = "mysql -u $mysqlUser -p$mysqlPassword < `"$schemaFile`""
    }
} else {
    if ([string]::IsNullOrWhiteSpace($mysqlPassword)) {
        $command = "& `"$mysqlPath`" -u $mysqlUser < `"$schemaFile`""
    } else {
        $command = "& `"$mysqlPath`" -u $mysqlUser -p$mysqlPassword < `"$schemaFile`""
    }
}

try {
    if ($mysqlPath -eq "mysql") {
        if ([string]::IsNullOrWhiteSpace($mysqlPassword)) {
            Get-Content $schemaFile | & mysql -u $mysqlUser
        } else {
            Get-Content $schemaFile | & mysql -u $mysqlUser -p$mysqlPassword
        }
    } else {
        if ([string]::IsNullOrWhiteSpace($mysqlPassword)) {
            Get-Content $schemaFile | & $mysqlPath -u $mysqlUser
        } else {
            Get-Content $schemaFile | & $mysqlPath -u $mysqlUser -p$mysqlPassword
        }
    }
    
    if ($LASTEXITCODE -eq 0 -or $?) {
        Write-Host ""
        Write-Host "✓ Database created successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Default users (passwords need to be set via backend):" -ForegroundColor Cyan
        Write-Host "  Admin: admin@allowanceally.com" -ForegroundColor White
        Write-Host "  User:  user@example.com" -ForegroundColor White
        Write-Host ""
        Write-Host "JWT Secret configured: 2788586556239fc3edf9bee4a806f67e" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "ERROR: Failed to create database" -ForegroundColor Red
        Write-Host "Please check your MySQL credentials and try again" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

