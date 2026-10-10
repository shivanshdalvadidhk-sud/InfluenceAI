# InfluenceAI — AI-Powered YouTube Influencer Recommendation Platform

> A modern AI-powered influencer recommendation platform that helps brand partners discover, analyze, and shortlist suitable YouTube content creators using campaign requirements, semantic matching, performance metrics, and graph-based influence analysis.

---

## 🚀 Project Overview

**InfluenceAI** is a premium web application designed to help companies and brands identify the most suitable YouTube creators for their marketing campaigns.

Unlike traditional influencer discovery systems that primarily depend on raw follower counts or manual filtering, InfluenceAI leverages multiple factors to compute recommendations:

* Campaign budget parameters
* Influencer categories and content niches
* Creator geographic locations (Indian States and UTs)
* Target audience demographics (gender, age distribution)
* Content semantic relevance (Sentence-BERT similarity)
* Network connections (PageRank centrality graph analytics)

The system provides an **explainable AI suitability score** breakdown so that brands can understand the exact reasoning behind each creator's match level.

---

## 🎯 Project Objective & Target Market

The main objective of InfluenceAI is to reduce the time and effort required by brands to identify relevant creators.

The system is tailored for the **Indian creator market**, enabling localization features such as:
1. **Indian Regional State Selection**: Used at registration, profile configuration, and campaign creation.
2. **Indian National Languages Support**: Multi-select configurations across all 22 official languages of India (e.g., Hindi, Tamil, Telugu, Bengali, Kannada, Marathi, Gujarati, etc.).

---

## ✨ Implemented Features

### 🏢 Brand Partner Suite

* **Interactive Dashboard**: Quick metrics displaying active campaigns, average match scores, and recommended creators.
* **Campaign Creation Wizard**: Create campaigns with targeted budgets, location states, niches, age groups, and goals.
* **AI Recommendations Engine**: Discover, search, and filter recommended creators. Displays individual breakdown metrics (Semantic Relevance, Audience Match, Budget Fit, Network Graph Score).
* **Saved Influencers list**: Shortlist and bookmark recommended creators for campaigns.
* **Campaign History manager**: View, duplicate, or delete previous marketing campaign setups.
* **Interactive Graph Analytics**: Visual topological SVG network node graph visualizing PageRank and Betweenness Centrality connections.
* **Brand Profile settings**: Manage company details, address, industry, and state locations.

### 👤 Creator / Influencer Suite

* **Creator Profile Editor**: Configure YouTube channel handle details, content categories, pricing preferences, and languages.
* **Campaign Inquiries Inbox**: Review sponsorship proposals sent directly by brands, with options to **Accept Offer** or **Decline**.
* **Detailed Campaign Briefs**: Click-through pages showing the exact custom budget and deliverables proposed by the brand.
* **Saved Opportunities**: Bookmark briefs to keep track of and review deals.
* **Shared Notifications & Settings**: Manage notification feeds and password controls.

---

## 🛠️ Technology Stack

* **Core**: HTML5, Vanilla CSS3 (Custom design tokens, glassmorphism card layouts, light lavender theme aesthetics)
* **Framework**: React.js (Vite environment)
* **Routing**: React Router DOM (Role-safeguarded private layouts)
* **Charts**: Recharts (Engagement & rating distributions)
* **Icons**: Lucide React
* **Theme**: Material UI (ThemeProvider, Slider controls, CssBaseline)
* **Simulation Layer**: Client-side mock service engine storing dynamic campaigns, bookmarks, and inquiries status inside `localStorage`.

---

## 📂 Project Structure

```text
src/
├── components/
│   ├── cards/          # InfluencerCard, etc.
│   ├── common/         # MatchBadge, ScoreBreakdown, Toast
│   ├── layout/         # Sidebar, Navbar, PageHeader, DashboardLayout
│   └── charts/         # SVG Node Graph analytics
│
├── data/
│   └── mockData.js     # Shared Indian YouTube Creators list, States & Languages list
│
├── pages/
│   ├── public/         # LandingPage
│   ├── auth/           # Login, Register, Role Selection, ForgotPassword
│   ├── company/        # Recommendations, GraphAnalytics, Campaigns, Brand Profiles
│   └── influencer/     # Inquiries, OpportunityDetail, Bookmarks, Creator Profiles
│
├── services/           # LocalStorage query service wrappers
│   ├── authService.js
│   ├── campaignService.js
│   └── influencerService.js
│
├── routes/
│   └── AppRoutes.jsx   # Route safety guards
│
├── App.jsx
└── main.jsx
```

---

## ⚙️ Getting Started

### 1. Clone & Setup
```bash
git clone <YOUR_REPOSITORY_URL>
cd InfluenceAI
cd frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run development server
```bash
npm run dev
```
Open `http://localhost:5173` to browse the app.

## 🧠 ML Recommendation Service

The `ml-service/` module reads model-ready data directly from the existing
Supabase PostgreSQL tables `ml_data.channels` and `ml_data.videos`. It does not
read or write CSV files. The training command assigns subscriber tiers,
clusters sufficiently populated tiers, writes only `tier` and `cluster_label`
back to `ml_data.channels`, and saves the XGBoost model artifacts locally under
`ml-service/models/`. Re-running training does not replace or recreate the
source table.

```bash
cd ml-service
python -m venv .venv
# Activate the virtual environment, then:
pip install -r requirements.txt
cp .env.example .env
# Set POSTGRES_URI in .env to the Supabase Session Pooler connection string
# (recommended for IPv4-only hosts).
python -m models.train_cluster_classifier
uvicorn api.main:app --reload
```

On PowerShell, copy the template with `Copy-Item .env.example .env`. Keep the
real `.env` out of Git; `.env.example` contains placeholders only. The API
loads the saved artifacts at startup and queries PostgreSQL for each
`POST /recommend` request. For example:

```bash
curl -X POST http://localhost:8000/recommend \
  -H "Content-Type: application/json" \
  -d '{"category":"fitness","top_n":5}'
```

The current notebook does not implement the claimed SBERT/category/sentiment
recommendation formula, and the source tables do not establish all of the
audience, budget, and profile fields required by the frontend's mock scoring
service. Therefore this API filters by category and ranks by
`avg_engagement_rate`; it does not claim to provide those missing scores.
The classifier's held-out accuracy measures cluster-membership prediction,
not recommendation quality.

---

## 👥 Project Team

* **Domain**: Machine Learning (ML) + Full Stack Web Development
* **Institution**: Devang Patel Institute of Advance Technology & Research (DEPSTAR), CHARUSAT.
* **Team Members**:
  * 24DIT004
  * 24DIT030
  * 24DIT014

---

## ⭐ Why InfluenceAI?

Traditional influencer discovery requires manually scouring platforms. InfluenceAI changes this by combining **Semantic NLP (Sentence-BERT similarity)** and **Graph Analytics (PageRank centrality)** to show brands exactly which creators drive true community connections, backed by an explainable, visual scoring dashboard.
