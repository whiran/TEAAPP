"""
Weather Service for Ceylon Tea Intelligence Platform.
Integrates with Meteosource API for forecast data and calculates Blister Blight risk.
"""

import httpx
from typing import Literal, Optional
from datetime import datetime
from pydantic import BaseModel

from config import settings


# Pydantic Models
class RiskAssessment(BaseModel):
    """Risk assessment result for Blister Blight disease."""
    risk_level: Literal["HIGH", "MODERATE", "LOW"]
    details: str
    consecutive_risk_days: int
    forecast_summary: list[dict]


class DayForecast(BaseModel):
    """Simplified daily forecast data."""
    date: str
    temperature: float
    humidity: float
    weather_icon: str
    is_risk_day: bool


# Meteosource API Client
async def fetch_forecast(lat: float, lon: float) -> dict:
    """
    Fetch 7-day weather forecast from Meteosource Point API.
    
    Args:
        lat: Latitude coordinate
        lon: Longitude coordinate
        
    Returns:
        Raw JSON response from Meteosource API
    """
    url = "https://www.meteosource.com/api/v1/free/point"
    params = {
        "lat": lat,
        "lon": lon,
        "sections": "daily",
        "units": "metric",
        "key": settings.METEOSOURCE_API_KEY
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        return response.json()


def get_weather_icon(summary: str) -> str:
    """Map weather summary to icon."""
    summary_lower = summary.lower() if summary else ""
    if "rain" in summary_lower or "shower" in summary_lower:
        return "🌧️"
    elif "cloud" in summary_lower:
        return "☁️"
    elif "sun" in summary_lower or "clear" in summary_lower:
        return "☀️"
    elif "storm" in summary_lower or "thunder" in summary_lower:
        return "⛈️"
    elif "fog" in summary_lower or "mist" in summary_lower:
        return "🌫️"
    else:
        return "🌤️"


def calculate_blister_blight_risk(daily_data: list) -> RiskAssessment:
    """
    Calculate Blister Blight disease risk based on weather conditions.
    
    Algorithm:
    - HIGH risk: humidity > 90% AND temperature < 25°C for 3+ consecutive days
    - MODERATE risk: humidity > 85% AND temperature < 27°C for 2+ consecutive days
    - LOW risk: Otherwise
    
    Args:
        daily_data: List of daily forecast data from Meteosource
        
    Returns:
        RiskAssessment with risk level, details, and forecast summary
    """
    forecast_summary = []
    risk_days = []
    current_streak = 0
    max_streak = 0
    streak_start_date = None
    streak_end_date = None
    
    for day in daily_data[:7]:  # Analyze 7 days
        day_date = day.get("day", "Unknown")
        all_day = day.get("all_day", {})
        
        # Extract weather data
        temperature = all_day.get("temperature", 30)
        humidity = all_day.get("humidity", 50)
        summary = day.get("summary", "")
        
        # Check if day meets risk conditions
        is_risk_day = humidity > 90 and temperature < 25
        
        # Track consecutive risk days
        if is_risk_day:
            current_streak += 1
            if current_streak == 1:
                streak_start_date = day_date
            streak_end_date = day_date
            if current_streak > max_streak:
                max_streak = current_streak
        else:
            current_streak = 0
        
        risk_days.append(is_risk_day)
        
        forecast_summary.append({
            "date": day_date,
            "temperature": temperature,
            "humidity": humidity,
            "weather_icon": get_weather_icon(summary),
            "is_risk_day": is_risk_day
        })
    
    # Determine risk level
    if max_streak >= 3:
        risk_level = "HIGH"
        details = f"⚠️ High Blister Blight risk detected from {streak_start_date} to {streak_end_date}. Deploy fungicide immediately. Conditions: {max_streak} consecutive days with humidity >90% and temp <25°C."
    elif max_streak >= 2:
        risk_level = "MODERATE"
        details = f"⚡ Moderate disease risk. Monitor closely from {streak_start_date} to {streak_end_date}. Prepare preventive measures."
    else:
        risk_level = "LOW"
        details = "✅ Low disease risk. Weather conditions are favorable for crop health."
    
    return RiskAssessment(
        risk_level=risk_level,
        details=details,
        consecutive_risk_days=max_streak,
        forecast_summary=forecast_summary[:3]  # Return only 3-day summary for UI
    )


async def get_weather_risk(lat: float, lon: float) -> RiskAssessment:
    """
    Main function to get weather risk assessment for a location.
    
    Args:
        lat: Latitude coordinate
        lon: Longitude coordinate
        
    Returns:
        RiskAssessment with complete analysis
    """
    try:
        forecast_data = await fetch_forecast(lat, lon)
        daily_data = forecast_data.get("daily", {}).get("data", [])
        
        if not daily_data:
            return RiskAssessment(
                risk_level="LOW",
                details="Unable to fetch forecast data. Please try again later.",
                consecutive_risk_days=0,
                forecast_summary=[]
            )
        
        return calculate_blister_blight_risk(daily_data)
        
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
