"""
Database initialization script for Ceylon Tea Intelligence Platform.
Run this to create all database tables.
"""

from database import Base, engine, init_db
from models import TeaLand, TeaEstate, ProductionRecord

def create_tables():
    """Create all database tables"""
    print("📊 Creating database tables...")
    
    # Import all models to ensure they're registered
    # (already imported above)
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    print("✅ Database tables created successfully!")
    print("\nCreated tables:")
    print("  - tea_lands (with PostGIS geometry)")
    print("  - tea_estates (with PostGIS geometry)")
    print("  - production_records")
    
    # Verify PostGIS extension
    from sqlalchemy import text
    with engine.connect() as conn:
        result = conn.execute(text("SELECT PostGIS_version();"))
        version = result.fetchone()
        if version:
            print(f"\n✅ PostGIS version: {version[0]}")
        else:
            print("\n⚠️  Warning: PostGIS extension not found")

if __name__ == "__main__":
    create_tables()
