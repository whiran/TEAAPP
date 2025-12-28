"""
Disaster Alert Service for Ceylon Tea Intelligence Platform.

Integrates with Tomorrow.io Events API to provide:
- Flood alerts and predictions
- Cyclone/tropical storm warnings  
- Heavy rain notifications
- Landslide risk assessment (custom algorithm)
- Drought monitoring

API Documentation: https://docs.tomorrow.io/reference/events-overview
"""

import httpx
from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from config import settings


# ===== Data Models =====

class DisasterAlert(BaseModel):
    """Disaster alert model"""
    id: str
    type: str  # flood, heavy_rain, landslide, drought, cyclone, wind
    severity: str  # advisory, watch, warning, critical
    title: str
    description: str
    affected_regions: List[str]
    start_time: datetime
    end_time: Optional[datetime]
    coordinates: tuple[float, float]
    radius: float  # km
    source: str  # tomorrowio, custom, governmental
    recommendations: List[str]


# ===== Tomorrow.io Events API =====

async def fetch_tomorrowio_events(
    lat: float,
    lon: float,
    buffer_km: int = 100
) -> Dict[str, Any]:
    """
    Fetch disaster events from Tomorrow.io Events API.
    
    Args:
        lat: Center latitude
        lon: Center longitude
        buffer_km: Radius to search for events (km)
        
    Returns:
        Raw JSON response with active events
    """
    url = f"{settings.TOMORROWIO_BASE_URL}/events"
    params = {
        "apikey": settings.TOMORROWIO_API_KEY,
        "location": f"{lat},{lon}",
        "bufferDistance": buffer_km,
        "insights": "tropical,flood,wind,winter,temperature,other"
    }
    
    async with httpx.AsyncClient(timeout=20.0) as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        return response.json()


async def fetch_flood_risk(lat: float, lon: float) -> Dict[str, Any]:
    """
    Get 5-day flood risk prediction from Tomorrow.io.
    
    Uses Flood Risk Index field from timeline API.
    """
    url = f"{settings.TOMORROWIO_BASE_URL}/timelines"
    params = {
        "apikey": settings.TOMORROWIO_API_KEY,
        "location": f"{lat},{lon}",
        "fields": "floodRiskIndex,precipitationIntensity,precipitationAccumulation",
        "timesteps": "1d",
        "units": "metric"
    }
    
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        return response.json()


# ===== Alert Mapping Functions =====

def map_event_type(tomorrow_insight: str) -> str:
    """Map Tomorrow.io insight type to our disaster types"""
    mapping = {
        'flood': 'flood',
        'tropical': 'cyclone',
        'wind': 'wind',
        'winter': 'temperature',
        'temperature': 'temperature',
        'thunderstorm': 'heavy_rain',
        'other': 'heavy_rain'
    }
    return mapping.get(tomorrow_insight.lower(), 'heavy_rain')


def map_severity(tomorrow_severity: str) -> str:
    """Map Tomorrow.io severity to our classification"""
    mapping = {
        'minor': 'advisory',
        'moderate': 'watch',
        'severe': 'warning',
        'extreme': 'critical'
    }
    return mapping.get(tomorrow_severity.lower(), 'advisory')


def generate_recommendations(alert_type: str, severity: str) -> List[str]:
    """Generate actionable recommendations based on alert type"""
    
    if alert_type == 'flood':
        if severity in ['critical', 'warning']:
            return [
                "Move tea processing equipment to higher ground immediately",
                "Clear all drainage channels and culverts",
                "Harvest mature tea leaves if possible within next 6 hours",
                "Prepare sandbags for estate buildings and storage",
                "Evacuate workers from low-lying areas",
                "Monitor river levels every hour"
            ]
        else:
            return [
                "Check drainage systems are clear",
                "Identify safe evacuation routes",
                "Stock emergency supplies (fuel, food, medical)",
                "Move valuable equipment to elevated storage"
            ]
    
    elif alert_type == 'cyclone':
        if severity in ['critical', 'warning']:
            return [
                "Secure all loose structures and equipment NOW",
                "Emergency harvest of tea if within 12h of storm",
                "Board up windows on estate buildings",
                "Evacuate workers to designated safe zones",
                "Stock 7 days of emergency supplies",
                "Monitor official weather updates every 2 hours"
            ]
        else:
            return [
                "Prepare emergency kits and supplies",
                "Identify cyclone shelter locations",
                "Secure outdoor equipment",
                "Review evacuation procedures with staff"
            ]
    
    elif alert_type == 'heavy_rain':
        return [
            "Delay all field operations during heavy rain",
            "Protect workers from lightning (move indoors)",
            "Cover harvested tea leaves to prevent damage",
            "Check for waterlogging and ponding after storm",
            "Inspect tea bushes for physical damage"
        ]
    
    elif alert_type == 'landslide':
        if severity in ['critical', 'warning']:
            return [
                "EVACUATE workers from slope areas immediately",
                "Stay away from hillside tea estates",
                "Monitor for ground cracks, tilted trees, unusual sounds",
                "Do not attempt to harvest on slopes during/after heavy rain",
                "Contact local authorities for geological assessment"
            ]
        else:
            return [
                "Monitor slope stability indicators",
                "Avoid unnecessary access to steep areas",
                "Report any ground movement to authorities"
            ]
    
    elif alert_type == 'drought':
        return [
            "Increase irrigation frequency immediately",
            "Apply mulch to retain soil moisture",
            "Monitor tea bush stress indicators (leaf curl, yellowing)",
            "Reduce plucking intensity to conserve plant energy",
            "Check irrigation system functionality daily"
        ]
    
    else:
        return ["Monitor weather conditions closely and follow official advisories"]


