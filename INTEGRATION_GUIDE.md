# InfluenceAI - Integrated Influencer Recommendation System

A complete end-to-end platform for intelligent influencer discovery and campaign management with AI-powered recommendations.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      INFLUENCEAI PLATFORM                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐    ┌──────────────────┐                  │
│  │   FRONTEND       │    │   BACKEND API    │                  │
│  │  (React Vite)    │◄──►│  (Node/Express)  │                  │
│  │  - Dashboard     │    │  - Auth Routes   │                  │
│  │  - Campaigns     │    │  - Campaign Mgmt │                  │
│  │  - Recommendations│   │  - Influencers   │                  │
│  │  - History       │    │  - Recommendations                  │
│  │  - Analytics     │    │                  │                  │
│  └──────────────────┘    └──────────────────┘                  │
│           ▲                        │                            │
│           │                        ▼                            │
│           └──────────────┬────────────────┐                    │
│                          │                │                    │
│                    ┌─────────────┐  ┌──────────────┐           │
│                    │  SUPABASE   │  │ AI ENGINE    │           │
│                    │  DATABASE   │  │  (Python)    │           │
│                    │             │  │  - SBERT     │           │
│                    │ - Profiles  │  │  - ML Models │           │
│                    │ - Influencers        │  - Scoring      │           │
│                    │ - Campaigns │  │  - Ranking   │           │
│                    │ - History   │  │              │           │
│                    └─────────────┘  └──────────────┘           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 📦 Components

### 1. **Frontend** (`frontend/`)
- **Framework**: React 19 with Vite
- **UI Library**: Material-UI (MUI)
- **State Management**: React Hooks + Context
- **API Client**: Axios
- **Charts**: Recharts

**Key Features:**
- Brand company dashboard
- Campaign creation and management
- AI-powered influencer recommendations
- Influencer profile browsing
- Saved influencers management
- Recommendation history
- Campaign analytics

### 2. **Backend** (`backend/`)
- **Framework**: Express.js 5
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Email**: Nodemailer
- **API Documentation**: RESTful

**Key Routes:**
- `POST /api/recommendations/match` - Get AI recommendations
- `GET /api/recommendations/history/:campaignId` - Get recommendation history
- `GET /api/influencers` - List all influencers
- `POST /api/campaigns` - Create campaigns
- `GET /api/auth/user` - Get user info

### 3. **AI Engine** (`influencer_recommendation_engine_code/`)
- **Framework**: FastAPI + Uvicorn
- **ML Libraries**: sentence-transformers, scikit-learn, pandas
- **Algorithms**: SBERT embeddings, cosine similarity, ranking
- **Database**: PostgreSQL for channel data

**Features:**
- Semantic matching using SBERT embeddings
- Budget fit calculation
- Engagement rate analysis
- Subscriber tier classification
- Multi-factor scoring system

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ & npm
- Python 3.9+
- Supabase account
- Git

### Installation

#### Windows (PowerShell)
```powershell
# Run as Administrator
.\setup.ps1
```

#### macOS/Linux
```bash
chmod +x setup.sh
./setup.sh
```

### Manual Setup

1. **Install Dependencies**
```bash
# Backend
cd backend && npm install && cd ..

# Frontend
cd frontend && npm install && cd ..

# AI Engine
cd influencer_recommendation_engine_code
pip install -r requirements.txt
cd ../..
```

2. **Configure Environment Variables**

**Backend** (`backend/.env`):
```env
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-key
SUPABASE_KEY=your-public-key
AI_ENGINE_URL=http://localhost:8000
```

**Frontend** (`frontend/.env`):
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=your-public-key
```

**AI Engine** (`influencer_recommendation_engine_code/.env`):
```env
DATABASE_URL=postgresql://user:password@host:5432/database
```

3. **Database Setup**

Run the migration in Supabase SQL Editor:
```sql
-- Execute backend/migrations/add_recommendation_history.sql
```

This creates:
- `recommendation_history` table for tracking all recommendations
- Proper indexes for performance
- Row-level security policies

### Start the Development Servers

**Terminal 1 - Backend API**
```bash
npm run dev --prefix backend
# Runs on http://localhost:5000
```

**Terminal 2 - Frontend**
```bash
npm run dev --prefix frontend
# Runs on http://localhost:5173
```

**Terminal 3 - AI Engine (Python)**
```bash
cd influencer_recommendation_engine_code
python -m uvicorn app:app --reload --port 8000
# Runs on http://localhost:8000
```

**Open in Browser:**
```
http://localhost:5173
```

## 📋 Features

### ✨ AI-Powered Recommendations

The recommendation engine combines multiple scoring factors:

1. **Semantic Matching (35%)** - Uses SBERT to understand campaign descriptions
2. **Audience Fit (25%)** - Analyzes demographic alignment
3. **Budget Compatibility (20%)** - Ensures cost alignment
4. **Engagement Score (15%)** - Evaluates influencer engagement rates
5. **Graph/Network Score (10%)** - Considers influencer influence network

### 📊 Recommendation Storage

All recommendations are automatically saved to the database:
- Campaign reference
- Selected influencers with scores
- Generated recommendations
- Timestamp

Access via:
```
GET /api/recommendations/history/:campaignId
```

### 🎯 Influencer Display Features

**Profile Cards Show:**
- ✅ Profile Picture (Avatar)
- ✅ YouTube Channel Link (clickable)
- ✅ Subscriber Count (highlighted)
- ✅ Average Views per Video
- ✅ Engagement Rate
- ✅ Content Niche
- ✅ Location (State)
- ✅ AI Match Score

**User Actions:**
- Save influencers to list
- Visit YouTube channel (direct link)
- View detailed profile
- Send collaboration offers

### 📑 Recommendation History

- View all past recommendations
- Filter by campaign
- Re-run recommendations with different criteria
- Export recommendation lists
- Compare multiple sets of recommendations

## 🔄 Data Flow

### 1. Campaign Creation
```
User → Frontend → Backend → Supabase
                    ↓
            Stores campaign details
