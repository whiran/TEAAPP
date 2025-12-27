'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { Map, FeatureGroup } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

interface TeaEstate {
    id: number;
    name: string;
    position: [number, number];
    area: number;
}

interface RiskAssessment {
    risk_level: 'HIGH' | 'MODERATE' | 'LOW';
    details: string;
    consecutive_risk_days: number;
    forecast_summary: Array<{
        date: string;
        temperature: number;
        humidity: number;
        weather_icon: string;
        is_risk_day: boolean;
    }>;
}

// Sample tea estate locations in Sri Lanka
const teaEstates: TeaEstate[] = [
    { id: 1, name: 'Nuwara Eliya Estate', position: [6.9497, 80.7891], area: 150 },
    { id: 2, name: 'Kandy Hills Estate', position: [7.2906, 80.6337], area: 200 },
    { id: 3, name: 'Uva Province Estate', position: [6.7500, 81.0500], area: 180 },
    { id: 4, name: 'Dimbula Estate', position: [7.0500, 80.6000], area: 220 },
    { id: 5, name: 'Ratnapura Estate', position: [6.6828, 80.4014], area: 120 },
];

// Windy API Key from environment
const WINDY_API_KEY = process.env.NEXT_PUBLIC_MP_WINDY_API_KEY || '';

