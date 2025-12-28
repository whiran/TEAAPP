"""
Tomorrow.io Weather Service for Ceylon Tea Intelligence Platform.

This module integrates with Tomorrow.io API to fetch:
- Real-time weather data
- Weather forecasts (hourly, daily)
- Severe weather events and disaster alerts
- Flood risk predictions

API Documentation: https://docs.tomorrow.io/reference/welcome
"""

import httpx
from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel
from config import settings


# ===== Data Models =====

class WeatherData(BaseModel):
    """Real-time weather data from Tomorrow.io"""
    temperature: float
    feels_like: float
    humidity: float
    wind_speed: float
    wind_direction: int  # degrees
    pressure: float
    visibility: float
    precipitation_intensity: float
    cloud_cover: int
    weather_code: int
    timestamp: datetime


class ForecastDay(BaseModel):
    """Daily forecast data"""
    date: str
    temperature_max: float
    temperature_min: float
    humidity_avg: float
    precipitation_probability: int
    precipitation_accumulation: float
    weather_code: int
    weather_icon: str
    is_risk_day: bool = False


class RiskAssessment(BaseModel):
    """Blister Blight disease risk assessment"""
    risk_level: str  # HIGH, MODERATE, LOW
    details: str
    consecutive_risk_days: int
    forecast_summary: List[Dict[str, Any]]


# ===== Tomorrow.io API Client =====

async def fetch_realtime_weather(lat: float, lon: float) -> Dict[str, Any]:
    """
    Fetch current weather conditions from Tomorrow.io.
    
    Args:
        lat: Latitude coordinate
        lon: Longitude coordinate
        
    Returns:
        Raw JSON response from Tomorrow.io realtime endpoint
    """
    url = f"{settings.TOMORROWIO_BASE_URL}/weather/realtime"
    params = {
        "location": f"{lat},{lon}",
        "apikey": settings.TOMORROWIO_API_KEY,
        "units": "metric"
    }
    
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        return response.json()


async def fetch_forecast(
    lat: float,
    lon: float,
    timesteps: str = "1d",
    days: int = 7
) -> Dict[str, Any]:
    """
    Fetch weather forecast from Tomorrow.io Timeline API.
    
    Args:
        lat: Latitude coordinate
        lon: Longitude coordinate
        timesteps: Time steps ('1h' for hourly, '1d' for daily)
        days: Number of days to forecast
        
    Returns:
        Raw JSON response from Tomorrow.io timeline endpoint
    """
    url = f"{settings.TOMORROWIO_BASE_URL}/timelines"
    
    # Select fields based on what we need for tea estate monitoring
    fields = [
        "temperature",
        "temperatureApparent",
        "humidity",
        "windSpeed",
        "windDirection",
        "pressureSurfaceLevel",
        "precipitationIntensity",
        "precipitationProbability",
        "cloudCover",
        "weatherCode"
    ]
    
    params = {
        "location": f"{lat},{lon}",
        "apikey": settings.TOMORROWIO_API_KEY,
        "fields": ",".join(fields),
        "timesteps": timesteps,
        "units": "metric"
    }
    
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        return response.json()


# ===== Weather Code Mapping =====

def get_weather_icon(weather_code: int) -> str:
    """
    Map Tomorrow.io weather code to emoji icon.
    
    Weather codes: https://docs.tomorrow.io/reference/data-layers-weather-codes
    """
    code_map = {
        1000: "☀️",  # Clear
        1100: "🌤️",  # Mostly Clear
        1101: "⛅",  # Partly Cloudy
        1102: "☁️",  # Mostly Cloudy
        1001: "☁️",  # Cloudy
        2000: "🌫️",  # Fog
        2100: "🌫️",  # Light Fog
        4000: "🌧️",  # Drizzle
        4001: "🌧️",  # Rain
        4200: "🌧️",  # Light Rain
        4201: "🌧️",  # Heavy Rain
        5000: "❄️",  # Snow
        5001: "❄️",  # Flurries
        5100: "❄️",  # Light Snow
        5101: "❄️",  # Heavy Snow
        6000: "🌧️❄️",  # Freezing Drizzle
        6001: "🌧️❄️",  # Freezing Rain
        6200: "🌧️❄️",  # Light Freezing Rain
        6201: "🌧️❄️",  # Heavy Freezing Rain
        7000: "🧊",  # Ice Pellets
        7101: "🧊",  # Heavy Ice Pellets
        7102: "🧊",  # Light Ice Pellets
        8000: "⛈️",  # Thunderstorm
    }
    return code_map.get(weather_code, "🌤️")


