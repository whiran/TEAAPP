Phase 2 Technical Specification: The "Agri-Met" Weather Engine
Objective: Implement the dual-layer weather intelligence system combining Windy.com (for visualization) and Meteosource (for agronomic analytics) to predict Blister Blight risk in tea estates.

1. System Architecture
Data Flow
Frontend (Next.js):

Renders a Leaflet map.

Loads windy.com overlay layers (rain, windGusts) directly on the client side.

Fetches "Risk Status" from the backend when an Estate Polygon is selected.

Backend (FastAPI):

Receives lat/lon from the frontend.

Queries Meteosource Point API for a 7-day forecast.

Runs the Blister Blight Risk Algorithm.

Returns a simple JSON: { "risk_level": "HIGH", "advice": "Deploy fungicide immediately." }.

2. Implementation Steps & Antigravity Prompts
Step 2.1: Configuration & Environment
Action: Create the .env file structure to hold sensitive keys.

Prompt for Antigravity:

"Create a .env.example file in the root directory. It must include:

NEXT_PUBLIC_WINDY_API_KEY (For Frontend)

METEOSOURCE_API_KEY (For Backend)

DATABASE_URL (Existing)

Then, create a config.py in the FastAPI backend to load METEOSOURCE_API_KEY using pydantic-settings."

Step 2.2: Visualization Layer (Windy Integration)
Objective: Create a map component that overlays Windy data on top of the tea estate polygons.

Technical Note: Windy API uses strict leaflet versions. We will use the Windy Map Forecast API v4.

Prompt for Antigravity:

"In frontend/components/map, create a new component named WeatherMap.tsx.

Requirements:

Use react-leaflet to render the base map.

Initialize the Windy API using the windyInit function (load the Windy SDK script dynamically in useEffect).

Create a floating control panel (top-right) with a Toggle Switch (shadcn/ui Switch).

Logic:

Toggle ON: Switch layer to rain (Rain Accumulation).

Toggle OFF: Switch layer to wind (Wind Gusts).

Ensure the Windy overlay sits below the Estate Polygons so the user can still click their land."

Step 2.3: Analytical Layer (Meteosource Backend)
Objective: Fetch raw data and calculate disease risk.

Logic for Blister Blight:

Condition: Daily Humidity > 90% AND Daily Temp < 25°C.

Threshold: If this condition is met for 3 consecutive days in the forecast.

Prompt for Antigravity:

"In the backend, create a new service services/weather_service.py.

Task 1: API Client Implement a function fetch_forecast(lat, lon) that calls the Meteosource Point API (https://www.meteosource.com/api/v1/point).

Request parameters: sections=daily, units=metric.

Use httpx for async requests.

Task 2: Risk Algorithm Implement a function calculate_blister_blight_risk(daily_data):

Iterate through the next 7 days of forecast data.

Check if humidity > 90 AND temperature < 25 for 3 consecutive days.

Return a Pydantic model:

Python
class RiskAssessment(BaseModel):
    risk_level: Literal
    details: str # e.g., "High risk detected from Tuesday to Thursday"
Task 3: Endpoint Create a GET endpoint /weather/risk that accepts lat and lon, calls the service, and returns the assessment."

Step 2.4: UI Integration (Estate Details)
Objective: Show the alert to the Estate Manager.

Prompt for Antigravity:

"Update the EstateDetails side panel in the frontend.

Use tanstack-query to fetch data from /weather/risk whenever an estate is selected.

Pass the estate's centroid coordinates to the API.

Display a Risk Badge:

If HIGH: Red Badge with 'Blister Blight Alert' + animate a pulse effect.

If LOW: Green Badge with 'Low Disease Risk'.

Show a simple 3-day mini-forecast (icons for Rain/Cloudy) below the badge."

3. Verification Plan (QA)
Once the code is generated, run these tests in Antigravity:

Visual Test: "Open the browser. Toggle the weather layer to 'Rain'. Verify that the colored rain particle animation appears over Sri Lanka."

Logic Test: "Create a unit test for calculate_blister_blight_risk. Mock a forecast response with 3 days of 95% humidity and 20°C temp. Assert that the function returns 'HIGH' risk."

Integration Test: "Click on an estate polygon on the map. Verify that the network request to /weather/risk fires and the side panel updates with a risk badge."

4. API References (For the Agent)
Meteosource Endpoint:

HTTP
GET https://www.meteosource.com/api/v1/point?lat={lat}&lon={lon}&sections=daily&units=metric&key={API_KEY}
Meteosource Response Structure (simplified):

JSON
{
  "daily": {
    "data": [
      {
        "day": "2025-10-25",
        "all_day": {
          "temperature": 22.5,
          "humidity": 92
        }
      }
    ]
  }
}
