# 🚀 InfluenceAI - Quick Start Guide

## One-Command Setup (Choose your OS)

### Windows (PowerShell)
```powershell
# Run as Administrator
.\setup.ps1
```

### macOS/Linux
```bash
chmod +x setup.sh
./setup.sh
```

---

## Manual Three-Terminal Startup

### Terminal 1: Backend API
```bash
cd backend
npm install
npm run dev
```

**Expected Output:**
```
✓ Backend server running on port 5000
✓ Connect to http://localhost:5000
```

### Terminal 2: Frontend
```bash
cd frontend
npm install
npm run dev
```

**Expected Output:**
```
✓ VITE v... ready
✓ Local: http://localhost:5173/
```

### Terminal 3: AI Engine (Python)
```bash
cd influencer_recommendation_engine_code
pip install -r requirements.txt
python -m uvicorn app:app --reload --port 8000
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

---

## 🔧 Configuration Checklist

Before starting, ensure these files are configured:

### ✅ Backend Configuration
**File:** `backend/.env`
```env
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
SUPABASE_KEY=your_public_key
AI_ENGINE_URL=http://localhost:8000
```

### ✅ Frontend Configuration
**File:** `frontend/.env`
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_KEY=your_public_key
```

### ✅ Database Migration
Run this SQL in Supabase SQL Editor:
```sql
-- Copy entire content of: backend/migrations/add_recommendation_history.sql
```

---

## 📋 Startup Checklist

- [ ] Backend configured (.env filled)
- [ ] Frontend configured (.env filled)
- [ ] AI Engine requirements.txt installed
- [ ] Database migration completed
- [ ] All three terminals ready to start

---

## ⚡ Quick Test Commands

After all services are running:

### Test Backend API
```bash
curl http://localhost:5000/api/health
# Should return 200 status
```

### Test AI Engine
```bash
curl http://localhost:8000/docs
# Should open Swagger documentation
```

### Test Frontend
Open in browser: `http://localhost:5173`

### Test Full Flow
1. Create a campaign
2. Click "Get Recommendations"
3. View influencer recommendations
4. Click "Visit Channel" on an influencer
5. Check browser console for errors (should be clean)

---

## 🎯 What You'll See

### Frontend Dashboard
- Campaign management interface
- Influencer recommendation results
- Profile cards with:
  - Profile picture
  - YouTube channel link (red button)
  - Subscriber count (purple highlight)
  - Engagement rate
  - AI match score
  - Niche category

### Recommendation Card Features
```
┌─────────────────────────────────┐
│  [Profile Pic] Influencer Name  │
│  @youtube_handle                │
│                                 │
│  👥 2.5M Subscribers ⭐        │  ← Purple highlight
│                                 │
│  Views: 125K | Engagement: 4.5% │
│  Niche: Fashion                 │
│  Match Score: 85% 🎯            │
│                                 │
│  [YouTube 🔴] [Save] [Details]  │
│  [Send Offer]                   │
└─────────────────────────────────┘
```

### History Page
- Timeline of all recommendation runs
- Expandable recommendation sets
- CSV export per set
- Statistics dashboard

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Port already in use" | Change port in .env or kill existing process |
| "Cannot find module" | Run `npm install` in that directory |
| "Connection refused" | Ensure all services are running |
| "AI engine unavailable" | System uses fallback scoring (will still work) |
| "No recommendations showing" | Check browser console for API errors |

---

## 📊 Project Files Structure