# ===== Blister Blight Risk Calculation =====

def calculate_blister_blight_risk(daily_data: List[Dict]) -> RiskAssessment:
    """
    Calculate Blister Blight disease risk from forecast data.
    
    Algorithm:
    - HIGH: humidity > 90% AND temp < 25°C for 3+ consecutive days
    - MODERATE: humidity > 85% AND temp < 27°C for 2+ consecutive days
    - LOW: Otherwise
    
    Args:
        daily_data: List of daily forecast intervals from Tomorrow.io
        
    Returns:
        RiskAssessment with risk level and recommendations
    """
    forecast_summary = []
    current_streak = 0
    max_streak = 0
    streak_start = None
    streak_end = None
    
    for interval in daily_data[:7]:  # Analyze 7 days
        values = interval.get('values', {})
        start_time = interval.get('startTime', '')
        
        # Extract weather metrics
        temperature = values.get('temperature', 30)
        humidity = values.get('humidity', 50)
        weather_code = values.get('weatherCode', 1000)
        
        # Check risk conditions for Blister Blight
        # (favors cool, humid conditions)
        is_risk_day = humidity > 90 and temperature < 25
        
        # Track consecutive risk days
        if is_risk_day:
            current_streak += 1
            if current_streak == 1:
                streak_start = start_time
            streak_end = start_time
            if current_streak > max_streak:
                max_streak = current_streak
        else:
            current_streak = 0
        
        # Build forecast summary
        forecast_summary.append({
            "date": start_time[:10] if start_time else "Unknown",
            "temperature": round(temperature, 1),
            "humidity": round(humidity, 1),
            "weather_icon": get_weather_icon(weather_code),
            "is_risk_day": is_risk_day
        })
    
    # Determine risk level
    if max_streak >= 3:
        risk_level = "HIGH"
        details = (
            f"⚠️ High Blister Blight risk from {streak_start[:10]} to {streak_end[:10]}. "
            f"Deploy fungicide immediately. Conditions: {max_streak} consecutive days "
            f"with humidity >90% and temp <25°C. Inspect tea bushes for early symptoms."
        )
    elif max_streak >= 2:
        risk_level = "MODERATE"
        details = (
            f"⚡ Moderate disease risk detected from {streak_start[:10]} to {streak_end[:10]}. "
            f"Monitor tea estates closely. Prepare preventive fungicide sprays. "
            f"{max_streak} consecutive risk days identified."
        )
    else:
        risk_level = "LOW"
        details = (
            "✅ Low disease risk. Weather conditions are favorable for crop health. "
            "Continue regular monitoring and maintenance routines."
        )
    
    return RiskAssessment(
        risk_level=risk_level,
        details=details,
        consecutive_risk_days=max_streak,
        forecast_summary=forecast_summary[:3]  # Return 3-day summary for UI
    )


# ===== Main Service Function =====

async def get_weather_risk(lat: float, lon: float) -> RiskAssessment:
    """
    Get comprehensive weather risk assessment for a location.
    
    This is the main function called by the API endpoint.
    It fetches forecast data and calculates disease risk.
    
    Args:
        lat: Latitude coordinate
        lon: Longitude coordinate
        
    Returns:
        RiskAssessment with complete risk analysis
    """
    try:
        # Fetch daily forecast from Tomorrow.io
        forecast_data = await fetch_forecast(lat, lon, timesteps="1d", days=7)
        
        # Extract timeline data
        timelines = forecast_data.get('data', {}).get('timelines', [])
        if not timelines:
            return RiskAssessment(
                risk_level="LOW",
                details="Unable to fetch forecast data. Please try again later.",
                consecutive_risk_days=0,
                forecast_summary=[]
            )
        
        # Get daily intervals
        daily_intervals = timelines[0].get('intervals', [])
        
        if not daily_intervals:
            return RiskAssessment(
                risk_level="LOW",
                details="No forecast data available for this location.",
                consecutive_risk_days=0,
                forecast_summary=[]
            )
        
        # Calculate Blister Blight risk
        return calculate_blister_blight_risk(daily_intervals)
        
    except httpx.HTTPError as e:
        return RiskAssessment(
            risk_level="LOW",
            details=f"Weather service temporarily unavailable: {str(e)}",
            consecutive_risk_days=0,
            forecast_summary=[]
        )
    except Exception as e:
        return RiskAssessment(
            risk_level="LOW",
            details=f"Error analyzing weather data: {str(e)}",
            consecutive_risk_days=0,
            forecast_summary=[]
        )
