from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from sqlalchemy.sql import func
from geoalchemy2 import Geometry
from database import Base

class TeaLand(Base):
    """
    Tea Land model with geospatial polygon support
    
    This model stores individual tea land parcels with their geographic boundaries
    using PostGIS geometry types for efficient geospatial queries.
    """
    __tablename__ = "tea_lands"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    estate_name = Column(String, nullable=True, index=True)
    
    # Geospatial column - stores polygon geometry
    # SRID 4326 is WGS84 (standard GPS coordinates)
    geometry = Column(Geometry(geometry_type='POLYGON', srid=4326), nullable=False)
    
    # Area in hectares
    area_hectares = Column(Float, nullable=True)
    
    # Tea variety/cultivar
    tea_variety = Column(String, nullable=True)
    
    # Elevation in meters
    elevation_meters = Column(Float, nullable=True)
    
    # Metadata
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<TeaLand(id={self.id}, name='{self.name}', estate='{self.estate_name}')>"


class TeaEstate(Base):
    """
    Tea Estate model representing larger estate boundaries
    
    Estates can contain multiple tea lands and represent the overall
    property ownership and management unit.
    """
    __tablename__ = "tea_estates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True, index=True)
    
    # Estate boundary as MultiPolygon (can contain multiple parcels)
    geometry = Column(Geometry(geometry_type='MULTIPOLYGON', srid=4326), nullable=False)
    
    # Owner information
    owner_name = Column(String, nullable=True)
    registration_number = Column(String, nullable=True, unique=True)
    
    # Total area in hectares
    total_area_hectares = Column(Float, nullable=True)
    
    # Location information
    district = Column(String, nullable=True, index=True)
    province = Column(String, nullable=True, index=True)
    
    # Contact information
    contact_email = Column(String, nullable=True)
    contact_phone = Column(String, nullable=True)
    
    # Metadata
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<TeaEstate(id={self.id}, name='{self.name}', district='{self.district}')>"


# Example of a model for production/yield tracking
class ProductionRecord(Base):
    """
    Production records for tea harvests
    
    Tracks tea production metrics over time for analytics and forecasting.
    """
    __tablename__ = "production_records"

    id = Column(Integer, primary_key=True, index=True)
    tea_land_id = Column(Integer, nullable=False, index=True)  # Foreign key to TeaLand
    
    # Production data
    harvest_date = Column(DateTime(timezone=True), nullable=False, index=True)
    quantity_kg = Column(Float, nullable=False)
    quality_grade = Column(String, nullable=True)
    
    # Weather conditions
    rainfall_mm = Column(Float, nullable=True)
    avg_temperature_c = Column(Float, nullable=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    def __repr__(self):
        return f"<ProductionRecord(id={self.id}, land_id={self.tea_land_id}, date='{self.harvest_date}')>"
