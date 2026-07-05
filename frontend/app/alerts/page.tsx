'use client';

import Navigation from '../../components/Navigation';
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

const SEVERITY_BADGE: Record<string, string> = {
    critical: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    warning: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
    watch: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
    advisory: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
};

export default function AlertsPage() {
    const { alerts, loading, error, refetch, lastUpdated } = useDisasterAlerts();

    return (
        <>
            <Navigation />
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-[60px]">
                <div className="max-w-7xl mx-auto px-4 py-8">

                    {/* Header */}
                    <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                                <span className="text-5xl">⚠️</span>
                                Disaster Alerts Center
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Real-time disaster monitoring for Ceylon tea regions
                            </p>
                        </div>

                        {/* Refresh Controls */}
                        <div className="flex flex-col items-end gap-2 shrink-0">
                            <button
                                onClick={refetch}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg transition-all text-sm font-medium shadow"
                            >
                                <span className={loading ? 'animate-spin' : ''}>🔄</span>
                                {loading ? 'Refreshing…' : 'Refresh Now'}
                            </button>
                            {lastUpdated && (
                                <p className="text-xs text-gray-500 dark:text-gray-500">
                                    Last updated: {lastUpdated.toLocaleTimeString()}
                                </p>
                            )}
                            <p className="text-xs text-gray-400 dark:text-gray-600">
                                Auto-refreshes every 4 hours
                            </p>
                        </div>
                    </div>

                    {/* Summary bar */}
                    {!loading && !error && alerts.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                            {(['critical', 'warning', 'watch', 'advisory'] as const).map(sev => {
                                const count = alerts.filter(a => a.severity === sev).length;
                                return (
                                    <div key={sev} className={`rounded-xl p-3 text-center ${SEVERITY_BADGE[sev]} border border-current/20`}>
                                        <p className="text-2xl font-bold">{count}</p>
                                        <p className="text-xs font-semibold uppercase tracking-wide">{sev}</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <div className="flex items-center justify-center py-24">
                            <div className="text-center space-y-4">
                                <div className="relative mx-auto w-16 h-16">
                                    <div className="absolute inset-0 rounded-full border-4 border-green-500/20 animate-ping" />
                                    <div className="absolute inset-0 rounded-full border-4 border-t-green-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">Fetching live alerts…</p>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-xl p-6 mb-6 flex items-start gap-4">
                            <span className="text-3xl shrink-0">❌</span>
                            <div>
                                <p className="font-semibold text-red-800 dark:text-red-300 mb-1">Failed to load alerts</p>
                                <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
                                <p className="text-red-600 dark:text-red-500 text-xs mt-2">
                                    Check that the backend is running and TOMORROWIO_API_KEY is configured.
                                </p>
                                <button
                                    onClick={refetch}
                                    className="mt-3 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-all"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Alerts Grid */}
                    {!loading && !error && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {alerts.length === 0 ? (
                                <div className="col-span-full text-center py-20 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                                    <p className="text-8xl mb-4">✅</p>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                        No Active Alerts
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        All clear across monitored Ceylon tea regions
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
                                            <span className="text-5xl flex-shrink-0">
                                                {ALERT_ICONS[alert.type] || '⚠️'}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-2 gap-2">
                                                    <h3 className="text-xl font-bold leading-tight">{alert.title}</h3>
                                                    <span className="text-xs bg-white/20 px-3 py-1 rounded-full uppercase font-bold shrink-0">
                                                        {alert.severity}
                                                    </span>
                                                </div>
                                                <p className="text-white/90 mb-4 text-sm leading-relaxed">{alert.description}</p>

                                                {/* Affected Regions */}
                                                {alert.affected_regions.length > 0 && (
                                                    <div className="bg-black/20 rounded-lg p-3 mb-3">
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

                                                {/* Timestamp */}
                                                <p className="text-xs text-white/60 mt-3">
                                                    Active from: {new Date(alert.start_time).toLocaleString()}
                                                    {alert.end_time && ` → ${new Date(alert.end_time).toLocaleString()}`}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Info Footer */}
                    <div className="mt-10 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
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
        </>
    );
}
