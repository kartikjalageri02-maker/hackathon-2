# GitHub Push and Deployment Helper
param (
    [Parameter(Mandatory=$false)]
    [string]$RepoUrl
)

if (-not $RepoUrl) {
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host "  Beyond the Factory Floor — GitHub Deployment Script" -ForegroundColor Yellow
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host "Usage: .\deploy_github.ps1 -RepoUrl 'https://github.com/YOUR_USERNAME/YOUR_REPO.git'"
    Write-Host ""
    $RepoUrl = Read-Host "Enter your GitHub repository URL"
}

if (-not $RepoUrl) {
    Write-Host "No repository URL provided. Aborting." -ForegroundColor Red
    exit 1
}

Write-Host "Configuring remote origin: $RepoUrl..." -ForegroundColor Green
git remote remove origin 2>$null
git remote add origin $RepoUrl
git branch -M master

Write-Host "Staging and committing files..." -ForegroundColor Green
git add .
git commit -m "feat: complete Beyond the Factory Floor with 3D digital twin, component touch inspection & floating dark UI" 2>$null

Write-Host "Pushing to GitHub master branch..." -ForegroundColor Green
git push -u origin master

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host "  Successfully published to GitHub!" -ForegroundColor Green
    Write-Host "  Repository: $RepoUrl" -ForegroundColor White
    Write-Host "  Now import this repository directly into Vercel or Render:" -ForegroundColor Yellow
    Write-Host "  • Vercel: https://vercel.com/new (Choose Vite, root directory)" -ForegroundColor White
    Write-Host "  • Render: https://dashboard.render.com (Connect repo, auto-detects render.yaml)" -ForegroundColor White
    Write-Host "==========================================================" -ForegroundColor Cyan
} else {
    Write-Host "Git push encountered an issue. Ensure your GitHub authentication is active." -ForegroundColor Red
}
