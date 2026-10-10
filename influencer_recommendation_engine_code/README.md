# Influencer recommendation engine

Recommendation-only prototype. Your existing cleaning pipeline and frontend are intentionally excluded.

## Structure
- `db.py`: reads `ml_data.channels` from PostgreSQL.
- `engine.py`: SBERT semantic matching, signal scoring, tier-aware re-ranking.
- `schemas.py`: campaign API input.
- `app.py`: FastAPI endpoint.
- `demo.py`: five synthetic channels to test ranking without a database.
- `run_live.py`: tests recommendations against your database.
- `tests/`: basic ranking checks.

## Install and test
```bash
pip install -r requirements.txt
python demo.py
```
The demo uses a small offline keyword embedder so it can be run without downloading SBERT. It checks code flow, not the quality of real semantic embeddings.

## Database
Set `DATABASE_URL` in your environment or a local `.env` file. Do not commit credentials.
PowerShell:
```powershell
$env:DATABASE_URL="postgresql+psycopg2://USER:PASSWORD@HOST:5432/postgres"
```
Then:
```bash
python run_live.py
```
Your channel tables are in `ml_data`, so the SQL uses `FROM ml_data.channels`.

## API
```bash
uvicorn app:app --reload --port 8000
```
Open `http://localhost:8000/docs`. POST `/recommend` with:
```json
{
  "category": "beauty",
  "campaign_description": "Promote a skincare serum and sunscreen for young adults in India.",
  "budget_inr": 50000,
  "target_country": "India",
  "campaign_goal": "engagement",
  "top_n": 5,
  "strict_category": true
}
```

## Important
- The schema supplied so far does not include creator fees, so budget suitability is reported as unknown and is not fabricated.
- Comment sentiment describes visible audience reaction; it does not prove follower authenticity.
- This uses a transparent weighted ranker, not XGBoost. XGBoost should be added when you have real campaign outcome labels (clicks, conversions, qualified leads, or brand ratings).
- `db.py` selects the columns from the schema you supplied. If a column is absent in your actual database, edit that SELECT.
- For better matching when channel descriptions are empty, join `ml_data.videos` and include recent video titles/descriptions/tags in the profile text. This starter does not replace your cleaning pipeline.
