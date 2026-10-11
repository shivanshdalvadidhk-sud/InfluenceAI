# InfluenceAI - Quick Start Checklist

## 🎯 Pre-Deployment Checklist

Use this checklist to ensure everything is properly configured before deploying to production.

### ✅ Environment Setup

- [ ] Node.js 18+ installed
- [ ] Python 3.9+ installed
- [ ] Supabase account created
- [ ] Git installed and configured
- [ ] npm/pip installed and working

### 📦 Backend Configuration

**File: `backend/.env`**
- [ ] `PORT=5000` (or your preferred port)
- [ ] `SUPABASE_URL` - Your Supabase project URL
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Service role key (keep secret!)
- [ ] `SUPABASE_KEY` - Public key
- [ ] `AI_ENGINE_URL=http://localhost:8000` (or your AI engine URL)
- [ ] `CORS_ORIGIN` - Frontend URL (http://localhost:5173 for dev)

**File: `backend/package.json`**
- [ ] Dependencies installed: `npm install`
- [ ] Test backend: `npm run dev` (should show "Server running on port 5000")

### 🎨 Frontend Configuration

**File: `frontend/.env`**
- [ ] `VITE_API_BASE_URL=http://localhost:5000/api`
- [ ] `VITE_SUPABASE_URL` - Same as backend
- [ ] `VITE_SUPABASE_KEY` - Public key (same as backend)

**File: `frontend/package.json`**
- [ ] Dependencies installed: `npm install`
- [ ] Test frontend: `npm run dev` (should show "VITE v... ready in ... ms")

### 🤖 AI Engine Configuration

**File: `influencer_recommendation_engine_code/.env`** (if applicable)
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] Other required AI engine env vars

**Setup:**
- [ ] Dependencies installed: `pip install -r requirements.txt`
- [ ] Test AI engine: `python -m uvicorn app:app --reload --port 8000`

### 🗄️ Database Setup

**In Supabase SQL Editor:**
- [ ] Run migration: `backend/migrations/add_recommendation_history.sql`
- [ ] Verify tables created:
  - [ ] `recommendation_history` table exists
  - [ ] Indexes created properly
  - [ ] RLS policies enabled

**Expected tables:**
```
- influencers (should already exist)
- campaigns (should already exist)
- recommendation_history (newly created)
- users (from auth)
```

### 🔐 Security Checks

- [ ] SUPABASE_SERVICE_ROLE_KEY not committed to git
- [ ] .env files in .gitignore
- [ ] No hardcoded credentials in code
- [ ] CORS properly configured (frontend URL specified)
- [ ] RLS policies enabled on sensitive tables
- [ ] Environment variables required for startup

### 🚀 Deployment Sequence

**Terminal 1: Start AI Engine**
```bash
cd influencer_recommendation_engine_code
python -m uvicorn app:app --reload --port 8000
# Wait for: "Uvicorn running on http://0.0.0.0:8000"
```

**Terminal 2: Start Backend**
```bash
npm run dev --prefix backend
# Wait for: "Server running on port 5000"
```

**Terminal 3: Start Frontend**
```bash
npm run dev --prefix frontend
# Wait for: "Local: http://localhost:5173/"
```

### 🧪 Verification Tests

#### Backend Health
```bash
curl http://localhost:5000/api/health
# Should return 200 status
```

#### AI Engine Health
```bash
curl http://localhost:8000/docs
# Should show FastAPI Swagger documentation
```

#### Frontend Access
```
Open http://localhost:5173 in browser
# Should load without errors
```

#### Database Connection
```bash
# In Supabase Dashboard:
# - Navigate to SQL Editor
# - Run: SELECT COUNT(*) FROM influencers;
# - Should return influencer count
```

#### Recommendation API
```bash
curl -X POST http://localhost:5000/api/recommendations/match \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Fashion",
    "campaign_description": "Summer fashion campaign",
    "budget_inr": 500000,
    "target_country": "India",
    "campaign_goal": "brand_awareness",
    "top_n": 5
  }'
# Should return array of influencer recommendations
```