```
InfluenceAI/
├── backend/
│   ├── controllers/
│   │   └── recommendationController.js  ← AI integration
│   ├── migrations/
│   │   └── add_recommendation_history.sql  ← Database schema
│   ├── routes/
│   │   └── recommendationRoutes.js
│   ├── .env  ← Configure this
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── cards/
│   │   │   │   └── InfluencerCard.jsx  ← Profile display
│   │   │   └── RecommendationHistory.jsx  ← History page
│   │   ├── pages/
│   │   │   └── company/
│   │   │       └── Recommendations.jsx
│   │   └── services/
│   │       └── recommendationService.js  ← API calls
│   ├── .env  ← Configure this
│   └── package.json
│
├── influencer_recommendation_engine_code/
│   ├── app.py  ← FastAPI application
│   ├── requirements.txt
│   └── .env  ← Configure this (if needed)
│
├── INTEGRATION_GUIDE.md  ← Full documentation
├── INTEGRATION_SUMMARY.md  ← Architecture overview
├── DEPLOYMENT_CHECKLIST.md  ← Pre-launch checklist
└── setup.sh / setup.ps1  ← Automated setup
```

---

## 🔍 Key Components Explained

### 1. InfluencerCard.jsx
Displays individual influencer recommendations with:
- Profile picture
- YouTube link
- Subscriber count highlight
- All metrics properly formatted

### 2. recommendationController.js
Orchestrates:
- Calling AI engine
- Enriching data with profiles
- Saving to history
- Fallback scoring

### 3. recommendationService.js
Bridges frontend and backend:
- Calls API endpoint
- Handles responses
- Provides fallback
- Fetches history

### 4. RecommendationHistory.jsx
Shows past recommendations:
- Timeline view
- Expandable details
- CSV export
- Statistics

---

## 📈 Success Indicators

Everything is working when you see:

✅ **Dashboard loads without errors**
✅ **Can create a campaign**
✅ **Recommendations generate**
✅ **Influencer cards display with pictures**
✅ **Subscriber count shows in purple box**
✅ **YouTube buttons are clickable**
✅ **Can visit YouTube channels**
✅ **History saves recommendations**
✅ **Can view recommendation history**
✅ **No console errors**

---

## 🎓 Next Steps After Setup

1. **Explore the Dashboard**
   - Create test campaigns
   - Generate recommendations
   - Test all buttons

2. **Test Recommendation Workflow**
   - Campaign → Recommendations → History
   - Verify data flows correctly

3. **Check Mobile Responsiveness**
   - Test on different screen sizes
   - Verify all features work on mobile

4. **Review Database**
   - Check Supabase dashboard
   - Verify recommendation_history table
   - Check stored recommendations

5. **Performance Testing**
   - Time recommendation generation
   - Check page load times
   - Monitor API response times

---

## 📞 Need Help?

### Documentation
- **Full Guide**: See `INTEGRATION_GUIDE.md`
- **Architecture**: See `INTEGRATION_SUMMARY.md`
- **Deployment**: See `DEPLOYMENT_CHECKLIST.md`

### Check Logs
```bash
# Backend logs (Terminal 1) - watch for errors
# Frontend console (Browser DevTools) - F12 → Console tab
# AI Engine logs (Terminal 3) - watch for API calls
```

### Common Errors
Search for error message in `INTEGRATION_GUIDE.md` troubleshooting section

---

## 🎉 You're Ready!

Once all services are running and the tests pass, your InfluenceAI platform is fully operational!

**Deployed Components:**
- ✅ Frontend (React)
- ✅ Backend (Express)
- ✅ AI Engine (Python/FastAPI)
- ✅ Database (Supabase)
- ✅ UI Components (Influencer Cards)
- ✅ History Tracking (Database + UI)
- ✅ Profile Display (Pictures, Links, Subscribers)

**Ready to:**
- ✅ Generate AI-powered recommendations
- ✅ Display influencer profiles beautifully
- ✅ Track recommendation history
- ✅ Export recommendations
- ✅ Manage campaigns
- ✅ Save favorite influencers

---

**Happy influencer matching! 🎬✨**

For detailed information, refer to:
- INTEGRATION_GUIDE.md (Complete setup & usage)
- INTEGRATION_SUMMARY.md (Architecture & data flows)
- DEPLOYMENT_CHECKLIST.md (Pre-launch verification)
