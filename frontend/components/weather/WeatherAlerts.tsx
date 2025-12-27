'use client';

import { useState, useEffect } from 'react';

export interface WeatherAlert {
    id: string;
    type: 'cyclone' | 'heavy_rain' | 'drought' | 'humidity' | 'frost' | 'heat_wave';
    severity: 'warning' | 'danger' | 'critical';
    title: string;
    message: string;
    timestamp: Date;
    locationName?: string;
}

interface WeatherAlertsProps {
    alerts: WeatherAlert[];
    onDismiss: (id: string) => void;
}

// Alert configuration for styling and icons
const alertConfig: Record<string, { icon: string; bgColor: string; borderColor: string; textColor: string; glowColor: string }> = {
    cyclone: {
        icon: '🌀',
        bgColor: 'bg-red-900/90 dark:bg-red-900/90',
        borderColor: 'border-red-500',
        textColor: 'text-red-100',
        glowColor: 'shadow-red-500/50',
    },
    heavy_rain: {
        icon: '🌧️',
        bgColor: 'bg-blue-900/90 dark:bg-blue-900/90',
        borderColor: 'border-blue-500',
        textColor: 'text-blue-100',
        glowColor: 'shadow-blue-500/50',
    },
    drought: {
        icon: '☀️',
        bgColor: 'bg-orange-900/90 dark:bg-orange-900/90',
        borderColor: 'border-orange-500',
        textColor: 'text-orange-100',
        glowColor: 'shadow-orange-500/50',
    },
    humidity: {
        icon: '💧',
        bgColor: 'bg-purple-900/90 dark:bg-purple-900/90',
        borderColor: 'border-purple-500',
        textColor: 'text-purple-100',
        glowColor: 'shadow-purple-500/50',
    },
    frost: {
        icon: '❄️',
        bgColor: 'bg-cyan-900/90 dark:bg-cyan-900/90',
        borderColor: 'border-cyan-500',
        textColor: 'text-cyan-100',
        glowColor: 'shadow-cyan-500/50',
    },
    heat_wave: {
        icon: '🔥',
        bgColor: 'bg-amber-900/90 dark:bg-amber-900/90',
        borderColor: 'border-amber-500',
        textColor: 'text-amber-100',
        glowColor: 'shadow-amber-500/50',
    },
};

const severityBadge: Record<string, { label: string; color: string }> = {
    warning: { label: 'WARNING', color: 'bg-yellow-500 text-yellow-900' },
    danger: { label: 'DANGER', color: 'bg-orange-500 text-orange-900' },
    critical: { label: 'CRITICAL', color: 'bg-red-600 text-white animate-pulse' },
};

