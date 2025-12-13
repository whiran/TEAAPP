from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from geoalchemy2 import Geometry
import os

# Database URL from environment variable
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://tea_admin:tea_secure_pass_2024@localhost:5432/ceylon_tea_db"
)

# Create SQLAlchemy engine
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # Enable connection pool "pre-ping" feature
    echo=True  # Set to False in production
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for models
Base = declarative_base()

# Dependency to get database session
def get_db():
    """
    Database session dependency for FastAPI endpoints
    
    Usage:
        @app.get("/endpoint")
        async def endpoint(db: Session = Depends(get_db)):
            # Use db here
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Initialize database (create tables)
def init_db():
    """Initialize database tables"""
    # Import all models here to ensure they are registered
    # from models import TeaLand, TeaEstate
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully")

if __name__ == "__main__":
    init_db()
