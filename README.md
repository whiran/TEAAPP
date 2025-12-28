# Ceylon Tea Intelligence Platform 🍵

A production-ready geospatial intelligence platform for Ceylon tea estates, featuring interactive mapping, data analysis, and real-time insights.

## 🏗️ Architecture

This is a **monorepo** containing:
- **Frontend**: Next.js 15 with App Router, Tailwind CSS, Shadcn UI, and Leaflet.js
- **Backend**: Python FastAPI with geospatial capabilities (geopandas, PostGIS)
- **Database**: PostgreSQL 16 with PostGIS extension for geospatial queries

## 📋 Prerequisites

- **Docker** (v20.10+)
- **Docker Compose** (v2.0+)
- **Git**
- **Node.js** (v20+) - for local frontend development
- **Python** (v3.11+) - for local backend development

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd TEAAPP
```

### 2. Start All Services

```bash
# Build and start all services (frontend, backend, database)
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Database**: localhost:5432 (credentials in docker-compose.yml)

### 4. Stop Services

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

# Run development server (outside Docker)
npm run dev

# Build for production
npm run build

# Install Shadcn UI components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
# ... add more components as needed
```

### Backend Development (FastAPI)

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run development server (outside Docker)
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Database Management

```bash
# Access PostgreSQL container
docker exec -it ceylon-tea-db psql -U tea_admin -d ceylon_tea_db

# Verify PostGIS extension
SELECT PostGIS_version();

# Create tables (example)
docker exec -it ceylon-tea-backend python -c "from database import engine, Base; Base.metadata.create_all(bind=engine)"
```

## 📁 Project Structure

```
TEAAPP/
├── frontend/                   # Next.js 15 Application
│   ├── app/                   # App Router pages
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # React components
│   │   └── ui/                # Shadcn UI components
│   ├── public/                # Static assets
│   ├── styles/                # Global styles
│   ├── Dockerfile             # Frontend container
│   ├── package.json           # Dependencies
│   ├── tailwind.config.ts     # Tailwind configuration
│   ├── components.json        # Shadcn UI config
│   └── next.config.js         # Next.js configuration
│
├── backend/                    # FastAPI Application
│   ├── api/                   # API routes
│   │   └── __init__.py
│   ├── models/                # Database models
│   │   └── __init__.py
│   ├── main.py                # FastAPI entry point
│   ├── database.py            # Database connection
│   ├── requirements.txt       # Python dependencies
│   └── Dockerfile             # Backend container
│
├── docker-compose.yml          # Service orchestration
├── .gitignore                  # Git ignore rules
└── README.md                   # This file
```

## 🔧 Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (.env)
```env
DATABASE_URL=postgresql://tea_admin:tea_secure_pass_2024@database:5432/ceylon_tea_db
```

## 🗺️ Key Features

### Geospatial Capabilities
- **PostGIS**: Advanced geospatial queries for tea land polygons
- **geopandas**: Python library for geospatial data manipulation
- **Leaflet.js**: Interactive maps with layer controls

### Tech Stack Details

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 15 | React framework with App Router |
| UI Framework | Tailwind CSS | Utility-first CSS |
| UI Components | Shadcn UI | Accessible component library |
| Maps | Leaflet.js | Interactive mapping |
| Backend | FastAPI | High-performance Python API |
| Database | PostgreSQL 16 | Relational database |
| GIS Extension | PostGIS 3.4 | Geospatial operations |
| ORM | SQLAlchemy | Database abstraction |
| Geospatial | geopandas | Geospatial data processing |

## 🔍 API Endpoints

- `GET /` - API root
- `GET /health` - Health check endpoint
- `GET /docs` - Interactive API documentation (Swagger UI)
- `GET /redoc` - Alternative API documentation

## 🧪 Testing

```bash
# Frontend tests
cd frontend
npm run test

# Backend tests
cd backend
pytest
```

## 📦 Building for Production

```bash
# Build production images
docker-compose -f docker-compose.yml build

# Run in production mode
docker-compose -f docker-compose.yml up -d
```

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check if database is running
docker-compose ps

# View database logs
docker-compose logs database

# Restart database service
docker-compose restart database
```

### Frontend Build Errors
```bash
# Clear Next.js cache
cd frontend
rm -rf .next node_modules
npm install
```

### Backend Dependencies
```bash
# Rebuild backend container
docker-compose build backend --no-cache
```

## 📄 License

MIT License

## 👥 Contributors

[Your Team Here]

## 🤝 Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

---

**Built with ❤️ for Ceylon Tea Industry**
