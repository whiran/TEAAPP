'use client';

import { useState, useCallback } from 'react';

interface WeatherData {
    temperature: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    windDirection: string;
    pressure: number;
    visibility: number;
    precipitation: number;
    clouds: number;
    condition: string;
    icon: string;
    hourly?: Array<{
        time: string;
        temp: number;
        icon: string;
    }>;
    daily?: Array<{
        day: string;
        high: number;
        low: number;
        icon: string;
    }>;
    airQuality?: {
        aqi: number;
        level: string;
        pm25: number;
        o3: number;
    };
    alerts?: Array<{
        type: string;
        message: string;
        severity: 'warning' | 'alert' | 'watch';
    }>;
}

interface DistrictWeatherCardProps {
    districtName: string;
    weather: WeatherData | null;
    isLoading: boolean;
    position: { x: number; y: number };
}

interface TIRegionWeatherCardProps {
    regionName: string;
    districtName: string;
    weather: WeatherData | null;
    isLoading: boolean;
    position: { x: number; y: number };
}

// Weather condition to gradient mapping
const conditionGradients: Record<string, string> = {
    'clear': 'from-amber-400 via-orange-400 to-yellow-300',
    'clouds': 'from-gray-400 via-slate-500 to-gray-600',
    'rain': 'from-blue-600 via-blue-700 to-indigo-800',
    'drizzle': 'from-blue-400 via-blue-500 to-blue-600',
    'thunderstorm': 'from-purple-700 via-indigo-800 to-gray-900',
    'snow': 'from-blue-100 via-white to-gray-200',
    'mist': 'from-gray-300 via-gray-400 to-gray-500',
    'night': 'from-gray-800 via-indigo-900 to-gray-900',
};

const getWeatherIcon = (condition: string): string => {
    const icons: Record<string, string> = {
        'clear': '☀️',
        'clouds': '☁️',
        'rain': '🌧️',
        'drizzle': '🌦️',
        'thunderstorm': '⛈️',
        'snow': '❄️',
        'mist': '🌫️',
        'fog': '🌫️',
    };
    return icons[condition.toLowerCase()] || '🌤️';
};

const getWindDirection = (degrees: number): string => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
};

const getAQIColor = (aqi: number): string => {
    if (aqi <= 50) return 'text-green-400';
    if (aqi <= 100) return 'text-yellow-400';
    if (aqi <= 150) return 'text-orange-400';
    if (aqi <= 200) return 'text-red-400';
    return 'text-purple-400';
};

const getAQILevel = (aqi: number): string => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive';
    if (aqi <= 200) return 'Unhealthy';
    return 'Very Unhealthy';
};

