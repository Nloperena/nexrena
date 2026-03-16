# Deploy nexrena-api to Heroku.
# Prereqs: Run "npx heroku login" once (or set HEROKU_API_KEY), then run this from repo root.
# Usage: .\scripts\deploy-heroku.ps1 [app-name]
# Example: .\scripts\deploy-heroku.ps1 nexrena-api

param([string]$AppName = $env:HEROKU_APP_NAME)
if (-not $AppName) { $AppName = "nexrena-api" }

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

# Ensure heroku remote exists
$remotes = git remote
if ($remotes -notmatch "heroku") {
  Write-Host "Adding heroku remote for app: $AppName"
  npx heroku git:remote -a $AppName
}

Write-Host "Pushing nexrena-api to Heroku..."
git subtree push --prefix nexrena-api heroku main

Write-Host "Pushing database schema..."
npx heroku run npx prisma db push --app $AppName

Write-Host "Running seed (Warren Daughtridge + subscription)..."
npx heroku run npx prisma db seed --app $AppName

Write-Host "Done. API: https://$AppName.herokuapp.com"
