"""
Alerts API Router for Ceylon Tea Intelligence Platform.
Provides endpoints for disaster alerts and severe weather warnings.
"""

from fastapi import APIRouter, Query, HTTPException
from typing import List
from services.alert_service import get_active_alerts, DisasterAlert

router = APIRouter()


@router.get("/active", response_model=List[DisasterAlert])
async def get_alerts(
    lat: float = Query(..., description="Latitude coordinate", ge=-90, le=90),
    lon: float = Query(..., description="Longitude coordinate", ge=-180, le=180)
):
    """
    Get all active disaster alerts for a location.
    
    **Provides alerts for:**
    - Floods (5-day advance prediction)
    - Cyclones/Tropical storms
    - Heavy rain and thunderstorms
    - Landslides (calculated risk)
    - High wind events
    - Extreme temperatures
    
    **Data Sources:**
    - Tomorrow.io Events API (governmental meteorological agencies)
    - Tomorrow.io Flood Risk Index
    - Custom risk algorithms for landslides
    
    **Returns:** List of active alerts with severity, recommendations, and affected areas
    """
    try:
        alerts = await get_active_alerts(lat, lon)
        return alerts
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch alerts: {str(e)}"
        )


@router.get("/health")
async def alerts_health():
    """Health check for alerts service"""
    return {
        "status": "healthy",
        "service": "disaster-alerts",
        "provider": "Tomorrow.io"
    }