// District Weather Card (Aggregated View)
export function DistrictWeatherCard({ districtName, weather, isLoading, position }: DistrictWeatherCardProps) {
    const gradient = weather ? conditionGradients[weather.condition.toLowerCase()] || conditionGradients['clouds'] : 'from-gray-700 to-gray-800';

    return (
        <div
            className="fixed z-[2000] pointer-events-none animate-fadeIn"
            style={{ left: position.x + 15, top: position.y - 10 }}
        >
            <div className={`bg-gradient-to-br ${gradient} rounded-2xl shadow-2xl border border-white/20 backdrop-blur-lg overflow-hidden min-w-[280px]`}>
                {/* Header */}
                <div className="px-4 py-3 bg-black/20">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">📍</span>
                        <div>
                            <h3 className="text-white font-bold text-lg">{districtName} District</h3>
                            <p className="text-white/70 text-xs">Weather Overview</p>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="p-6 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                    </div>
                ) : weather ? (
                    <>
                        {/* Current Conditions */}
                        <div className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-5xl">{getWeatherIcon(weather.condition)}</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-4xl font-bold text-white">{weather.temperature}°C</p>
                                    <p className="text-white/70 text-sm">Feels {weather.feelsLike}°C</p>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-2 mt-4">
                                <div className="bg-white/10 rounded-lg p-2 text-center">
                                    <p className="text-xl">💨</p>
                                    <p className="text-white font-semibold text-sm">{weather.windSpeed} km/h</p>
                                    <p className="text-white/60 text-xs">{weather.windDirection}</p>
                                </div>
                                <div className="bg-white/10 rounded-lg p-2 text-center">
                                    <p className="text-xl">💧</p>
                                    <p className="text-white font-semibold text-sm">{weather.humidity}%</p>
                                    <p className="text-white/60 text-xs">Humidity</p>
                                </div>
                                <div className="bg-white/10 rounded-lg p-2 text-center">
                                    <p className="text-xl">🌧️</p>
                                    <p className="text-white font-semibold text-sm">{weather.precipitation}mm</p>
                                    <p className="text-white/60 text-xs">Rain</p>
                                </div>
                            </div>
                        </div>

                        {/* 3-Day Forecast */}
                        {weather.daily && weather.daily.length > 0 && (
                            <div className="px-4 pb-4">
                                <p className="text-white/60 text-xs mb-2">📅 3-Day Forecast</p>
                                <div className="flex gap-2">
                                    {weather.daily.slice(0, 3).map((day, idx) => (
                                        <div key={idx} className="flex-1 bg-white/10 rounded-lg p-2 text-center">
                                            <p className="text-white/70 text-xs">{day.day}</p>
                                            <p className="text-2xl my-1">{day.icon}</p>
                                            <p className="text-white font-semibold text-sm">{day.high}°</p>
                                            <p className="text-white/50 text-xs">{day.low}°</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Alerts */}
                        {weather.alerts && weather.alerts.length > 0 && (
                            <div className="px-4 pb-4">
                                <div className="bg-red-500/30 border border-red-400/50 rounded-lg p-2">
                                    <p className="text-white text-xs flex items-center gap-1">
                                        <span>⚠️</span> {weather.alerts[0].message}
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="p-4 text-white/70 text-center text-sm">
                        Weather data unavailable
                    </div>
                )}
            </div>
        </div>
    );
}

// TI Region Weather Card (Granular View)
export function TIRegionWeatherCard({ regionName, districtName, weather, isLoading, position }: TIRegionWeatherCardProps) {
    const gradient = weather ? conditionGradients[weather.condition.toLowerCase()] || conditionGradients['clouds'] : 'from-gray-700 to-gray-800';

    return (
        <div
            className="fixed z-[2000] pointer-events-none animate-fadeIn"
            style={{ left: position.x + 15, top: position.y - 10 }}
        >
            <div className={`bg-gradient-to-br ${gradient} rounded-2xl shadow-2xl border border-white/20 backdrop-blur-lg overflow-hidden min-w-[320px] max-w-[350px]`}>
                {/* Header */}
                <div className="px-4 py-3 bg-black/20">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">📍</span>
                        <div>
                            <h3 className="text-white font-bold text-lg">{regionName}</h3>
                            <p className="text-white/70 text-xs">🏢 {districtName} District • TI Region</p>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="p-8 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white"></div>
                    </div>
                ) : weather ? (
                    <>
                        {/* Current Conditions - Detailed */}
                        <div className="p-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <span className="text-6xl">{getWeatherIcon(weather.condition)}</span>
                                    <p className="text-white/80 text-sm mt-1 capitalize">{weather.condition}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-5xl font-bold text-white">{weather.temperature}°</p>
                                    <p className="text-white/70 text-sm">Feels like {weather.feelsLike}°C</p>
                                </div>
                            </div>

                            {/* Detailed Stats */}
                            <div className="grid grid-cols-4 gap-2 mt-4">
                                <div className="bg-white/10 rounded-lg p-2 text-center">
                                    <p className="text-lg">💨</p>
                                    <p className="text-white font-semibold text-xs">{weather.windSpeed}</p>
                                    <p className="text-white/50 text-[10px]">km/h {weather.windDirection}</p>
                                </div>
                                <div className="bg-white/10 rounded-lg p-2 text-center">
                                    <p className="text-lg">💧</p>
                                    <p className="text-white font-semibold text-xs">{weather.humidity}%</p>
                                    <p className="text-white/50 text-[10px]">Humidity</p>
                                </div>
                                <div className="bg-white/10 rounded-lg p-2 text-center">
                                    <p className="text-lg">☁️</p>
                                    <p className="text-white font-semibold text-xs">{weather.clouds}%</p>
                                    <p className="text-white/50 text-[10px]">Clouds</p>
                                </div>
                                <div className="bg-white/10 rounded-lg p-2 text-center">
                                    <p className="text-lg">📊</p>
                                    <p className="text-white font-semibold text-xs">{weather.pressure}</p>
                                    <p className="text-white/50 text-[10px]">hPa</p>
                                </div>
                            </div>
                        </div>

                        {/* Air Quality */}
                        {weather.airQuality && (
                            <div className="px-4 pb-3">
                                <p className="text-white/60 text-xs mb-2">🌬️ Air Quality</p>
                                <div className="bg-white/10 rounded-lg p-3 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className={`text-2xl font-bold ${getAQIColor(weather.airQuality.aqi)}`}>
                                            {weather.airQuality.aqi}
                                        </span>
                                        <div>
                                            <p className={`font-semibold text-sm ${getAQIColor(weather.airQuality.aqi)}`}>
                                                {getAQILevel(weather.airQuality.aqi)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right text-white/60 text-xs">
                                        <p>PM2.5: {weather.airQuality.pm25}</p>
                                        <p>O3: {weather.airQuality.o3}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Hourly Forecast */}
                        {weather.hourly && weather.hourly.length > 0 && (
                            <div className="px-4 pb-3">
                                <p className="text-white/60 text-xs mb-2">⏰ Hourly Forecast</p>
                                <div className="flex gap-1 overflow-x-auto pb-1">
                                    {weather.hourly.slice(0, 6).map((hour, idx) => (
                                        <div key={idx} className="flex-shrink-0 bg-white/10 rounded-lg px-2 py-1 text-center min-w-[45px]">
                                            <p className="text-white/70 text-[10px]">{hour.time}</p>
                                            <p className="text-lg my-0.5">{hour.icon}</p>
                                            <p className="text-white font-semibold text-xs">{hour.temp}°</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Alerts */}
                        {weather.alerts && weather.alerts.length > 0 && (
                            <div className="px-4 pb-4">
                                <p className="text-white/60 text-xs mb-2">🔔 Weather Alerts</p>
                                {weather.alerts.map((alert, idx) => (
                                    <div key={idx} className={`rounded-lg p-2 mb-1 ${alert.severity === 'alert' ? 'bg-red-500/30 border border-red-400/50' :
                                            alert.severity === 'warning' ? 'bg-yellow-500/30 border border-yellow-400/50' :
                                                'bg-blue-500/30 border border-blue-400/50'
                                        }`}>
                                        <p className="text-white text-xs flex items-center gap-1">
                                            <span>{alert.severity === 'alert' ? '🚨' : '⚠️'}</span>
                                            {alert.message}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="p-6 text-white/70 text-center text-sm">
                        Weather data unavailable
                    </div>
                )}
            </div>

            {/* CSS for animations */}
            <style jsx global>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
            `}</style>
        </div>
    );
}

export type { WeatherData };
