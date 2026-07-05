"""
Analytics API Router for Ceylon Tea Intelligence Platform.
Stub implementation — full analytics engine coming in Phase 2.
"""

from fastapi import APIRouter
from typing import List, Dict, Any

router = APIRouter()


@router.get("")
async def analytics_overview() -> Dict[str, Any]:
    """
    Overview analytics endpoint.
    Returns placeholder data until the full analytics engine (Phase 2) is implemented.
    """
    return {
        "status": "coming_soon",
        "message": "Full analytics engine is planned for Phase 2 — see frontend/Phse2_spec.md",
        "available_endpoints": [
            "/api/analytics/yield-trends   - Production trend data (Phase 2)",
            "/api/analytics/climate-impact - Weather vs harvest correlation (Phase 2)",
            "/api/analytics/disease-risk   - Blister Blight risk scores (Phase 2)",
        ]
    }


@router.get("/yield-trends")
async def yield_trends() -> Dict[str, Any]:
    """Placeholder: Yield trend analytics per district / elevation band."""
    return {
        "status": "coming_soon",
        "data": [],
        "note": "Yield trend analytics will be implemented in Phase 2."
    }


@router.get("/climate-impact")
async def climate_impact() -> Dict[str, Any]:
    """Placeholder: Correlate climate data with production volumes."""
    return {
        "status": "coming_soon",
        "data": [],
        "note": "Climate impact analysis will be implemented in Phase 2."
    }


@router.get("/disease-risk")
async def disease_risk(lat: float = 6.9497, lon: float = 80.7891) -> Dict[str, Any]:
    """Placeholder: Blister Blight risk score for a given location."""
    return {
        "status": "coming_soon",
        "risk_level": "UNKNOWN",
        "advice": "Disease risk scoring (Blister Blight) will be available in Phase 2.",
        "coordinates": {"lat": lat, "lon": lon}
    }
