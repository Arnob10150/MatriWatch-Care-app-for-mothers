# Ensures a local PostgreSQL instance is installed, running, and provisioned
# with the matriwatch role/database, then pushes the Drizzle schema and seeds
# demo data. Safe to re-run - every step checks before acting.
#
# Usage: powershell -ExecutionPolicy Bypass -File scripts/setup-local-db.ps1

$ErrorActionPreference = "Stop"

$PgUser = "matriwatch"
$PgPassword = "matriwatch"
$PgDb = "matriwatch"
$PgPort = 5432
$DatabaseUrl = "postgres://${PgUser}:${PgPassword}@localhost:${PgPort}/${PgDb}"

function Find-PsqlExe {
    $candidate = Get-Command psql -ErrorAction SilentlyContinue
    if ($candidate) { return $candidate.Source }

    $pgRoot = "C:\Program Files\PostgreSQL"
    if (Test-Path $pgRoot) {
        $versions = Get-ChildItem $pgRoot -Directory | Sort-Object Name -Descending
        foreach ($v in $versions) {
            $exe = Join-Path $v.FullName "bin\psql.exe"
            if (Test-Path $exe) { return $exe }
        }
    }
    return $null
}

$service = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue | Select-Object -First 1

if (-not $service) {
    Write-Host "PostgreSQL not found - installing via winget..."
    winget install --id PostgreSQL.PostgreSQL.17 --accept-package-agreements --accept-source-agreements --silent
    Start-Sleep -Seconds 5
    $service = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue | Select-Object -First 1
    if (-not $service) {
        throw "PostgreSQL installation did not register a Windows service. Install manually and re-run this script."
    }
}

if ($service.Status -ne "Running") {
    Write-Host "Starting PostgreSQL service ($($service.Name))..."
    Start-Service -Name $service.Name
    Start-Sleep -Seconds 3
}

if ($service.StartType -ne "Automatic") {
    Set-Service -Name $service.Name -StartupType Automatic
}

$psql = Find-PsqlExe
if (-not $psql) {
    throw "psql.exe not found after install. Check your PostgreSQL installation."
}

Write-Host "Using psql at: $psql"

# The default superuser password set by the winget package is "postgres".
# If you changed it, set PGPASSWORD_SUPERUSER before running this script.
$superuserPassword = if ($env:PGPASSWORD_SUPERUSER) { $env:PGPASSWORD_SUPERUSER } else { "postgres" }
$env:PGPASSWORD = $superuserPassword

$roleExists = & $psql -U postgres -h localhost -tAc "SELECT 1 FROM pg_roles WHERE rolname='$PgUser'"
if (-not $roleExists) {
    Write-Host "Creating role '$PgUser'..."
    & $psql -U postgres -h localhost -c "CREATE ROLE $PgUser WITH LOGIN PASSWORD '$PgPassword';"
} else {
    Write-Host "Role '$PgUser' already exists."
}

$dbExists = & $psql -U postgres -h localhost -tAc "SELECT 1 FROM pg_database WHERE datname='$PgDb'"
if (-not $dbExists) {
    Write-Host "Creating database '$PgDb'..."
    & $psql -U postgres -h localhost -c "CREATE DATABASE $PgDb OWNER $PgUser;"
} else {
    Write-Host "Database '$PgDb' already exists."
}

Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Pushing schema..."
$repoRoot = Split-Path -Parent $PSScriptRoot
Push-Location (Join-Path $repoRoot "packages\db")
try {
    $env:DATABASE_URL = $DatabaseUrl
    pnpm run push

    $env:PGPASSWORD = $PgPassword
    $motherCount = & $psql -U $PgUser -h localhost -d $PgDb -tAc "SELECT count(*) FROM mothers" 2>$null
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue

    if ($motherCount -and [int]$motherCount.Trim() -gt 0) {
        Write-Host "Database already has $($motherCount.Trim()) mother record(s) - skipping seed."
    } else {
        Write-Host "Seeding demo data..."
        pnpm run seed
    }
} finally {
    Remove-Item Env:\DATABASE_URL -ErrorAction SilentlyContinue
    Pop-Location
}

Write-Host ""
Write-Host "Done. DATABASE_URL=$DatabaseUrl"
