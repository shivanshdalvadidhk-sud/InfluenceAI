#!/bin/bash
# InfluenceAI Integration Setup Script

echo "=========================================="
echo "InfluenceAI - Full Stack Integration Setup"
echo "=========================================="

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Install backend dependencies
echo ""
echo "📦 Installing Backend Dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo ""
echo "📦 Installing Frontend Dependencies..."
cd frontend
npm install
cd ..

echo ""
echo "✅ Installation complete!"
echo ""
echo "=========================================="
echo "Next Steps:"
echo "=========================================="
echo ""
echo "1. Update your .env files:"
echo "   - Backend: ./backend/.env"
echo "   - Frontend: ./frontend/.env"
echo ""
echo "2. Run the migrations on Supabase:"
echo "   - Copy and run: ./backend/migrations/add_recommendation_history.sql"
echo "   - In Supabase SQL Editor: https://supabase.com/dashboard/project/[PROJECT_ID]/sql/new"
echo ""
echo "3. Start the servers:"
echo "   - Backend:  npm run dev --prefix backend"
echo "   - Frontend: npm run dev --prefix frontend"
echo "   - AI Engine (Python): python -m uvicorn influencer_recommendation_engine_code.app:app --reload --port 8000"
echo ""
echo "4. Open http://localhost:5173 in your browser"
echo ""
echo "=========================================="
