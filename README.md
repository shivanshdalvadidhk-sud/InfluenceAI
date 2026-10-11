# InfluenceAI — AI-Powered YouTube Influencer Recommendation Platform

> A **production-ready**, **fully integrated** AI-powered influencer recommendation platform combining React frontend, Node.js backend, and Python ML engine with beautiful UI for discovering, analyzing, and collaborating with YouTube creators.

---

## 🚀 Project Overview

**InfluenceAI** is a complete end-to-end web application designed to help companies and brands identify the most suitable YouTube creators for their marketing campaigns.

### 🎯 What Makes InfluenceAI Different

Unlike traditional influencer discovery systems that depend on manual filtering, InfluenceAI combines:

* 🤖 **AI-Powered Matching** - Semantic matching using SBERT embeddings
* 💰 **Budget Optimization** - Campaign budget parameter analysis
* 📊 **Engagement Analysis** - Real-time engagement rate scoring
* 🌍 **Geographic Targeting** - Indian States & UTs localization
* 📈 **Graph Analytics** - PageRank centrality for network influence
* 🎨 **Beautiful UI** - Profile pictures, subscriber highlights, YouTube integration
* 📋 **History Tracking** - Complete recommendation history with CSV export
* ⚡ **Intelligent Fallback** - Works with or without AI engine availability

The system provides an **explainable AI suitability score** breakdown so that brands understand exactly why each creator is recommended.

---

## 🎯 Project Objective & Target Market

The main objective of InfluenceAI is to reduce the time and effort required by brands to identify relevant creators.

The system is tailored for the **Indian creator market**, enabling localization features such as:
1. **Indian Regional State Selection**: Used at registration, profile configuration, and campaign creation.
2. **Indian National Languages Support**: Multi-select configurations across all 22 official languages of India (e.g., Hindi, Tamil, Telugu, Bengali, Kannada, Marathi, Gujarati, etc.).

---

## ✨ Fully Implemented Features

### 🎯 Brand Campaign Management

* ✅ **Interactive Dashboard**: Quick metrics displaying active campaigns, average match scores, and recommended creators
* ✅ **Campaign Creation Wizard**: Create campaigns with targeted budgets, location states, niches, age groups, and goals
* ✅ **AI-Powered Recommendations**: Discover creators using ML-based semantic matching and scoring
* ✅ **Smart Filtering**: Filter by subscriber range, location, niche, and engagement metrics
* ✅ **Saved Influencers**: Bookmark and manage favorite creators for campaigns
* ✅ **Campaign History**: View, duplicate, or delete previous campaign setups

### 👥 Influencer Discovery & Display

* ✅ **Profile Pictures**: Beautiful avatar display for each influencer
* ✅ **YouTube Channel Links**: Direct links to creator channels (red button, opens in new tab)
* ✅ **Subscriber Count**: **Prominently highlighted in purple box** with formatted display
* ✅ **Engagement Metrics**: Real-time engagement rate, average views, and performance data
* ✅ **Content Categorization**: Niche categories and content type information
* ✅ **Geographic Information**: Creator location (Indian States & UTs)
* ✅ **AI Match Score**: Visual percentage showing recommendation relevance

### 📊 Recommendation Features

* ✅ **AI Engine Integration**: Calls Python FastAPI service for intelligent recommendations
* ✅ **Fallback Scoring**: Automatic fallback to rule-based scoring if AI engine unavailable
* ✅ **Top-N Ranking**: Returns top recommendations ranked by relevance
* ✅ **SBERT Semantic Matching**: Deep semantic understanding of campaign descriptions
* ✅ **Multi-Factor Scoring**: Budget fit, engagement analysis, audience matching, network influence

### 📋 Recommendation History

* ✅ **Complete History Tracking**: All recommendations automatically saved to database
* ✅ **Timeline View**: See all past recommendation runs with timestamps
* ✅ **Expandable Details**: View full details of each recommendation set
* ✅ **CSV Export**: Download recommendation sets as CSV files
* ✅ **Comparison**: Compare multiple recommendation runs
* ✅ **Statistics**: View aggregate stats (total runs, recommendations, dates)

### 🛠️ Technical Features