### 📊 Feature Verification Checklist

- [ ] Can create campaign from dashboard
- [ ] Can generate recommendations
- [ ] Recommendations show:
  - [ ] Influencer profile picture
  - [ ] Influencer name and handle
  - [ ] Subscriber count highlighted in purple
  - [ ] AI match score
  - [ ] YouTube profile button (clickable link)
  - [ ] Engagement rate
  - [ ] Content niche
- [ ] Can click "Visit Channel" to open YouTube
- [ ] Recommendations saved to database
- [ ] Can view recommendation history
- [ ] History shows past recommendations
- [ ] Can download recommendations as CSV

### 🐛 Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| "Cannot connect to AI engine" | Port 8000 not available | Check if process running: `lsof -i :8000` |
| CORS error in browser console | CORS not configured | Update CORS_ORIGIN in backend/.env |
| Database connection failed | Wrong SUPABASE credentials | Verify keys in Supabase dashboard |
| Recommendations not saving | Table doesn't exist | Run migration SQL in Supabase |
| Frontend not loading | Wrong API URL | Check VITE_API_BASE_URL in frontend/.env |
| AI Engine crashes | Missing dependencies | Run `pip install -r requirements.txt` |

### 📈 Performance Checks

- [ ] Page load time < 2 seconds
- [ ] Recommendations generated in < 5 seconds
- [ ] History loads without lag
- [ ] No console errors when clicking buttons
- [ ] Responsive on mobile (test with DevTools)

### 🔄 Data Quality

- [ ] Influencer data populated in database
- [ ] Sample influencers have:
  - [ ] Profile pictures (avatar URLs)
  - [ ] YouTube handles
  - [ ] Subscriber counts
  - [ ] Engagement rates
  - [ ] Content niches
- [ ] At least 100 influencers in database for testing

### 📝 Documentation Check

- [ ] README.md up to date
- [ ] API endpoints documented
- [ ] Database schema documented
- [ ] Setup instructions clear
- [ ] Troubleshooting guide complete

### 🎉 Production Ready?

Check all items above, then:

1. **Code Review**
   - [ ] No hardcoded credentials
   - [ ] No console.log statements in production code
   - [ ] Error handling implemented
   - [ ] Loading states shown

2. **Testing**
   - [ ] Manual feature testing passed
   - [ ] API testing completed
   - [ ] Database operations verified
   - [ ] Error scenarios tested

3. **Documentation**
   - [ ] User guide created
   - [ ] API documentation complete
   - [ ] Deployment steps documented
   - [ ] Known issues/limitations documented

4. **Backup & Recovery**
   - [ ] Database backups configured
   - [ ] .env files backed up securely
   - [ ] Deployment rollback plan ready

### 🚢 Deployment Steps

#### To Deploy:

1. **Commit and push code**
```bash
git add .
git commit -m "InfluenceAI integrated and ready for production"
git push origin main
```

2. **Update environment on production server**
```bash
# Update .env with production values
# Ensure all credentials are correct
```

3. **Run database migrations**
```bash
# On production Supabase project
# Run migrations/add_recommendation_history.sql
```

4. **Start services**
```bash
# Start all three services on production
npm run build --prefix frontend  # Build for production
npm run build --prefix backend   # If applicable
```

### 📞 Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Express.js Docs**: https://expressjs.com/
- **React Docs**: https://react.dev/
- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **GitHub Issues**: Check project repo for reported issues

---

## ✨ You're All Set!

Once you've completed this checklist, your InfluenceAI platform should be:
- ✅ Fully integrated
- ✅ Working end-to-end
- ✅ Ready for user testing
- ✅ Production-ready

**Next Steps:**
1. User acceptance testing (UAT)
2. Performance optimization if needed
3. Security audit
4. Production deployment
5. Monitoring and logging setup

**Good luck with your deployment! 🚀**