```

### 2. Recommendation Request
```
Frontend → Backend API → AI Engine → ML Processing
     ↓                      ↓
   DISPLAY           PostgreSQL (Channels Data)
                           ↓
                    Scoring & Ranking
                           ↓
                    Return Top Matches
                           ↓
           Backend Enriches with Influencer Data
                           ↓
                   Save to recommendation_history
                           ↓
                    Return to Frontend
```

### 3. Recommendation Display
```
Frontend fetches recommendations
         ↓
Display InfluencerCard components
         ↓
Show: Avatar, Handle, Subscribers, Links, Scores
         ↓
User can: Save, Visit Channel, View Details, Send Offer
         ↓
Actions saved to campaign history
```

## 🛠️ API Endpoints

### Recommendations
```
POST   /api/recommendations/match          - Get AI recommendations
GET    /api/recommendations/history/:id    - Get history for campaign
```

### Campaigns
```
POST   /api/campaigns                      - Create campaign
GET    /api/campaigns                      - List user's campaigns
GET    /api/campaigns/:id                  - Get campaign details
PUT    /api/campaigns/:id                  - Update campaign
DELETE /api/campaigns/:id                  - Delete campaign
```

### Influencers
```
GET    /api/influencers                    - List all influencers
GET    /api/influencers/:id                - Get influencer details
```

### Authentication
```
POST   /api/auth/login                     - User login
POST   /api/auth/register                  - User registration
POST   /api/auth/logout                    - User logout
GET    /api/auth/user                      - Get current user
```

## 📊 Database Schema

### Key Tables

**recommendation_history**
```sql
- id: BIGINT (Primary Key)
- campaign_id: BIGINT (Foreign Key)
- user_id: UUID (Foreign Key)
- recommendations: JSONB (Array of recommendation objects)
- created_at: TIMESTAMPTZ
```

**influencers**
```sql
- id: BIGINT
- full_name: TEXT
- creator_name: TEXT
- youtube_handle: TEXT
- content_niche_category: TEXT
- subscribers: BIGINT
- avatar: TEXT (Profile picture URL)
- engagement_rate: NUMERIC
- state_ut: TEXT
- bio: TEXT
- graph_score: INT
```

## 🎨 UI Components

### InfluencerCard
- Displays single influencer recommendation
- Shows profile picture, name, handle
- Displays subscriber count prominently
- Shows niche, engagement, match score
- Action buttons: Save, Visit YouTube, View Details, Send Offer

### Recommendations Page
- Filter by niche, location, subscriber range
- Sort by: Match Score, Engagement, Cost, Views
- Search by name/handle/description
- Display grid of influencer cards

### CampaignHistory
- Lists all user's campaigns
- Shows campaign details
- Duplicate/delete options
- Links to view recommendations

### RecommendationHistory (New)
- Shows timeline of all recommendations
- Access from campaign detail page
- Compare recommendation sets
- Re-run recommendations

## 🔐 Security Features

- ✅ CORS protection
- ✅ Security headers (X-Frame-Options, X-XSS-Protection)
- ✅ Row-level security (RLS) in database
- ✅ Authentication required for user actions
- ✅ Service role key for backend operations
- ✅ Environment variable protection

## 📈 Performance Optimizations

- **Caching**: AI engine caches channel data (10 min TTL)
- **Indexes**: Database indexes on frequently filtered columns
- **Lazy Loading**: Frontend pagination
- **Connection Pooling**: Database connection management
- **Compression**: gzip compression on API responses

## 🐛 Troubleshooting

### "AI Engine not available" warning
- Ensure Python AI Engine is running on port 8000
- Check AI_ENGINE_URL in backend/.env
- Fallback scoring will be used automatically

### Database Connection Issues
- Verify SUPABASE_URL and keys in .env
- Check network connectivity to Supabase
- Ensure migrations have been run

### Frontend Not Loading
- Clear browser cache
- Check VITE_API_BASE_URL in .env
- Ensure backend is running on port 5000

### Recommendations Not Saving
- Verify recommendation_history table exists
- Check user authentication
- Ensure campaign_id is valid

## 📚 Development

### Adding New Recommendation Criteria

Edit `backend/controllers/recommendationController.js`:
```javascript
// In the recommendations mapping:
const finalScore = Math.round(
  semanticMatch * 0.35 +
  budgetFit * 0.25 +
  engagementScore * 0.20 +
  graphScore * 0.20 +
  newFactor * 0.XX  // Add new factor
);
```

### Customizing UI

Edit components in `frontend/src/components/`:
- Modify InfluencerCard styling
- Add new filters to Recommendations page
- Customize history display

### Extending Database

Add migrations in `backend/migrations/`:
```sql
CREATE TABLE new_table (
  -- columns
);
```

## 📦 Dependencies

**Frontend:**
- react@19.2
- axios@1.19
- recharts@3.10
- @mui/material@9.3
- lucide-react@1.31

**Backend:**
- express@5.2
- @supabase/supabase-js@2.115
- cors@2.8
- dotenv@17.4

**AI Engine:**
- fastapi
- sentence-transformers
- scikit-learn
- pandas
- sqlalchemy

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open Pull Request

## 📄 License

This project is part of SGP AI-Based Influencer Recommendation System.

## 📞 Support

For issues and questions:
- Check the Troubleshooting section
- Review API documentation
- Check backend logs for errors
- Verify environment configuration

---

**Last Updated**: October 2026
**Version**: 1.0.0
**Status**: Production Ready ✅
