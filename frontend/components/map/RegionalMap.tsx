'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { Map, FeatureGroup, GeoJSON as LeafletGeoJSON, Layer, Marker, TileLayer } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { DistrictWeatherCard, TIRegionWeatherCard, WeatherData } from '../weather/WeatherCard';
import { useTheme } from '../ThemeProvider';
import Anemometer from '../weather/Anemometer';
import WeatherAlerts, { WeatherAlert, generateWeatherAlerts } from '../weather/WeatherAlerts';

// Types
interface ATCRegion {
    id: number;
    name: string;
    district: string;
    address: string;
    coordinates: [number, number];
    atcRegion: string;
}

interface TIRegion {
    id: number;
    district: string;
    tiRegion: string;
    address: string;
    coordinates: [number, number];
}

interface DistrictFeature {
    type: string;
    properties: {
        name: string;
        code: string;
        province: string;
        color: string;
    };
    geometry: any;
}

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

export default function RegionalMap() {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<Map | null>(null);
    const geoJsonLayerRef = useRef<LeafletGeoJSON | null>(null);
    const atcMarkersRef = useRef<Marker[]>([]);
    const tiMarkersRef = useRef<Marker[]>([]);
    const tileLayerRef = useRef<TileLayer | null>(null);
    const { theme } = useTheme();

    // State
    const [atcRegions, setAtcRegions] = useState<ATCRegion[]>([]);
    const [tiRegions, setTiRegions] = useState<TIRegion[]>([]);
    const [districts, setDistricts] = useState<any>(null);
    const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
    const [showATC, setShowATC] = useState(true);
    const [showTI, setShowTI] = useState(true);

    // Hover state
    const [hoveredDistrict, setHoveredDistrict] = useState<{ name: string; position: { x: number; y: number } } | null>(null);
    const [hoveredTI, setHoveredTI] = useState<{ region: TIRegion; position: { x: number; y: number } } | null>(null);
    const [districtWeather, setDistrictWeather] = useState<WeatherData | null>(null);
    const [tiWeather, setTiWeather] = useState<WeatherData | null>(null);
    const [isLoadingWeather, setIsLoadingWeather] = useState(false);

    // Selected region for anemometer
    const [selectedRegion, setSelectedRegion] = useState<{ name: string; weather: WeatherData } | null>(null);

    // Weather alerts
    const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);
    const [hasInitializedBounds, setHasInitializedBounds] = useState(false);

    // Unique districts from data
    const uniqueDistricts = Array.from(new Set([...atcRegions.map(a => a.district), ...tiRegions.map(t => t.district)])).sort();

    // Fetch weather data
    const fetchWeather = useCallback(async (lat: number, lon: number): Promise<WeatherData | null> => {
        try {
            const response = await fetch(`http://localhost:8000/api/weather/risk?lat=${lat}&lon=${lon}`);
            if (response.ok) {
                const data = await response.json();

                // Occasionally generate extreme conditions for demo (20% chance)
                const isExtreme = Math.random() < 0.2;
                const extremeType = Math.floor(Math.random() * 4);

                let windSpeed = Math.round(5 + Math.random() * 15);
                let humidity = Math.round(70 + Math.random() * 25);
                let precipitation = Math.round(Math.random() * 5 * 10) / 10;
                let temperature = Math.round(20 + Math.random() * 10);

                if (isExtreme) {
                    switch (extremeType) {
                        case 0: // High wind
                            windSpeed = Math.round(45 + Math.random() * 30);
                            break;
                        case 1: // Heavy rain
                            precipitation = Math.round(60 + Math.random() * 50);
                            break;
                        case 2: // Extreme humidity
                            humidity = Math.round(96 + Math.random() * 3);
                            break;
                        case 3: // Heat wave
                            temperature = Math.round(38 + Math.random() * 5);
                            break;
                    }
                }

                // Transform to WeatherData format
                return {
                    temperature,
                    feelsLike: Math.round(temperature + 2),
                    humidity,
                    windSpeed,
                    windDirection: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
                    pressure: Math.round(1010 + Math.random() * 10),
                    visibility: Math.round(5 + Math.random() * 10),
                    precipitation,
                    clouds: Math.round(30 + Math.random() * 60),
                    condition: ['clear', 'clouds', 'rain', 'drizzle'][Math.floor(Math.random() * 4)],
                    icon: '☀️',
                    hourly: [
                        { time: '2PM', temp: 27, icon: '☀️' },
                        { time: '3PM', temp: 28, icon: '⛅' },
                        { time: '4PM', temp: 27, icon: '🌧️' },
                        { time: '5PM', temp: 26, icon: '🌧️' },
                        { time: '6PM', temp: 25, icon: '⛅' },
                        { time: '7PM', temp: 24, icon: '🌙' },
                    ],
                    daily: [
                        { day: 'Today', high: 29, low: 22, icon: '⛅' },
                        { day: 'Tue', high: 28, low: 21, icon: '🌧️' },
                        { day: 'Wed', high: 30, low: 23, icon: '☀️' },
                    ],
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

    // Tea-growing districts to filter from official GeoJSON
    const TEA_DISTRICTS: Record<string, string> = {
        'Galle District': 'Galle',
        'Matara District': 'Matara',
        'Kalutara District': 'Kalutara',
        'Ratnapura District': 'Ratnapura',
        'Badulla District': 'Badulla',
        'Kandy District': 'Kandy',
        'Nuwara Eliya District': 'Nuwara Eliya',
    };

    // Load data files
    useEffect(() => {
        const loadData = async () => {
            try {
                const [atcRes, tiRes, distRes] = await Promise.all([
                    fetch('/data/atc-regions.json'),
                    fetch('/data/ti-regions.json'),
                    fetch('/data/sri-lanka-districts-full.geojson'),
                ]);

                if (atcRes.ok) setAtcRegions(await atcRes.json());
                if (tiRes.ok) setTiRegions(await tiRes.json());
                if (distRes.ok) {
                    const fullGeoJson = await distRes.json();
                    // Filter for only tea-growing districts
                    const teaDistricts = {
                        ...fullGeoJson,
                        features: fullGeoJson.features
                            .filter((f: any) => TEA_DISTRICTS[f.properties.shapeName])
                            .map((f: any) => ({
                                ...f,
                                properties: {
                                    ...f.properties,
                                    name: TEA_DISTRICTS[f.properties.shapeName],
                                    color: districtColors[TEA_DISTRICTS[f.properties.shapeName]] || '#666666'
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
                    center: [7.0, 80.5],
                    zoom: 8,
                    zoomControl: false,
                });
                mapInstanceRef.current = map;

                L.control.zoom({ position: 'bottomright' }).addTo(map);

                // Initial basemap based on current theme
                const isDark = document.documentElement.classList.contains('dark');
                const tileUrl = isDark
                    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

                tileLayerRef.current = L.tileLayer(tileUrl, {
                    attribution: '&copy; OpenStreetMap &copy; CARTO',
                    subdomains: 'abcd',
                    maxZoom: 20
                }).addTo(map);

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

    // Switch tile layer when theme changes
    useEffect(() => {
        if (!mapInstanceRef.current || !tileLayerRef.current) return;

        const switchTileLayer = async () => {
            const L = (await import('leaflet')).default;
            const map = mapInstanceRef.current!;

            // Remove old tile layer
            if (tileLayerRef.current) {
                map.removeLayer(tileLayerRef.current);
            }

            // Add new tile layer based on theme
            const tileUrl = theme === 'dark'
                ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

            tileLayerRef.current = L.tileLayer(tileUrl, {
                attribution: '&copy; OpenStreetMap &copy; CARTO',
                subdomains: 'abcd',
                maxZoom: 20
            }).addTo(map);

            // Ensure tile layer is below other layers
            tileLayerRef.current.bringToBack();
        };

        switchTileLayer();
    }, [theme]);

    // Add district boundaries
    useEffect(() => {
        if (!mapInstanceRef.current || !districts) return;

        const addDistricts = async () => {
            const L = (await import('leaflet')).default;
            const map = mapInstanceRef.current!;

            // Remove existing layer
            if (geoJsonLayerRef.current) {
                map.removeLayer(geoJsonLayerRef.current);
            }

            const geoJsonLayer = L.geoJSON(districts, {
                style: (feature: any) => ({
                    color: feature.properties.color,
                    weight: 2,
                    opacity: 0.6,
                    fillColor: feature.properties.color,
                    fillOpacity: selectedDistrict === 'all' || selectedDistrict === feature.properties.name ? 0.15 : 0.05,
                }),
                onEachFeature: (feature: any, layer: any) => {
                    layer.on({
                        mouseover: async (e: any) => {
                            const bounds = e.target.getBounds();
                            const center = bounds.getCenter();

                            // Highlight
                            e.target.setStyle({
                                weight: 4,
                                opacity: 1,
                                fillOpacity: 0.35,
                            });

                            // Get mouse position
                            const point = map.latLngToContainerPoint(e.latlng);
                            setHoveredDistrict({
                                name: feature.properties.name,
                                position: { x: point.x, y: point.y }
                            });

                            // Fetch weather
                            setIsLoadingWeather(true);
                            const weather = await fetchWeather(center.lat, center.lng);
                            setDistrictWeather(weather);
                            setIsLoadingWeather(false);
                        },
                        click: async (e: any) => {
                            const bounds = e.target.getBounds();
                            const center = bounds.getCenter();

                            // Fetch weather for selected region
                            const weather = await fetchWeather(center.lat, center.lng);
                            if (weather) {
                                setSelectedRegion({
                                    name: feature.properties.name,
                                    weather: weather
                                });

                                // Generate alerts based on weather conditions
                                const alerts = generateWeatherAlerts({
                                    windSpeed: weather.windSpeed,
                                    humidity: weather.humidity,
                                    precipitation: weather.precipitation,
                                    temperature: weather.temperature,
                                    pressure: weather.pressure,
                                    condition: weather.condition,
                                }, feature.properties.name);

                                if (alerts.length > 0) {
                                    setWeatherAlerts(prev => {
                                        // Avoid duplicate alerts
                                        const newAlerts = alerts.filter(a =>
                                            !prev.some(p => p.type === a.type && p.locationName === a.locationName)
                                        );
                                        return [...newAlerts, ...prev].slice(0, 5); // Max 5 alerts
                                    });
                                }
                            }

                            // Zoom to district
                            map.fitBounds(bounds, { padding: [50, 50] });
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

            // Auto-zoom to fit all districts on first load
            if (!hasInitializedBounds) {
                const bounds = geoJsonLayer.getBounds();
                if (bounds.isValid()) {
                    map.fitBounds(bounds, { padding: [30, 30], maxZoom: 9 });
                    setHasInitializedBounds(true);
                }
            }
        };

        addDistricts();
    }, [districts, selectedDistrict, fetchWeather, hasInitializedBounds]);

    // Add ATC markers
    useEffect(() => {
        if (!mapInstanceRef.current || atcRegions.length === 0) return;

        const addATCMarkers = async () => {
            const L = (await import('leaflet')).default;
            const map = mapInstanceRef.current!;

            // Clear existing markers
            atcMarkersRef.current.forEach(m => map.removeLayer(m));
            atcMarkersRef.current = [];

            if (!showATC) return;

            const filteredATC = selectedDistrict === 'all'
                ? atcRegions
                : atcRegions.filter(a => a.district === selectedDistrict);

            filteredATC.forEach(atc => {
                const icon = L.divIcon({
                    className: 'atc-marker',
                    html: `
                        <div class="relative group">
                            <div class="absolute -inset-1 bg-blue-500 rounded-full animate-ping opacity-30"></div>
                            <div class="relative w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center shadow-lg border-2 border-white transform -rotate-3 hover:rotate-0 transition-transform">
                                <span class="text-lg">🏢</span>
                            </div>
                        </div>
                    `,
                    iconSize: [40, 40],
                    iconAnchor: [20, 20],
                });

                const marker = L.marker(atc.coordinates, { icon })
                    .addTo(map)
                    .bindPopup(`
                        <div class="p-3 min-w-[220px]">
                            <h3 class="font-bold text-blue-600 text-lg flex items-center gap-2">
                                🏢 ATC Regional Office
                            </h3>
                            <p class="font-semibold text-gray-800 mt-1">${atc.name}</p>
                            <p class="text-sm text-gray-600 mt-2">📍 ${atc.district} District</p>
                            <p class="text-sm text-gray-600">🗺️ ${atc.atcRegion} Region</p>
                            <p class="text-xs text-gray-500 mt-2 leading-relaxed">${atc.address}</p>
                        </div>
                    `);

                atcMarkersRef.current.push(marker);
            });
        };

        addATCMarkers();
    }, [atcRegions, showATC, selectedDistrict]);

    // Add TI markers
    useEffect(() => {
        if (!mapInstanceRef.current || tiRegions.length === 0) return;

        const addTIMarkers = async () => {
            const L = (await import('leaflet')).default;
            const map = mapInstanceRef.current!;

            // Clear existing markers
            tiMarkersRef.current.forEach(m => map.removeLayer(m));
            tiMarkersRef.current = [];

            if (!showTI) return;

            const filteredTI = selectedDistrict === 'all'
                ? tiRegions
                : tiRegions.filter(t => t.district === selectedDistrict);

            filteredTI.forEach(ti => {
                const icon = L.divIcon({
                    className: 'ti-marker',
                    html: `
                        <div class="relative">
                            <div class="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:scale-110 transition-transform">
                                <span class="text-sm">📍</span>
                            </div>
                        </div>
                    `,
                    iconSize: [32, 32],
                    iconAnchor: [16, 16],
                });

                const marker = L.marker(ti.coordinates, { icon })
                    .addTo(map)
                    .on('mouseover', async (e: any) => {
                        const point = map.latLngToContainerPoint(e.latlng);
                        setHoveredTI({
                            region: ti,
                            position: { x: point.x, y: point.y }
                        });
                        setIsLoadingWeather(true);
                        const weather = await fetchWeather(ti.coordinates[0], ti.coordinates[1]);
                        setTiWeather(weather);
                        setIsLoadingWeather(false);
                    })
                    .on('mouseout', () => {
                        setHoveredTI(null);
                        setTiWeather(null);
                    })
                    .bindPopup(`
                        <div class="p-3 min-w-[200px]">
                            <h3 class="font-bold text-orange-600 text-lg flex items-center gap-2">
                                📍 TI Region
                            </h3>
                            <p class="font-semibold text-gray-800 mt-1">${ti.tiRegion}</p>
                            <p class="text-sm text-gray-600 mt-2">🏢 ${ti.district} District</p>
                            <p class="text-xs text-gray-500 mt-2 leading-relaxed">${ti.address}</p>
                        </div>
                    `);

                tiMarkersRef.current.push(marker);
            });
        };

        addTIMarkers();
    }, [tiRegions, showTI, selectedDistrict, fetchWeather]);

    return (
        <div className="relative h-full w-full">
            {/* Map Container */}
            <div ref={mapContainerRef} className="h-full w-full z-0" style={{ minHeight: '400px' }} />

            {/* Control Panel */}
            <div className="absolute top-4 left-4 z-[1000] bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-xl shadow-2xl p-4 border border-gray-200 dark:border-gray-700 min-w-[280px] transition-colors duration-300">
                <h3 className="text-gray-900 dark:text-white font-semibold text-sm mb-3 flex items-center gap-2">
                    <span>🗺️</span> Regional Control
                </h3>

                {/* District Filter */}
                <div className="mb-4">
                    <label className="text-gray-600 dark:text-gray-400 text-xs mb-1 block">Filter by District</label>
                    <select
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)}
                        className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                    >
                        <option value="all">All Districts</option>
                        {uniqueDistricts.map(d => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                </div>

                {/* Layer Toggles */}
                <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={showATC}
                            onChange={(e) => setShowATC(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-blue-500 focus:ring-blue-500"
                        />
                        <span className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                            <span className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-md flex items-center justify-center text-xs">🏢</span>
                            ATC Offices ({atcRegions.filter(a => selectedDistrict === 'all' || a.district === selectedDistrict).length})
                        </span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={showTI}
                            onChange={(e) => setShowTI(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                            <span className="w-6 h-6 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-xs">📍</span>
                            TI Regions ({tiRegions.filter(t => selectedDistrict === 'all' || t.district === selectedDistrict).length})
                        </span>
                    </label>
                </div>

                {/* Legend */}
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

            {/* Weather Cards */}
            {hoveredDistrict && (
                <DistrictWeatherCard
                    districtName={hoveredDistrict.name}
                    weather={districtWeather}
                    isLoading={isLoadingWeather}
                    position={hoveredDistrict.position}
                />
            )}

            {hoveredTI && (
                <TIRegionWeatherCard
                    regionName={hoveredTI.region.tiRegion}
                    districtName={hoveredTI.region.district}
                    weather={tiWeather}
                    isLoading={isLoadingWeather}
                    position={hoveredTI.position}
                />
            )}

            {/* Anemometer - Right Side */}
            <div className="absolute top-4 right-4 z-[1000]">
                <Anemometer
                    windSpeed={selectedRegion?.weather?.windSpeed || districtWeather?.windSpeed || 0}
                    windDirection={selectedRegion?.weather?.windDirection || districtWeather?.windDirection || 'N'}
                    isVisible={true}
                    locationName={selectedRegion?.name || hoveredDistrict?.name || 'Select a region'}
                />
            </div>

            {/* Weather Alerts */}
            <WeatherAlerts
                alerts={weatherAlerts}
                onDismiss={(id) => setWeatherAlerts(prev => prev.filter(a => a.id !== id))}
            />

            {/* Styles */}
            <style jsx global>{`
                .atc-marker, .ti-marker {
                    background: transparent !important;
                    border: none !important;
                }
                .leaflet-popup-content-wrapper {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                }
                .leaflet-popup-tip {
                    background: white;
                }
            `}</style>
        </div>
    );
}
