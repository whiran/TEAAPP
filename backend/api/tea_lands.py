from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List

router = APIRouter()

# In-memory storage for demo purposes (replace with DB later)
estate_storage = []

class TeaEstateCreate(BaseModel):
    name: str = "New Estate"
    geometry: Dict[str, Any]
    area_hectares: float
    properties: Dict[str, Any] = {}

@router.post("/estates")
async def create_estate(estate: TeaEstateCreate):
    """
    Save a new Tea Estate geometry.
    In a real app, this would save to PostGIS.
    """
    print(f"🌿 Received new estate: {estate.name} ({estate.area_hectares} ha)")
    
    # Simulate saving to DB
    new_id = len(estate_storage) + 1
    stored_estate = {
        "id": new_id,
        "name": estate.name,
        "geometry": estate.geometry,
        "area": estate.area_hectares,
        "properties": estate.properties
    }
    estate_storage.append(stored_estate)
    
    return {
        "status": "success",
        "message": "Estate saved successfully",
        "data": stored_estate
    }

@router.get("/estates")
async def get_estates():
    """Get all saved estates"""
    return estate_storage
