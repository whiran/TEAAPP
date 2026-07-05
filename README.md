# Ceylon Tea Intelligence Platform 🍵

A production-ready geospatial intelligence platform for Ceylon tea estates, featuring interactive mapping, weather intelligence, disaster alerting, and factory management.

## 🏗️ Architecture

This is a **monorepo** containing:
- **Frontend**: Next.js 15 with App Router, Tailwind CSS, Shadcn UI, and Leaflet.js
- **Backend**: Python FastAPI with geospatial capabilities (geopandas, PostGIS) + Tomorrow.io integration
- **Database**: PostgreSQL 16 with PostGIS extension for geospatial queries

## 📁 Project Structure

```
TEAAPP/
├── frontend/                      # Next.js 15 Application
│   ├── app/                      # App Router pages
│   │   ├── layout.tsx            # Root layout (ThemeProvider, Leaflet CSS)
│   │   ├── globals.css           # Design tokens, dark mode, Leaflet fixes
│   │   ├── page.tsx              # Dashboard (WeatherMap + live stats)
│   │   ├── weathermap/           # Regional Map (ATC, TI, District boundaries)
│   │   ├── factories/            # Factory Map (1,055 registered factories)
│   │   ├── alerts/               # Disaster Alerts Center (Tomorrow.io)
│   │   ├── analytics/            # Analytics Dashboard (Phase 2 - Coming Soon)
│   │   ├── estates/              # Estate Management (Phase 2 - Coming Soon)
│   │   └── reports/              # Reports Generator (Phase 2 - Coming Soon)
│   ├── components/
│   │   ├── Navigation.tsx        # Responsive navbar + dark mode toggle
│   │   ├── ThemeProvider.tsx     # Dark/light mode context
│   │   ├── ThemeToggle.tsx       # Sun/moon toggle button
│   │   └── map/
│   │       ├── WeatherMap.tsx    # Dashboard map (Windy layers + estate polygons)
│   │       ├── RegionalMap.tsx   # ATC/TI/district boundary GeoJSON map
│   │       ├── FactoryMap.tsx    # Factory pins with filter panel
│   │       └── FactoryFilterPanel.tsx
│   ├── hooks/
│   │   └── useDisasterAlerts.ts  # 4-hour polling hook (Tomorrow.io)
│   ├── public/
│   │   └── data/                 # Static GeoJSON and factory data
│   ├── Phase2_spec.md            # Phase 2 technical specification (Agri-Met engine)
│   ├── next.config.js
│   ├── tailwind.config.ts
│   └── package.json
│
├── backend/                       # FastAPI Application
│   ├── api/
│   │   ├── alerts.py             # GET /api/alerts/active
│   │   ├── analytics.py          # GET /api/analytics (Phase 2 stub)
│   │   ├── factories.py          # GET /api/factories (filterable)
│   │   ├── tea_lands.py          # GET /api/tea-lands (PostGIS polygons)
│   │   └── weather.py            # GET /api/weather/risk (Blister Blight)
│   ├── services/
│   │   ├── alert_service.py      # Tomorrow.io Events + Flood Risk logic
│   │   ├── tomorrowio_service.py # Tomorrow.io API client
│   │   └── weather_service.py   # Meteosource + Blister Blight risk model
│   ├── main.py                   # FastAPI app, CORS, router registration
│   ├── config.py                 # Settings (API keys via pydantic/dotenv)
│   ├── models.py                 # TeaLand, TeaEstate, ProductionRecord
│   ├── database.py               # SQLAlchemy engine + session
│   ├── init_db.py                # Database initialisation script
│   └── requirements.txt
│
├── docker-compose.yml             # Service orchestration
├── .gitignore
└── README.md
```

## 📋 Prerequisites

- **Docker** (v20.10+)
- **Docker Compose** (v2.0+)
- **Git**
- **Node.js** (v20+) — for local frontend development
- **Python** (v3.11+) — for local backend development

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd TEAAPP
```

### 2. Configure API Keys

Create a `.env` file in the **repo root** (next to `docker-compose.yml`):

```env
# Tomorrow.io — Disaster Alerts & Weather Events
TOMORROWIO_API_KEY=your_key_here
TOMORROWIO_BASE_URL=https://api.tomorrow.io/v4

# Windy — Weather Layer Visualisation
PF_WINDY_API_KEY=your_point_forecast_key
MP_WINDY_API_KEY=your_map_forecast_key

# Meteosource — Agri-Met analytics (Phase 2)
METEOSOURCE_API_KEY=your_key_here
```

Also create `backend/.env` for local development:

```env
DATABASE_URL=postgresql://tea_admin:tea_secure_pass_2024@localhost:5432/ceylon_tea_db
TOMORROWIO_API_KEY=your_key_here
PF_WINDY_API_KEY=your_key_here
MP_WINDY_API_KEY=your_key_here
```

### 3. Start All Services

```bash
# Build and start all services (frontend, backend, database)
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

### 4. Access the Application

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Swagger Docs | http://localhost:8000/docs |
| ReDoc | http://localhost:8000/redoc |
| Database | localhost:5432 |

### 5. Stop Services

```bash
docker-compose down

# To remove volumes as well
docker-compose down -v
```

## 🛠️ Development Workflow

### Frontend Development (Next.js)

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### Backend Development (FastAPI)

```bash
cd backend

# Activate virtual environment (repo root .venv)
../.venv/Scripts/activate   # Windows
source ../.venv/bin/activate # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## 🗺️ Pages & Features

| Route | Feature | Status |
|---|---|---|
| `/` | Dashboard + WeatherMap | ✅ Live |
| `/weathermap` | Regional boundaries (ATC / TI / Districts) | ✅ Live |
| `/factories` | 1,055 factory map with multi-filter | ✅ Live |
| `/alerts` | Disaster Alerts Center (Tomorrow.io) | ✅ Live |
| `/analytics` | Yield trends, disease risk (Phase 2) | 🔜 Coming Soon |
| `/estates` | Estate registry & management (Phase 2) | 🔜 Coming Soon |
| `/reports` | Automated report generation (Phase 2) | 🔜 Coming Soon |

## 🔍 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | API root |
| GET | `/health` | Health check |
| GET | `/docs` | Swagger UI |
| GET | `/api/factories` | All factories (filterable) |
| GET | `/api/factories/filters` | Distinct filter values |
| GET | `/api/alerts/active?lat=&lon=` | Active disaster alerts |
| GET | `/api/weather/risk?lat=&lon=` | Blister Blight risk |
| GET | `/api/tea-lands` | Tea land polygons |
| GET | `/api/analytics` | Analytics (Phase 2 stub) |

## 🐛 Troubleshooting

### Alerts page shows "No Active Alerts"
Verify `TOMORROWIO_API_KEY` is set in both `backend/.env` and the root `.env`. The backend logs will show the error if the key is missing.

### Database Connection Issues
```bash
docker-compose ps
docker-compose logs database
docker-compose restart database
```

### Frontend Build Errors
```bash
cd frontend
rm -rf .next node_modules
npm install
npm run dev
```

### Backend Dependencies
```bash
docker-compose build backend --no-cache
```

## 📄 License

MIT License

---

**Built with ❤️ for the Ceylon Tea Industry**
