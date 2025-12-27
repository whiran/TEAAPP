'use client';

import { useEffect, useState } from 'react';

interface AnemometerProps {
    windSpeed: number; // km/h
    windDirection: string; // N, NE, E, SE, S, SW, W, NW
    isVisible: boolean;
    locationName?: string;
}

// Convert wind direction to degrees
const directionToDegrees: Record<string, number> = {
    'N': 0,
    'NNE': 22.5,
    'NE': 45,
    'ENE': 67.5,
    'E': 90,
    'ESE': 112.5,
    'SE': 135,
    'SSE': 157.5,
    'S': 180,
    'SSW': 202.5,
    'SW': 225,
    'WSW': 247.5,
    'W': 270,
    'WNW': 292.5,
    'NW': 315,
    'NNW': 337.5,
};

// Get wind description based on speed
const getWindDescription = (speed: number): { label: string; color: string } => {
    if (speed < 5) return { label: 'Calm', color: 'text-green-400' };
    if (speed < 15) return { label: 'Light Breeze', color: 'text-blue-400' };
    if (speed < 30) return { label: 'Moderate', color: 'text-yellow-400' };
    if (speed < 50) return { label: 'Strong', color: 'text-orange-400' };
    return { label: 'Storm', color: 'text-red-400' };
};

// Calculate rotation animation duration based on wind speed
const getRotationDuration = (speed: number): number => {
    if (speed < 5) return 4; // 4 seconds per rotation (very slow)
    if (speed < 15) return 2; // 2 seconds
    if (speed < 30) return 1; // 1 second
    if (speed < 50) return 0.5; // 0.5 seconds
    return 0.25; // Very fast for storm winds
};

export default function Anemometer({ windSpeed, windDirection, isVisible, locationName }: AnemometerProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!isVisible || !mounted) return null;

    const rotationDuration = getRotationDuration(windSpeed);
    const directionDegrees = directionToDegrees[windDirection] || 0;
    const { label, color } = getWindDescription(windSpeed);

    return (
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-xl shadow-2xl p-4 border border-gray-200 dark:border-gray-700 transition-colors duration-300 w-48">
            {/* Header */}
            <div className="text-center mb-3">
                <h4 className="text-gray-900 dark:text-white font-semibold text-sm flex items-center justify-center gap-2">
                    <span>🌬️</span> Wind Monitor
                </h4>
                {locationName && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">{locationName}</p>
                )}
            </div>

            {/* Anemometer SVG */}
            <div className="relative w-32 h-32 mx-auto mb-3">
                {/* Background circle */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 border-4 border-gray-300 dark:border-gray-600 shadow-inner"></div>

                {/* Compass markings */}
                <div className="absolute inset-2 rounded-full">
                    {['N', 'E', 'S', 'W'].map((dir, i) => (
                        <span
                            key={dir}
                            className="absolute text-xs font-bold text-gray-500 dark:text-gray-400"
                            style={{
                                top: i === 0 ? '2px' : i === 2 ? 'auto' : '50%',
                                bottom: i === 2 ? '2px' : 'auto',
                                left: i === 3 ? '2px' : i === 1 ? 'auto' : '50%',
                                right: i === 1 ? '2px' : 'auto',
                                transform: i % 2 === 0 ? 'translateX(-50%)' : 'translateY(-50%)',
                            }}
                        >
                            {dir}
                        </span>
                    ))}
                </div>

                {/* Rotating blades */}
                <div
                    className="absolute inset-4"
                    style={{
                        animation: `spin ${rotationDuration}s linear infinite`,
                    }}
                >
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                        {/* Blade 1 */}
                        <path
                            d="M50 50 L50 15 Q55 25 50 50"
                            fill="url(#bladeGradient)"
                            stroke="#374151"
                            strokeWidth="1"
                        />
                        {/* Blade 2 */}
                        <path
                            d="M50 50 L85 50 Q75 55 50 50"
                            fill="url(#bladeGradient)"
                            stroke="#374151"
                            strokeWidth="1"
                        />
                        {/* Blade 3 */}
                        <path
                            d="M50 50 L50 85 Q45 75 50 50"
                            fill="url(#bladeGradient)"
                            stroke="#374151"
                            strokeWidth="1"
                        />
                        {/* Blade 4 */}
                        <path
                            d="M50 50 L15 50 Q25 45 50 50"
                            fill="url(#bladeGradient)"
                            stroke="#374151"
                            strokeWidth="1"
                        />
                        {/* Center hub */}
                        <circle cx="50" cy="50" r="8" fill="#1f2937" stroke="#374151" strokeWidth="2" />
                        <circle cx="50" cy="50" r="4" fill="#60a5fa" />

                        {/* Gradient definition */}
                        <defs>
                            <linearGradient id="bladeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#60a5fa" />
                                <stop offset="100%" stopColor="#3b82f6" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                {/* Wind direction arrow */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ transform: `rotate(${directionDegrees}deg)` }}
                >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1">
                        <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-red-500"></div>
                    </div>
                </div>
            </div>

            {/* Wind Speed Display */}
            <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                    <span className={`text-3xl font-bold ${color}`}>{windSpeed}</span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">km/h</span>
                </div>
                <p className={`text-sm font-medium ${color}`}>{label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Direction: <span className="font-semibold">{windDirection}</span>
                </p>
            </div>

            {/* CSS for spin animation */}
            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