export default function WeatherMap() {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<Map | null>(null);
    const drawnItemsRef = useRef<FeatureGroup | null>(null);
    const windyInstanceRef = useRef<any>(null);

    // State for weather layer toggle
    const [weatherLayer, setWeatherLayer] = useState<'rain' | 'wind'>('rain');
    const [isWindyLoaded, setIsWindyLoaded] = useState(false);
    const [isMapReady, setIsMapReady] = useState(false);

    // State for selected estate and risk
    const [selectedEstate, setSelectedEstate] = useState<TeaEstate | null>(null);
    const [riskData, setRiskData] = useState<RiskAssessment | null>(null);
    const [isLoadingRisk, setIsLoadingRisk] = useState(false);

    // Fetch risk data when estate is selected
    const fetchRiskData = useCallback(async (lat: number, lon: number) => {
        setIsLoadingRisk(true);
        try {
            const response = await fetch(
                `http://localhost:8000/api/weather/risk?lat=${lat}&lon=${lon}`
            );
            if (response.ok) {
                const data = await response.json();
                setRiskData(data);
            }
        } catch (error) {
            console.error('Error fetching risk data:', error);
            setRiskData(null);
        } finally {
            setIsLoadingRisk(false);
        }
    }, []);

    // Handle estate selection
    const handleEstateSelect = useCallback((estate: TeaEstate) => {
        setSelectedEstate(estate);
        fetchRiskData(estate.position[0], estate.position[1]);
    }, [fetchRiskData]);

    // Initialize Leaflet Map
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

                // Initialize Map centered on Sri Lanka
                const map = L.map(mapContainerRef.current!, {
                    center: [7.0, 80.7],
                    zoom: 9,
                    zoomControl: false,
                });
                mapInstanceRef.current = map;

                // Add zoom control to bottom right
                L.control.zoom({ position: 'bottomright' }).addTo(map);

                // Add CartoDB Dark Matter tile layer for modern look
                L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                    subdomains: 'abcd',
                    maxZoom: 20
                }).addTo(map);

                // Initialize FeatureGroup for drawing
                const drawnItems = new L.FeatureGroup();
                map.addLayer(drawnItems);
                drawnItemsRef.current = drawnItems;

                // Add Draw Control
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

                // Handle polygon creation
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

                    // Add event after popup is opened
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

                // Add animated markers for tea estates
                teaEstates.forEach(estate => {
                    // Custom pulsing marker icon
                    const pulseIcon = L.divIcon({
                        className: 'pulse-marker',
                        html: `
                            <div class="relative">
                                <div class="absolute w-8 h-8 bg-green-500 rounded-full animate-ping opacity-30"></div>
                                <div class="relative w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                                    <span class="text-sm">🍵</span>
                                </div>
                            </div>
                        `,
                        iconSize: [32, 32],
                        iconAnchor: [16, 16]
                    });

                    const marker = L.marker(estate.position, { icon: pulseIcon })
                        .addTo(map)
                        .on('click', () => handleEstateSelect(estate));

                    // Hover effect
                    marker.bindTooltip(estate.name, {
                        permanent: false,
                        direction: 'top',
                        className: 'custom-tooltip'
                    });

                    // Estate area circle
                    L.circle(estate.position, {
                        color: '#22c55e',
                        fillColor: '#22c55e',
                        fillOpacity: 0.15,
                        radius: estate.area * 25,
                        weight: 2,
                        dashArray: '5, 10'
                    }).addTo(map);
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
    }, [handleEstateSelect]);

    // Change weather layer when toggle changes
    useEffect(() => {
        if (windyInstanceRef.current && isWindyLoaded) {
            const windy = windyInstanceRef.current;
            const store = windy.store;
            store.set('overlay', weatherLayer === 'rain' ? 'rainAccumulation' : 'windGust');
        }
    }, [weatherLayer, isWindyLoaded]);

    // Close panel handler
    const closePanel = () => {
        setSelectedEstate(null);
        setRiskData(null);
    };

    return (
        <div className="relative h-full w-full">
            {/* Map Container */}
            <div
                ref={mapContainerRef}
                className="h-full w-full z-0"
                style={{ minHeight: '400px' }}
            />

            {/* Weather Layer Toggle Control */}
            <div className="absolute top-4 left-4 z-[1000] bg-gray-900/95 backdrop-blur-md rounded-xl shadow-2xl p-4 border border-gray-700">
                <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                    <span>🌤️</span> Weather Layers
                </h3>
                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => setWeatherLayer('rain')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${weatherLayer === 'rain'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                    >
                        <span>🌧️</span> Rain Accumulation
                    </button>
                    <button
                        onClick={() => setWeatherLayer('wind')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${weatherLayer === 'wind'
                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                    >
                        <span>💨</span> Wind Gusts
                    </button>
                </div>

                {/* Layer Legend */}
                <div className="mt-4 pt-3 border-t border-gray-700">
                    <p className="text-xs text-gray-400 mb-2">Legend</p>
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-2 bg-blue-300 rounded-sm"></div>
                        <div className="w-4 h-2 bg-blue-500 rounded-sm"></div>
                        <div className="w-4 h-2 bg-blue-700 rounded-sm"></div>
                        <div className="w-4 h-2 bg-purple-600 rounded-sm"></div>
                        <div className="w-4 h-2 bg-red-500 rounded-sm"></div>
                        <span className="text-xs text-gray-400 ml-2">Low → High</span>
                    </div>
                </div>
            </div>

            {/* Estate Details Panel */}
            {selectedEstate && (
                <div className="absolute top-4 right-4 z-[1000] w-80 bg-gray-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-700 overflow-hidden animate-slideIn">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-green-600 to-emerald-700 px-4 py-3 flex items-center justify-between">
                        <h3 className="text-white font-bold flex items-center gap-2">
                            <span>🍵</span> {selectedEstate.name}
                        </h3>
                        <button
                            onClick={closePanel}
                            className="text-white/80 hover:text-white transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Estate Info */}
                    <div className="p-4 border-b border-gray-700">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gray-800 rounded-lg p-3">
                                <p className="text-xs text-gray-400">Area</p>
                                <p className="text-lg font-bold text-green-400">{selectedEstate.area} ha</p>
                            </div>
                            <div className="bg-gray-800 rounded-lg p-3">
                                <p className="text-xs text-gray-400">Coordinates</p>
                                <p className="text-sm font-mono text-gray-300">
                                    {selectedEstate.position[0].toFixed(2)}°, {selectedEstate.position[1].toFixed(2)}°
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Risk Assessment */}
                    <div className="p-4">
                        <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                            <span>⚠️</span> Disease Risk Assessment
                        </h4>

                        {isLoadingRisk ? (
                            <div className="flex items-center justify-center py-6">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                            </div>
                        ) : riskData ? (
                            <>
                                {/* Risk Badge */}
                                <div className={`rounded-lg p-4 mb-4 ${riskData.risk_level === 'HIGH'
                                        ? 'bg-red-900/50 border border-red-500 animate-pulse'
                                        : riskData.risk_level === 'MODERATE'
                                            ? 'bg-yellow-900/50 border border-yellow-500'
                                            : 'bg-green-900/50 border border-green-500'
                                    }`}>
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl">
                                            {riskData.risk_level === 'HIGH' ? '🔴' : riskData.risk_level === 'MODERATE' ? '🟡' : '🟢'}
                                        </span>
                                        <div>
                                            <p className={`font-bold text-lg ${riskData.risk_level === 'HIGH'
                                                    ? 'text-red-400'
                                                    : riskData.risk_level === 'MODERATE'
                                                        ? 'text-yellow-400'
                                                        : 'text-green-400'
                                                }`}>
                                                {riskData.risk_level === 'HIGH'
                                                    ? '⚠️ Blister Blight Alert!'
                                                    : riskData.risk_level === 'MODERATE'
                                                        ? '⚡ Moderate Risk'
                                                        : '✅ Low Disease Risk'}
                                            </p>
                                            <p className="text-xs text-gray-300 mt-1">
                                                {riskData.consecutive_risk_days} consecutive risk days detected
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Advice */}
                                <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                                    {riskData.details}
                                </p>

                                {/* 3-Day Forecast */}
                                {riskData.forecast_summary.length > 0 && (
                                    <div>
                                        <h5 className="text-xs text-gray-400 mb-2">3-Day Forecast</h5>
                                        <div className="grid grid-cols-3 gap-2">
                                            {riskData.forecast_summary.map((day, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`rounded-lg p-2 text-center ${day.is_risk_day
                                                            ? 'bg-red-900/30 border border-red-700'
                                                            : 'bg-gray-800'
                                                        }`}
                                                >
                                                    <p className="text-2xl mb-1">{day.weather_icon}</p>
                                                    <p className="text-xs text-gray-400">{day.date.slice(5)}</p>
                                                    <p className="text-sm font-bold text-white">{day.temperature}°C</p>
                                                    <p className="text-xs text-blue-400">{day.humidity}%</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-gray-400 text-sm">Unable to load risk data</p>
                                <button
                                    onClick={() => fetchRiskData(selectedEstate.position[0], selectedEstate.position[1])}
                                    className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
                                >
                                    Retry
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Styles for animations and custom elements */}
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
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                .animate-slideIn {
                    animation: slideIn 0.3s ease-out;
                }
                .pulse-marker {
                    background: transparent !important;
                    border: none !important;
                }
            `}</style>
        </div>
    );
}