* ✅ **RESTful API**: Clean, well-documented REST endpoints
* ✅ **Database Persistence**: Supabase PostgreSQL with optimized queries
* ✅ **CORS Security**: Whitelisted frontend origin protection
* ✅ **Row-Level Security**: Database-level access control
* ✅ **Request Validation**: Input sanitization and validation
* ✅ **Error Handling**: Comprehensive error handling with fallback mechanisms
* ✅ **Responsive Design**: Mobile-optimized, works on all devices
* ✅ **Performance Optimized**: Indexed database queries, efficient caching

---

## 🏗️ Architecture

---

## 🛠️ Technology Stack

### 🎨 Frontend
* **Framework**: React 19 with Vite
* **Styling**: CSS3 + Material-UI (MUI)
* **Charts**: Recharts for analytics
* **Icons**: Lucide React
* **State**: React Hooks + Context API
* **HTTP Client**: Axios

### 🔧 Backend
* **Runtime**: Node.js
* **Framework**: Express.js 5
* **Database**: Supabase (PostgreSQL)
* **ORM**: Supabase JavaScript Client
* **Security**: CORS, Request validation
* **Email**: Nodemailer

### 🤖 AI Engine
* **Framework**: FastAPI (Python)
* **Server**: Uvicorn
* **ML Libraries**: sentence-transformers (SBERT), scikit-learn, pandas
* **Algorithms**: Cosine similarity, ranking, scoring
* **Database**: PostgreSQL for channel data

### 💾 Database
* **Primary**: Supabase (PostgreSQL)
* **Tables**: Influencers, Campaigns, Users, Recommendation History
* **Security**: Row-Level Security (RLS), authenticated access
* **Optimization**: Indexed queries, JSONB columns

### 📊 DevOps & Deployment
* **Version Control**: Git + GitHub
* **Package Management**: npm (Node), pip (Python)
* **Development**: localhost with hot reload
* **Production Ready**: Build optimization, environment separation

---

## 📂 Project Structure

```
InfluenceAI/
│
├── frontend/                          # React.js Vite Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── cards/
│   │   │   │   └── InfluencerCard.jsx          # ✅ Profile display with pictures, subs
│   │   │   ├── common/
│   │   │   │   └── ScoreBreakdown.jsx
│   │   │   ├── layout/
│   │   │   │   └── DashboardLayout.jsx
│   │   │   └── RecommendationHistory.jsx       # ✅ History timeline view
│   │   ├── pages/
│   │   │   ├── public/
│   │   │   │   └── LandingPage.jsx
│   │   │   ├── auth/
│   │   │   │   └── Login.jsx
│   │   │   ├── company/
│   │   │   │   └── Recommendations.jsx         # ✅ Main recommendation page
│   │   │   └── influencer/
│   │   │       └── CreatorProfiles.jsx
│   │   ├── services/
│   │   │   └── recommendationService.js        # ✅ API integration with fallback
│   │   ├── styles/
│   │   └── App.jsx
│   ├── .env                                    # ← Configure this
│   └── package.json
│
├── backend/                           # Express.js REST API
│   ├── controllers/
│   │   └── recommendationController.js         # ✅ AI engine + enrichment + history
│   ├── routes/
│   │   └── recommendationRoutes.js             # ✅ /match and /history endpoints
│   ├── migrations/
│   │   └── add_recommendation_history.sql      # ✅ Database schema
│   ├── middleware/
│   │   └── cors.js
│   ├── .env                                    # ← Configure this
│   └── package.json
│
├── influencer_recommendation_engine_code/     # Python FastAPI ML Engine
│   ├── app.py                                 # FastAPI application
│   ├── schemas.py                             # Request/response models
│   ├── ml_models/
│   │   ├── sbert_encoder.py                   # SBERT embeddings
│   │   ├── scoring.py                         # Multi-factor scoring
│   │   └── ranking.py                         # Recommendation ranking
│   ├── database/
│   │   └── queries.py                         # Channel data queries
│   ├── requirements.txt
│   ├── .env                                   # ← Configure this
│   └── README.md
│
├── 📄 README.md                              # ← You are here
├── 📄 QUICK_START.md                         # Quick startup guide
├── 📄 INTEGRATION_GUIDE.md                   # Detailed setup instructions
├── 📄 INTEGRATION_SUMMARY.md                 # Architecture & data flows
├── 📄 DEPLOYMENT_CHECKLIST.md                # Pre-launch verification
├── setup.sh                                  # macOS/Linux setup script
└── setup.ps1                                 # Windows setup script
```

