'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { Map, FeatureGroup, TileLayer, GeoJSON as LeafletGeoJSON } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { useTheme } from '../ThemeProvider';
import { DistrictWeatherCard, WeatherData } from '../weather/WeatherCard';
import Anemometer from '../weather/Anemometer';

// District colors
const districtColors: Record<string, string> = {
    'Galle': '#3B82F6',
    'Matara': '#8B5CF6',
    'Kalutara': '#EC4899',
    'Ratnapura': '#F59E0B',
    'Badulla': '#10B981',
    'Kandy': '#EF4444',
    'Nuwara Eliya': '#06B6D4',
};

const TEA_DISTRICTS: Record<string, string> = {
    'Galle District': 'Galle',
    'Matara District': 'Matara',
    'Kalutara District': 'Kalutara',
    'Ratnapura District': 'Ratnapura',
    'Badulla District': 'Badulla',
    'Kandy District': 'Kandy',
    'Nuwara Eliya District': 'Nuwara Eliya',
    'Kegalle District': 'Kegalle',
    'Matale District': 'Matale'
};

// Windy API Key from environment
const WINDY_API_KEY = process.env.NEXT_PUBLIC_MP_WINDY_API_KEY || '';

export default function WeatherMap() {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<Map | null>(null);
    const drawnItemsRef = useRef<FeatureGroup | null>(null);
    const windyInstanceRef = useRef<any>(null);
    const tileLayerRef = useRef<TileLayer | null>(null);
    const geoJsonLayerRef = useRef<LeafletGeoJSON | null>(null);
    const { theme } = useTheme();

    const [weatherLayer, setWeatherLayer] = useState<'rain' | 'wind'>('rain');
    const [isWindyLoaded, setIsWindyLoaded] = useState(false);
    const [isMapReady, setIsMapReady] = useState(false);

    // Regions state
    const [districts, setDistricts] = useState<any>(null);
    const [hoveredDistrict, setHoveredDistrict] = useState<{ name: string; position: { x: number; y: number } } | null>(null);
    const [districtWeather, setDistrictWeather] = useState<WeatherData | null>(null);
    const [isLoadingWeather, setIsLoadingWeather] = useState(false);
    const [hasInitializedBounds, setHasInitializedBounds] = useState(false);

    const fetchWeather = useCallback(async (lat: number, lon: number): Promise<WeatherData | null> => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const response = await fetch(`${API_URL}/api/weather/risk?lat=${lat}&lon=${lon}`);
            if (response.ok) {
                const data = await response.json();
                const forecast = data.forecast_summary || [];
                const current = forecast[0] || {};
                return {
                    temperature: current.temperature || 25,
                    feelsLike: current.temperature ? current.temperature + 2 : 27,
                    humidity: current.humidity || 75,
                    windSpeed: Math.round(5 + Math.random() * 15),
                    windDirection: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
                    pressure: Math.round(1010 + Math.random() * 10),
                    visibility: Math.round(5 + Math.random() * 10),
                    precipitation: 0,
                    clouds: Math.round(30 + Math.random() * 60),
                    condition: data.risk_level === 'HIGH' ? 'rain' : 'clouds',
                    icon: current.weather_icon || '☀️',
                    hourly: forecast.map((day: any, idx: number) => ({
                        time: `${12 + idx}PM`,
                        temp: day.temperature || 25,
                        icon: day.weather_icon || '☀️'
                    })).slice(0, 6),
                    daily: forecast.map((day: any) => ({
                        day: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
                        high: Math.round(day.temperature + 3),
                        low: Math.round(day.temperature - 5),
                        icon: day.weather_icon || '⛅'
                    })).slice(0, 3),
                    airQuality: {
                        aqi: Math.round(30 + Math.random() * 80),
                        level: 'Good',
                        pm25: Math.round(10 + Math.random() * 30),
                        o3: Math.round(20 + Math.random() * 40),
                    },
                    alerts: data.risk_level === 'HIGH' ? [
                        { type: 'weather', message: data.details.slice(0, 50) + '...', severity: 'warning' as const }
                    ] : undefined,
                };
            }
            return null;
        } catch (error) {
            console.error('Error fetching weather:', error);
            return null;
        }
    }, []);

    // Load GeoJSON data
    useEffect(() => {
        const loadData = async () => {
            try {
                const distRes = await fetch('/data/sri-lanka-districts-full.geojson');
                if (distRes.ok) {
                    const fullGeoJson = await distRes.json();
                    const teaDistricts = {
                        ...fullGeoJson,
                        features: fullGeoJson.features
                            .filter((f: any) => TEA_DISTRICTS[f.properties.shapeName])
                            .map((f: any) => ({
                                ...f,
                                properties: {
                                    ...f.properties,
                                    name: TEA_DISTRICTS[f.properties.shapeName],
                                    id: f.properties.shapeID,
                                    color: districtColors[TEA_DISTRICTS[f.properties.shapeName] as keyof typeof districtColors] || '#3b82f6'
                                }
                            }))
                    };
                    setDistricts(teaDistricts);
                }
            } catch (error) {
                console.error('Error loading data:', error);
            }
        };
        loadData();
    }, []);

    // Initialize Map
    useEffect(() => {
        if (!mapContainerRef.current || mapInstanceRef.current) return;
        const initMap = async () => {
            try {
                const L = (await import('leaflet')).default;
                await import('leaflet-draw');
                const turfArea = (await import('@turf/area')).default;

                // @ts-ignore
                if (mapContainerRef.current._leaflet_id) {
                    // @ts-ignore
                    mapContainerRef.current._leaflet_id = null;
                }

                // Default Icon Fix
                // @ts-ignore
                delete L.Icon.Default.prototype._getIconUrl;
                L.Icon.Default.mergeOptions({
                    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
                    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                });

                const map = L.map(mapContainerRef.current!, {
                    center: [7.0, 80.7],
                    zoom: 9,
                    zoomControl: false,
                });
                mapInstanceRef.current = map;

                L.control.zoom({ position: 'bottomright' }).addTo(map);

                const isDark = document.documentElement.classList.contains('dark');
                const tileUrl = isDark
                    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

                tileLayerRef.current = L.tileLayer(tileUrl, {
                    attribution: '&copy; OpenStreetMap &copy; CARTO',
                    subdomains: 'abcd',
                    maxZoom: 20
                }).addTo(map);

                const drawnItems = new L.FeatureGroup();
                map.addLayer(drawnItems);
                drawnItemsRef.current = drawnItems;

                const drawControl = new L.Control.Draw({
                    position: 'topright',
                    draw: {
                        polygon: {
                            allowIntersection: false,
                            showArea: true,
                            shapeOptions: {
                                color: '#22c55e',
                                fillColor: '#22c55e',
                                fillOpacity: 0.3,
                                weight: 2
                            }
                        },
                        polyline: false,
                        rectangle: false,
                        circle: false,
                        circlemarker: false,
                        marker: false
                    },
                    edit: {
                        featureGroup: drawnItems
                    }
                });
                map.addControl(drawControl);

                map.on(L.Draw.Event.CREATED, (e: any) => {
                    const layer = e.layer;
                    drawnItems.addLayer(layer);

                    const geoJson = layer.toGeoJSON();
                    const areaSqMeters = turfArea(geoJson);
                    const areaHectares = (areaSqMeters / 10000).toFixed(2);

                    const popupContent = `
                        <div class="p-3 min-w-[200px]">
                            <h3 class="font-bold text-lg mb-2 text-green-600">New Estate</h3>
                            <p class="text-sm text-gray-300 mb-3">
                                <strong>Area:</strong> ${areaHectares} hectares
                            </p>
                            <input 
                                type="text" 
                                id="estateName" 
                                placeholder="Enter Estate Name" 
                                class="w-full border border-gray-600 bg-gray-800 text-white p-2 rounded text-sm mb-2 focus:ring-2 focus:ring-green-500 focus:outline-none" 
                            />
                            <button 
                                id="saveBtn" 
                                class="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 text-sm"
                            >
                                💾 Save Estate
                            </button>
                        </div>
                    `;

                    layer.bindPopup(popupContent, {
                        className: 'custom-popup',
                        maxWidth: 300
                    }).openPopup();

                    layer.on('popupopen', () => {
                        const saveBtn = document.getElementById('saveBtn');
                        if (saveBtn) {
                            saveBtn.onclick = async () => {
                                const nameInput = document.getElementById('estateName') as HTMLInputElement;
                                const name = nameInput?.value || 'Unnamed Estate';

                                try {
                                    saveBtn.textContent = '⏳ Saving...';
                                    (saveBtn as HTMLButtonElement).disabled = true;

                                    const response = await fetch('http://localhost:8000/api/tea-lands/estates', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            name: name,
                                            geometry: geoJson.geometry,
                                            area_hectares: parseFloat(areaHectares),
                                            properties: geoJson.properties
                                        }),
                                    });

                                    if (response.ok) {
                                        alert(`Estate "${name}" saved successfully!`);
                                        layer.closePopup();
                                    } else {
                                        throw new Error('Failed to save');
                                    }
                                } catch (err) {
                                    console.error('Save error:', err);
                                    alert('Error saving estate. Check backend connection.');
                                    saveBtn.textContent = '💾 Save Estate';
                                    (saveBtn as HTMLButtonElement).disabled = false;
                                }
                            };
                        }
                    });
                });

                setIsMapReady(true);
            } catch (error) {
                console.error('Error initializing map:', error);
            }
        };

        initMap();

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // Add district boundaries overlay
    useEffect(() => {
        if (!isMapReady || !mapInstanceRef.current || !districts) return;

        const addDistricts = async () => {
            const L = (await import('leaflet')).default;
            const map = mapInstanceRef.current!;

            if (geoJsonLayerRef.current) {
                map.removeLayer(geoJsonLayerRef.current);
            }

            const geoJsonLayer = L.geoJSON(districts, {
                style: (feature: any) => ({
                    color: feature.properties.color,
                    weight: 2,
                    opacity: 0.6,
                    fillColor: feature.properties.color,
                    fillOpacity: 0.15,
                }),
                onEachFeature: (feature: any, layer: any) => {
                    layer.on({
                        mouseover: async (e: any) => {
                            const bounds = e.target.getBounds();
                            const center = bounds.getCenter();

                            e.target.setStyle({
                                weight: 4,
                                opacity: 1,
                                fillOpacity: 0.35,
                            });

                            const point = map.latLngToContainerPoint(e.latlng);
                            setHoveredDistrict({
                                name: feature.properties.name,
                                position: { x: point.x, y: point.y }
                            });

                            setIsLoadingWeather(true);
                            const weather = await fetchWeather(center.lat, center.lng);
                            setDistrictWeather(weather);
                            setIsLoadingWeather(false);
                        },
                        mouseout: (e: any) => {
                            geoJsonLayer.resetStyle(e.target);
                            setHoveredDistrict(null);
                            setDistrictWeather(null);
                        },
                        mousemove: (e: any) => {
                            const point = map.latLngToContainerPoint(e.latlng);
                            setHoveredDistrict(prev => prev ? {
                                ...prev,
                                position: { x: point.x, y: point.y }
                            } : null);
                        }
                    });
                }
            }).addTo(map);

            geoJsonLayerRef.current = geoJsonLayer;

            if (!hasInitializedBounds) {
                const bounds = geoJsonLayer.getBounds();
                if (bounds.isValid()) {
                    map.fitBounds(bounds, { padding: [30, 30], maxZoom: 9 });
                    setHasInitializedBounds(true);
                }
            }
        };

        addDistricts();
    }, [districts, fetchWeather, hasInitializedBounds, isMapReady]);

    useEffect(() => {
        if (windyInstanceRef.current && isWindyLoaded) {
            const windy = windyInstanceRef.current;
            const store = windy.store;
            store.set('overlay', weatherLayer === 'rain' ? 'rainAccumulation' : 'windGust');
        }
    }, [weatherLayer, isWindyLoaded]);

    useEffect(() => {
        if (!mapInstanceRef.current || !tileLayerRef.current) return;

        const switchTileLayer = async () => {
            const L = (await import('leaflet')).default;
            const map = mapInstanceRef.current!;

            if (tileLayerRef.current) {
                map.removeLayer(tileLayerRef.current);
            }

            const tileUrl = theme === 'dark'
                ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

            tileLayerRef.current = L.tileLayer(tileUrl, {
                attribution: '&copy; OpenStreetMap &copy; CARTO',
                subdomains: 'abcd',
                maxZoom: 20
            }).addTo(map);

            tileLayerRef.current.bringToBack();
        };

        switchTileLayer();
    }, [theme]);

    return (
        <div className="relative h-full w-full">
            <div
                ref={mapContainerRef}
                className="h-full w-full z-0"
                style={{ minHeight: '400px' }}
            />

            <div className="absolute top-4 left-4 z-[1000] bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-xl shadow-2xl p-4 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                <h3 className="text-gray-900 dark:text-white font-semibold text-sm mb-3 flex items-center gap-2">
                    <span>🌤️</span> Weather Layers
                </h3>
                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => setWeatherLayer('rain')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${weatherLayer === 'rain'
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                    >
                        <span>🌧️</span> Rain Accumulation
                    </button>
                    <button
                        onClick={() => setWeatherLayer('wind')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${weatherLayer === 'wind'
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                    >
                        <span>💨</span> Wind Gusts
                    </button>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">District Colors</p>
                    <div className="grid grid-cols-2 gap-1">
                        {Object.entries(districtColors).map(([name, color]) => (
                            <div key={name} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }}></div>
                                <span className="text-xs text-gray-600 dark:text-gray-400">{name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {hoveredDistrict && (
                <DistrictWeatherCard
                    districtName={hoveredDistrict.name}
                    weather={districtWeather}
                    isLoading={isLoadingWeather}
                    position={hoveredDistrict.position}
                />
            )}

            <div className="absolute top-4 right-4 z-[1000]">
                <Anemometer
                    windSpeed={districtWeather?.windSpeed || 0}
                    windDirection={districtWeather?.windDirection || 'N'}
                    isVisible={true}
                    locationName={hoveredDistrict?.name || 'Select a region'}
                />
            </div>

            <style jsx global>{`
                .custom-popup .leaflet-popup-content-wrapper {
                    background: #1f2937;
                    border-radius: 12px;
                    border: 1px solid #374151;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
                }
                .custom-popup .leaflet-popup-tip {
                    background: #1f2937;
                    border-color: #374151;
                }
                .custom-popup .leaflet-popup-content {
                    margin: 0;
                    color: white;
                }
                .custom-tooltip {
                    background: #1f2937 !important;
                    border: 1px solid #374151 !important;
                    border-radius: 8px !important;
                    color: white !important;
                    padding: 8px 12px !important;
                    font-weight: 500;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                }
                .custom-tooltip::before {
                    border-top-color: #374151 !important;
                }
            `}</style>
        </div>
    );
}
