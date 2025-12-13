from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

# Import routers (add as you create them)
# from api import tea_lands, analytics

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle management for startup and shutdown events"""
    # Startup
    print("🚀 Ceylon Tea Intelligence Platform API starting...")
    print(f"📊 Database URL: {os.getenv('DATABASE_URL', 'Not configured')}")
    yield
    # Shutdown
    print("👋 Shutting down API...")

app = FastAPI(
    title="Ceylon Tea Intelligence Platform API",
    description="Geospatial intelligence and analytics API for Ceylon tea estates",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS Configuration
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://frontend:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/")
async def root():
    """API root endpoint"""
    return {
        "message": "Welcome to Ceylon Tea Intelligence Platform API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for Docker healthcheck"""
    return {
        "status": "healthy",
        "service": "ceylon-tea-backend"
    }

# Include routers (add as you create them)
# app.include_router(tea_lands.router, prefix="/api/tea-lands", tags=["Tea Lands"])
# app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