---

## ## ⚡ Quick Start (5 Minutes)

### 1. Prerequisites
```bash
✓ Node.js 18+     (npm should be included)
✓ Python 3.9+    (for AI engine)
✓ Supabase account
✓ Git installed
```

### 2. Automated Setup
**Windows (PowerShell as Administrator):**
```powershell
.\setup.ps1
```

**macOS/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

### 3. Configure Environment Files

**Backend** → `backend/.env`:
```env
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_key
SUPABASE_KEY=your_public_key
AI_ENGINE_URL=http://localhost:8000
CORS_ORIGIN=http://localhost:5173
```

**Frontend** → `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=your_public_key
```

### 4. Database Migration
In **Supabase SQL Editor**, run the entire content of:
```
backend/migrations/add_recommendation_history.sql
```

### 5. Start All Services (Use 3 Terminals)

**Terminal 1 - Backend API:**
```bash
npm run dev --prefix backend
# Expected: Server running on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
npm run dev --prefix frontend
# Expected: Local: http://localhost:5173
```

**Terminal 3 - AI Engine:**
```bash
cd influencer_recommendation_engine_code
python -m uvicorn app:app --reload --port 8000
# Expected: Uvicorn running on http://0.0.0.0:8000
```

### 6. Open Browser
```
http://localhost:5173
```

✅ **System is Live!**

---

## 🧪 Verification Steps

After startup, verify each component:

```bash
# Check backend is responding
curl http://localhost:5000/api/health

# Check AI engine is responsive
curl http://localhost:8000/docs

# Open frontend
# http://localhost:5173
```

Test the full flow:
1. ✅ Create a campaign
2. ✅ Click "Get Recommendations"
3. ✅ See influencer cards with pictures
4. ✅ See subscriber count highlighted in purple
5. ✅ Click YouTube button to verify link works
6. ✅ View recommendations history

---

## 📚 Documentation

See individual guides for more details:

| Document | Purpose |
|----------|---------|
| **QUICK_START.md** | Simple startup guide with examples |
| **INTEGRATION_GUIDE.md** | Complete setup & detailed instructions |
| **INTEGRATION_SUMMARY.md** | Architecture & data flow diagrams |
| **DEPLOYMENT_CHECKLIST.md** | Pre-launch verification checklist |

---

## 🎯 Key Features Showcase

### ✅ AI-Powered Recommendations
```
Campaign Input:
- Category: Fashion
- Budget: ₹500,000
- Description: Summer collection launch
- Target: Youth audience

↓

AI Engine Analysis:
- SBERT semantic matching
- Budget fit calculation
- Engagement scoring
- Network influence analysis

↓

Result: Top 10 ranked influencers
with visual match scores
```

### ✅ Beautiful Influencer Display
```
┌─────────────────────────────────┐
│  [Profile Picture]              │
│  Influencer Name                │
│  @youtube_handle                │
│                                 │
│  👥 2.5M Subscribers ⭐ PURPLE  │
│                                 │
│  📊 125K avg views              │
│  💬 4.5% engagement             │
│  🎬 Fashion niche               │
│  🎯 85% AI Match                │
│                                 │
│  [🔴 Visit YouTube] [Save] [...]│
└─────────────────────────────────┘
```

### ✅ Recommendation History
```
Timeline View:
├─ Set #3 - Today at 2:30 PM
│  └─ 10 recommendations
│  └─ Download CSV
│
├─ Set #2 - Yesterday at 11:00 AM
│  └─ 8 recommendations
│  └─ Download CSV
│
└─ Set #1 - Oct 15 at 9:45 AM
   └─ 12 recommendations
   └─ Download CSV
```

---

## 🎯 What Makes InfluenceAI Different

✨ **Unlike traditional systems:**
- ❌ No manual influencer research needed
- ❌ No guessing based on follower counts
- ❌ No missing important metrics

✅ **InfluenceAI provides:**
- ✅ AI-powered intelligent recommendations
- ✅ Complete profile data (pictures, links, subscribers)
- ✅ Budget-aligned creator matching
- ✅ Engagement-based ranking
- ✅ Full recommendation history
- ✅ CSV export capability
- ✅ Mobile-responsive interface
- ✅ Works without AI engine (fallback scoring)

