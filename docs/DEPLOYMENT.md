# FloodGuard AI — Deployment Guide

## 1. Local Development Setup

### Prerequisites
- Node.js 18+ (Tested on Node 20 / 24)
- Python 3.9+ (Tested on Python 3.9 / 3.11)
- PostgreSQL with PostGIS extension (or local SQLite fallback)

### Step 1: Clone and Set Up Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt pydantic-settings
```

### Step 2: Initialize Database and Seed Data
```bash
PYTHONPATH=. ./venv/bin/python3 -c "from app.core.seed import seed_database; seed_database()"
```

### Step 3: Start Backend API
```bash
PYTHONPATH=. ./venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation will be live at `http://localhost:8000/docs`.

### Step 4: Set Up and Start Frontend
```bash
cd ../frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your web browser.

---

## 2. Docker Deployment

Deploy all services (PostgreSQL PostGIS, FastAPI Backend, Next.js Frontend) with a single command:

```bash
docker-compose up --build -d
```

Check container health:
```bash
docker-compose ps
```

Stop services:
```bash
docker-compose down
```

---

## 3. Production Cloud Deployment

### Frontend (Vercel)
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `.next`
- Environment Variables:
  - `NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api`

### Backend (Container Hosting / Render / Railway / AWS ECS)
- Dockerfile: `backend/Dockerfile`
- Environment Variables:
  - `DATABASE_URL=postgresql://user:pass@host:5432/floodguard`
  - `GEMINI_API_KEY=your_gemini_api_key`
  - `HOST=0.0.0.0`
  - `PORT=8000`
