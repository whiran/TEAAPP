"""
Tea Lands API Router for Ceylon Tea Intelligence Platform.
Provides endpoints for managing tea estate boundaries and properties.
Uses PostGIS for geospatial data storage.
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Dict, Any, List
from geoalchemy2.shape import from_shape, to_shape
from shapely.geometry import shape, mapping
import json

from database import get_db
from models import TeaEstate

router = APIRouter()


# Pydantic Models for API
class TeaEstateCreate(BaseModel):
    """Schema for creating a new tea estate"""
    name: str
    geometry: Dict[str, Any]  # GeoJSON geometry
    area_hectares: float
    properties: Dict[str, Any] = {}


class TeaEstateResponse(BaseModel):
    """Schema for tea estate response"""
    id: int
    name: str
    geometry: Dict[str, Any]
    area: float
    
    class Config:
        from_attributes = True


# API Endpoints

@router.post("/estates", response_model=Dict[str, Any])
async def create_estate(
    estate: TeaEstateCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new tea estate with geometry.
    
    - **name**: Estate name
    - **geometry**: GeoJSON geometry (Polygon or MultiPolygon)
    - **area_hectares**: Total area in hectares
    - **properties**: Additional properties (optional)
    
    Returns the created estate with database ID.
    """
    print(f"🌿 Creating new estate: {estate.name} ({estate.area_hectares} ha)")
    
    try:
        # Convert GeoJSON geometry to Shapely geometry
        geom_shape = shape(estate.geometry)
        
        # Validate geometry type
        if geom_shape.geom_type not in ['Polygon', 'MultiPolygon']:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid geometry type: {geom_shape.geom_type}. Must be Polygon or MultiPolygon."
            )
        
        # Create database model
        db_estate = TeaEstate(
            name=estate.name,
            geometry=from_shape(geom_shape, srid=4326),  # WGS84
            total_area_hectares=estate.area_hectares
        )
        
        # Save to database
        db.add(db_estate)
        db.commit()
        db.refresh(db_estate)
        
        print(f"✅ Estate saved with ID: {db_estate.id}")
        
        return {
            "status": "success",
            "message": "Estate saved to database",
            "data": {
                "id": db_estate.id,
                "name": db_estate.name,
                "geometry": estate.geometry,  # Return original GeoJSON
                "area": db_estate.total_area_hectares
            }
        }
    
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating estate: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/estates", response_model=List[Dict[str, Any]])
async def get_estates(db: Session = Depends(get_db)):
    """
    Get all saved tea estates.
    
    Returns list of estates with GeoJSON geometries.
    """
    try:
        estates = db.query(TeaEstate).all()
        
        result = []
        for estate in estates:
            # Convert PostGIS geometry back to GeoJSON
            geom_shape = to_shape(estate.geometry)
            geom_geojson = mapping(geom_shape)
            
            result.append({
                "id": estate.id,
                "name": estate.name,
                "geometry": geom_geojson,
                "area": estate.total_area_hectares,
                "created_at": estate.created_at.isoformat() if estate.created_at else None
            })
        
        print(f"📊 Retrieved {len(result)} estates from database")
        return result
    
    except Exception as e:
        print(f"❌ Error retrieving estates: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/estates/{estate_id}", response_model=Dict[str, Any])
async def get_estate(estate_id: int, db: Session = Depends(get_db)):
    """
    Get a specific tea estate by ID.
    """
    estate = db.query(TeaEstate).filter(TeaEstate.id == estate_id).first()
    
    if not estate:
        raise HTTPException(status_code=404, detail=f"Estate {estate_id} not found")
    
    geom_shape = to_shape(estate.geometry)
    geom_geojson = mapping(geom_shape)
    
    return {
        "id": estate.id,
        "name": estate.name,
        "geometry": geom_geojson,
        "area": estate.total_area_hectares,
        "created_at": estate.created_at.isoformat() if estate.created_at else None
    }


@router.delete("/estates/{estate_id}")
async def delete_estate(estate_id: int, db: Session = Depends(get_db)):
    """
    Delete a tea estate by ID.
    """
    estate = db.query(TeaEstate).filter(TeaEstate.id == estate_id).first()
    
    if not estate:
        raise HTTPException(status_code=404, detail=f"Estate {estate_id} not found")
    
    db.delete(estate)
    db.commit()
    
    return {
        "status": "success",
        "message": f"Estate {estate_id} deleted successfully"
    }


@router.get("/health")
async def tea_lands_health():
    """Health check for tea lands service"""
    return {
        "status": "healthy",
        "service": "tea-lands",
        "database": "PostgreSQL with PostGIS"
    }