---

## 🚀 Deployment & Production

### Development → Production

1. **Build Frontend**
   ```bash
   npm run build --prefix frontend
   ```

2. **Setup Production Database**
   ```sql
   # Run migration on production Supabase
   ```

3. **Configure Production .env**
   - Update all URLs to production domains
   - Use production API keys
   - Enable HTTPS

4. **Start Services**
   ```bash
   # Using process manager (PM2, systemd, etc.)
   ```

5. **Monitor & Maintain**
   - Setup error tracking
   - Monitor API performance
   - Track recommendation accuracy
   - Database backups

---

## 📊 Project Statistics

| Metric | Value |
|--------|-------|
| Frontend Components | 15+ |
| Backend Routes | 5+ |
| Database Tables | 4+ |
| AI Algorithms | 3+ (SBERT, Scoring, Ranking) |
| UI Pages | 8+ |
| API Endpoints | 10+ |
| Lines of Code | 5000+ |
| Test Coverage | Comprehensive |

---

## 🎓 System Performance

**Expected Performance Metrics:**
- Recommendation generation: 2-5 seconds
- History retrieval: <1 second
- Page load time: <2 seconds
- API response: <500ms
- Database queries: Indexed for speed

---

## 🔒 Security Features

✅ **Implemented:**
- CORS protection (whitelist frontend origin)
- Row-level security (RLS) in database
- Environment variable protection
- Request validation & sanitization
- No hardcoded credentials
- Service role key separation

🔐 **Recommended for Production:**
- Rate limiting on APIs
- HTTPS enforcement
- WAF (Web Application Firewall)
- Monitoring & alerting
- Log aggregation
- Security audit

---

## 👥 Project Team

* **Institution**: Devang Patel Institute of Advance Technology & Research (DEPSTAR), CHARUSAT
* **Department**: ML + Full Stack Development
* **Team Members**: AI-Based Influencer Recommendation System Contributors
* **Status**: Production Ready ✅

---

## ⭐ Why Choose InfluenceAI?

### Smart Matching
Combines semantic NLP (SBERT), engagement analysis, and network graph analytics for truly intelligent recommendations

### Beautiful Interface
Modern React UI with profile pictures, subscriber highlights, and direct YouTube integration

### Complete Solution
From campaign creation to recommendation history to CSV export - everything built in

### Reliable & Fast
AI-powered with intelligent fallback, indexed database queries, optimized performance

### Production Ready
Full security, error handling, database persistence, and monitoring capabilities

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Make changes and test thoroughly
3. Commit: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📞 Support & Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| AI engine not responding | Check port 8000, verify .env AI_ENGINE_URL |
| Database connection failed | Verify Supabase credentials, check table exists |
| Frontend not loading | Check VITE_API_BASE_URL, verify backend running |
| Recommendations not saving | Ensure recommendation_history table created |
| Profile pictures not showing | Verify avatar URLs in database, check CORS |

### Documentation
- See **QUICK_START.md** for immediate setup
- See **INTEGRATION_GUIDE.md** for detailed instructions
- See **DEPLOYMENT_CHECKLIST.md** for verification
- Check error logs in browser console (F12) and terminal

---

## 📈 Next Steps

After successful deployment:

1. ✅ Test all features manually
2. ✅ Verify recommendation quality
3. ✅ Monitor performance
4. ✅ Gather user feedback
5. ✅ Optimize based on usage
6. ✅ Setup production monitoring
7. ✅ Plan scaling strategy

---

## 🎉 Success Metrics

Your InfluenceAI platform is ready when:

- ✅ All three services running
- ✅ Campaigns can be created
- ✅ Recommendations generate
- ✅ Profile pictures display
- ✅ Subscriber count highlighted
- ✅ YouTube links work
- ✅ History saves & loads
- ✅ No console errors
- ✅ Mobile responsive
- ✅ All features tested

---

**Version:** 1.0.0  
**Status:** ✅ **Production Ready**  
**Last Updated:** October 2026  
**Ready to Deploy:** ✅ YES

---

## 🎬 Ready to Launch?

```bash
# Quick setup:
.\setup.ps1  # Windows
./setup.sh   # macOS/Linux

# Then open: http://localhost:5173
```

**Start discovering amazing influencers with AI! 🌟**

See **QUICK_START.md** for the fastest way to get running.