export default function WeatherAlerts({ alerts, onDismiss }: WeatherAlertsProps) {
    const [mounted, setMounted] = useState(false);
    const [visibleAlerts, setVisibleAlerts] = useState<WeatherAlert[]>([]);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        setVisibleAlerts(alerts);
    }, [alerts]);

    if (!mounted || visibleAlerts.length === 0) return null;

    return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1001] flex flex-col gap-2 max-w-lg w-full px-4">
            {visibleAlerts.map((alert, index) => {
                const config = alertConfig[alert.type] || alertConfig.humidity;
                const severity = severityBadge[alert.severity] || severityBadge.warning;

                return (
                    <div
                        key={alert.id}
                        className={`
                            ${config.bgColor} ${config.borderColor} ${config.textColor}
                            backdrop-blur-md rounded-xl border-2 p-4 shadow-2xl ${config.glowColor}
                            animate-slideDown transition-all duration-300
                        `}
                        style={{
                            animationDelay: `${index * 100}ms`,
                            boxShadow: alert.severity === 'critical'
                                ? `0 0 30px ${config.glowColor.replace('shadow-', '').replace('/50', '')}`
                                : undefined
                        }}
                    >
                        <div className="flex items-start gap-3">
                            {/* Icon with animation */}
                            <div className={`text-4xl ${alert.severity === 'critical' ? 'animate-bounce' : 'animate-pulse'}`}>
                                {config.icon}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${severity.color}`}>
                                        {severity.label}
                                    </span>
                                    {alert.locationName && (
                                        <span className="text-xs opacity-75">📍 {alert.locationName}</span>
                                    )}
                                </div>
                                <h4 className="font-bold text-lg leading-tight">{alert.title}</h4>
                                <p className="text-sm opacity-90 mt-1">{alert.message}</p>
                            </div>

                            {/* Dismiss button */}
                            <button
                                onClick={() => onDismiss(alert.id)}
                                className="text-white/60 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Progress bar for auto-dismiss (visual only) */}
                        {alert.severity !== 'critical' && (
                            <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-white/60 rounded-full animate-shrink"
                                    style={{ animationDuration: '10s' }}
                                ></div>
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Animations */}
            <style jsx>{`
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-slideDown {
                    animation: slideDown 0.3s ease-out forwards;
                }
                @keyframes shrink {
                    from { width: 100%; }
                    to { width: 0%; }
                }
                .animate-shrink {
                    animation: shrink linear forwards;
                }
            `}</style>
        </div>
    );
}

// Utility function to generate alerts based on weather data
export function generateWeatherAlerts(
    weatherData: {
        windSpeed: number;
        humidity: number;
        precipitation: number;
        temperature: number;
        pressure: number;
        condition: string;
    },
    locationName?: string
): WeatherAlert[] {
    const alerts: WeatherAlert[] = [];
    const now = new Date();

    // Cyclone conditions: High wind + low pressure
    if (weatherData.windSpeed > 60 || (weatherData.windSpeed > 40 && weatherData.pressure < 1000)) {
        alerts.push({
            id: `cyclone-${now.getTime()}`,
            type: 'cyclone',
            severity: weatherData.windSpeed > 80 ? 'critical' : 'danger',
            title: 'Cyclone Warning!',
            message: `Extreme wind speeds of ${weatherData.windSpeed} km/h detected. Seek shelter immediately and secure outdoor equipment.`,
            timestamp: now,
            locationName,
        });
    }

    // Heavy rain: High precipitation
    if (weatherData.precipitation > 50 || weatherData.condition === 'heavy_rain') {
        alerts.push({
            id: `rain-${now.getTime()}`,
            type: 'heavy_rain',
            severity: weatherData.precipitation > 100 ? 'critical' : 'warning',
            title: 'Heavy Rainfall Alert',
            message: `Heavy precipitation of ${weatherData.precipitation}mm expected. Risk of flooding in low-lying tea estates.`,
            timestamp: now,
            locationName,
        });
    }

    // Drought conditions: No rain + high temp
    if (weatherData.precipitation === 0 && weatherData.temperature > 35 && weatherData.humidity < 40) {
        alerts.push({
            id: `drought-${now.getTime()}`,
            type: 'drought',
            severity: 'warning',
            title: 'Drought Conditions',
            message: `Dry conditions with ${weatherData.temperature}°C and low humidity. Increase irrigation for tea crops.`,
            timestamp: now,
            locationName,
        });
    }

    // Unusual humidity: Very high humidity
    if (weatherData.humidity > 95) {
        alerts.push({
            id: `humidity-${now.getTime()}`,
            type: 'humidity',
            severity: weatherData.humidity > 98 ? 'danger' : 'warning',
            title: 'Extreme Humidity Alert',
            message: `Humidity at ${weatherData.humidity}%. High risk of Blister Blight disease. Apply preventive fungicides.`,
            timestamp: now,
            locationName,
        });
    }

    // Heat wave
    if (weatherData.temperature > 38) {
        alerts.push({
            id: `heat-${now.getTime()}`,
            type: 'heat_wave',
            severity: weatherData.temperature > 42 ? 'critical' : 'danger',
            title: 'Heat Wave Warning',
            message: `Extreme temperature of ${weatherData.temperature}°C. Protect workers and provide shade for young tea plants.`,
            timestamp: now,
            locationName,
        });
    }

    return alerts;
}
