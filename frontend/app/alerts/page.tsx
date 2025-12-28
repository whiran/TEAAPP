'use client';

import { useDisasterAlerts } from '@/hooks/useDisasterAlerts';

const ALERT_ICONS: Record<string, string> = {
    flood: '🌊',
    heavy_rain: '🌧️',
    landslide: '⛰️',
    drought: '☀️',
    cyclone: '🌀',
    wind: '💨',
    temperature: '🌡️',
};

const SEVERITY_COLORS: Record<string, string> = {
    critical: 'from-red-600 to-red-800',
    warning: 'from-orange-600 to-orange-800',
    watch: 'from-yellow-600 to-yellow-800',
    advisory: 'from-blue-600 to-blue-800',
};

export default function AlertsPage() {
    const { alerts, loading, error } = useDisasterAlerts();

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                        <span className="text-5xl">⚠️</span>
                        Disaster Alerts Center
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Real-time disaster monitoring for Ceylon tea regions
                    </p>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-4 mb-6">
                        <p className="text-red-800 dark:text-red-300">
                            ❌ Error loading alerts: {error}
                        </p>
                    </div>
                )}

                {/* Alerts Grid */}
                {!loading && !error && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {alerts.length === 0 ? (
                            <div className="col-span-full text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                                <p className="text-8xl mb-4">✅</p>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    No Active Alerts
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400">
                                    All clear in monitored regions
                                </p>
                            </div>
                        ) : (
                            alerts.map(alert => (
                                <div
                                    key={alert.id}
                                    className={`bg-gradient-to-br ${SEVERITY_COLORS[alert.severity]} 
                             text-white rounded-xl shadow-xl p-6 hover:scale-[1.02] transition-transform`}
                                >
                                    <div className="flex items-start gap-4">
                                        <span className="text-6xl flex-shrink-0">
                                            {ALERT_ICONS[alert.type] || '⚠️'}
                                        </span>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-2xl font-bold">{alert.title}</h3>
                                                <span className="text-xs bg-white/20 px-3 py-1 rounded-full uppercase font-bold">
                                                    {alert.severity}
                                                </span>
                                            </div>
                                            <p className="text-white/90 mb-4">{alert.description}</p>

                                            {/* Affected Regions */}
                                            {alert.affected_regions.length > 0 && (
                                                <div className="bg-black/20 rounded-lg p-3 mb-4">
                                                    <p className="text-xs font-semibold mb-1">📍 Affected Regions:</p>
                                                    <p className="text-sm">{alert.affected_regions.join(', ')}</p>
                                                </div>
                                            )}

                                            {/* Recommendations */}
                                            {alert.recommendations && alert.recommendations.length > 0 && (
                                                <div className="bg-black/20 rounded-lg p-3">
                                                    <p className="text-xs font-semibold mb-2">✅ Recommended Actions:</p>
                                                    <ul className="text-sm space-y-1">
                                                        {alert.recommendations.map((rec, idx) => (
                                                            <li key={idx}>• {rec}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Info Footer */}
                <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">About Disaster Alerts</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                        This system monitors real-time weather data from Tomorrow.io and generates alerts
                        based on forecast conditions that may impact tea production and estate safety.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-white">🌊 Flood</p>
                            <p className="text-gray-600 dark:text-gray-400">5-day advance prediction</p>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-white">🌀 Cyclone</p>
                            <p className="text-gray-600 dark:text-gray-400">Storm track monitoring</p>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-white">⛰️ Landslide</p>
                            <p className="text-gray-600 dark:text-gray-400">Rain + slope analysis</p>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-white">☀️ Drought</p>
                            <p className="text-gray-600 dark:text-gray-400">Precipitation tracking</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