# ===== Landslide Risk Calculation =====

def calculate_landslide_risk(
    precipitation_mm: float,
    precipitation_3day: float,
    soil_moisture: float = 0.5,
    slope_degrees: float = 20.0  # Default moderate slope
) -> tuple[str, int]:
    """
    Calculate landslide risk from weather data.
    
    Args:
        precipitation_mm: Recent precipitation intensity (mm/hr)
        precipitation_3day: 3-day cumulative precipitation (mm)
        soil_moisture: Soil saturation level (0-1)
        slope_degrees: Land slope in degrees
        
    Returns:
        (severity, risk_score)
    """
    risk_score = 0
    
    # Heavy sustained rainfall
    if precipitation_3day > 200:
        risk_score += 40
    elif precipitation_3day > 100:
        risk_score += 25
    elif precipitation_3day > 50:
        risk_score += 10
    
    # Intense precipitation rate
    if precipitation_mm > 50:
        risk_score += 30
    elif precipitation_mm > 25:
        risk_score += 15
    
    # Saturated soil
    if soil_moisture > 0.8:
        risk_score += 20
    elif soil_moisture > 0.6:
        risk_score += 10
    
    # Steep slopes (tea estates often on hillsides in Sri Lanka)
    if slope_degrees > 30:
        risk_score += 10
    elif slope_degrees > 20:
        risk_score += 5
    
    # Classify severity
    if risk_score >= 70:
        return 'critical', risk_score
    elif risk_score >= 50:
        return 'warning', risk_score
    elif risk_score >= 30:
        return 'watch', risk_score
    else:
        return 'advisory', risk_score


# ===== Main Alert Service =====

async def get_active_alerts(lat: float, lon: float) -> List[DisasterAlert]:
    """
    Get all active disaster alerts for a location.
    
    Combines:
    - Tomorrow.io Events API (official governmental alerts)
    - Custom risk calculations (landslide, flood risk index)
    
    Args:
        lat: Latitude coordinate
        lon: Longitude coordinate  
        
    Returns:
        List of active DisasterAlert objects
    """
    alerts = []
    
    try:
        # Fetch Tomorrow.io events
        events_data = await fetch_tomorrowio_events(lat, lon)
        
        for event in events_data.get('data', {}).get('events', []):
            alert_type = map_event_type(event.get('insight', ''))
            severity = map_severity(event.get('severity', ''))
            
            alert = DisasterAlert(
                id=event.get('eventId', f"evt_{datetime.now().timestamp()}"),
                type=alert_type,
                severity=severity,
                title=event.get('title', 'Weather Alert'),
                description=event.get('description', 'No description available'),
                affected_regions=[event.get('location', {}).get('name', 'Unknown')],
                start_time=datetime.fromisoformat(event.get('startTime', datetime.now().isoformat()).replace('Z', '+00:00')),
                end_time=datetime.fromisoformat(event.get('endTime', '').replace('Z', '+00:00')) if event.get('endTime') else None,
                coordinates=(lat, lon),
                radius=100,  # Default radius
                source='tomorrowio',
                recommendations=generate_recommendations(alert_type, severity)
            )
            alerts.append(alert)
    
    except Exception as e:
        print(f"Error fetching Tomorrow.io events: {e}")
    
    # Add flood risk prediction
    try:
        flood_data = await fetch_flood_risk(lat, lon)
        timelines = flood_data.get('data', {}).get('timelines', [])
        
        if timelines:
            intervals = timelines[0].get('intervals', [])
            # Check if any day has high flood risk
            for interval in intervals[:5]:  # 5-day forecast
                flood_index = interval.get('values', {}).get('floodRiskIndex', 0)
                
                if flood_index > 70:  # High flood risk
                    alert = DisasterAlert(
                        id=f"flood_{datetime.now().timestamp()}",
                        type='flood',
                        severity='warning' if flood_index > 85 else 'watch',
                        title=f"Flood Risk Alert - Index {flood_index}%",
                        description=f"High flood risk predicted. Risk index: {flood_index}/100. Based on precipitation forecasts and hydrologic modeling.",
                        affected_regions=['Local Area'],
                        start_time=datetime.fromisoformat(interval.get('startTime', '').replace('Z', '+00:00')),
                        end_time=None,
                        coordinates=(lat, lon),
                        radius=50,
                        source='tomorrowio',
                        recommendations=generate_recommendations('flood', 'warning' if flood_index > 85 else 'watch')
                    )
                    alerts.append(alert)
                    break  # Only add one flood alert
    
    except Exception as e:
        print(f"Error fetching flood risk: {e}")
    
    return alerts
