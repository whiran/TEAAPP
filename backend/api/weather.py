"""
Weather API Router for Ceylon Tea Intelligence Platform.
Provides endpoints for weather forecasts and disease risk assessment.
Uses Tomorrow.io API for real-time weather data.
"""

from fastapi import APIRouter, Query, HTTPException

from services.tomorrowio_service import get_weather_risk, RiskAssessment


router = APIRouter()


@router.get("/risk", response_model=RiskAssessment)
async def get_risk_assessment(
    lat: float = Query(..., description="Latitude coordinate", ge=-90, le=90),
    lon: float = Query(..., description="Longitude coordinate", ge=-180, le=180)
):
    """
    Get Blister Blight disease risk assessment for a location.
    
    Uses Tomorrow.io 7-day forecast to analyze temperature and humidity
    conditions for tea disease prediction.
    
    **Risk Levels:**
    - **HIGH**: humidity > 90% AND temp < 25°C for 3+ consecutive days
    - **MODERATE**: humidity > 85% AND temp < 27°C for 2+ consecutive days  
    - **LOW**: Otherwise
    
    **Returns:** Risk level, detailed advice, and 3-day forecast summary.
    
    **Note:** Data sourced from Tomorrow.io Weather API
    """
    try:
        return await get_weather_risk(lat, lon)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to assess weather risk: {str(e)}"
        )


@router.get("/health")
async def weather_health():
    """Health check for weather service."""
    return {"status": "healthy", "service": "weather-api"}
