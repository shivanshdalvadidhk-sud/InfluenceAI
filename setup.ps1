# InfluenceAI Integration Setup Script for Windows
# Run this in PowerShell as Administrator

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "InfluenceAI - Full Stack Integration Setup" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Check for Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Install backend dependencies
Write-Host "`n📦 Installing Backend Dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install
Set-Location ..

# Install frontend dependencies
Write-Host "`n📦 Installing Frontend Dependencies..." -ForegroundColor Yellow
Set-Location frontend
npm install
Set-Location ..

Write-Host "`n✅ Installation complete!" -ForegroundColor Green

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

Write-Host "`n1. Update your .env files:" -ForegroundColor Yellow
Write-Host "   - Backend: ./backend/.env"
Write-Host "   - Frontend: ./frontend/.env"

Write-Host "`n2. Run the migrations on Supabase:" -ForegroundColor Yellow
Write-Host "   - Copy and run: ./backend/migrations/add_recommendation_history.sql"
Write-Host "   - In Supabase SQL Editor"

Write-Host "`n3. Start the servers in separate terminals:" -ForegroundColor Yellow
Write-Host "   - Backend:  npm run dev --prefix backend"
Write-Host "   - Frontend: npm run dev --prefix frontend"
Write-Host "   - AI Engine (Python): python -m uvicorn influencer_recommendation_engine_code.app:app --reload --port 8000"

Write-Host "`n4. Open http://localhost:5173 in your browser" -ForegroundColor Yellow

Write-Host "`n==========================================" -ForegroundColor Cyan
