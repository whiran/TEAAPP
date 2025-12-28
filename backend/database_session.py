"""
Database session management for Ceylon Tea Intelligence Platform.
Provides dependency injection for database sessions in FastAPI endpoints.
"""

from sqlalchemy.orm import Session
from database import SessionLocal


def get_db():
    """
    Database session dependency for FastAPI.
    
    Usage in endpoint:
        @router.get("/example")
        async def example(db: Session = Depends(get_db)):
            ...
    
    Yields database session and ensures proper cleanup.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
