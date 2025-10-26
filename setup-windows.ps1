# Windows Setup Script for CRUD + RBAC Platform
# Run this script as Administrator

Write-Host "🚀 Setting up CRUD + RBAC Platform for Windows..." -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Yellow

# Check if Node.js is installed
Write-Host "📋 Checking Node.js installation..." -ForegroundColor Cyan
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please download and install Node.js 18+ from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not available!" -ForegroundColor Red
    exit 1
}

# Clean up existing files
Write-Host "🧹 Cleaning up existing files..." -ForegroundColor Cyan
Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "dev.db" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "package-lock.json" -Force -ErrorAction SilentlyContinue

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green

# Create .env file
Write-Host "⚙️ Creating environment configuration..." -ForegroundColor Cyan
$envContent = "DATABASE_URL=`"file:./dev.db`""
Set-Content -Path ".env" -Value $envContent -Encoding UTF8
Write-Host "✅ Environment configuration created!" -ForegroundColor Green

# Generate Prisma client
Write-Host "🔧 Generating Prisma client..." -ForegroundColor Cyan
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate Prisma client!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Prisma client generated successfully!" -ForegroundColor Green

# Push database schema
Write-Host "💾 Setting up database..." -ForegroundColor Cyan
npx prisma db push
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to setup database!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Database setup completed!" -ForegroundColor Green

# Create models directory
Write-Host "📁 Creating models directory..." -ForegroundColor Cyan
New-Item -ItemType Directory -Path "models" -Force | Out-Null
Write-Host "✅ Models directory created!" -ForegroundColor Green

Write-Host ""
Write-Host "🎉 Setup completed successfully!" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Yellow
Write-Host "🚀 To start the application, run:" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Then open your browser and navigate to:" -ForegroundColor Cyan
Write-Host "   http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "📚 For troubleshooting, see WINDOWS_SETUP.md" -ForegroundColor Yellow
Write-Host "=================================================" -ForegroundColor Yellow