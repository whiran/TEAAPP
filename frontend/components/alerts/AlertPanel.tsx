'use client';

import { DisasterAlert } from '@/hooks/useDisasterAlerts';

interface Props {
    alerts: DisasterAlert[];
    onClose: () => void;
}

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
    critical: 'bg-red-900/90 border-red-500',
    warning: 'bg-orange-900/90 border-orange-500',
    watch: 'bg-yellow-900/90 border-yellow-500',
    advisory: 'bg-blue-900/90 border-blue-500',
};

/**
 * Alert Panel - Expandable sidebar showing all active disaster alerts
 * Mobile: Slides up from bottom
 * Desktop: Fixed sidebar on right
 */
export function AlertPanel({ alerts, onClose }: Props) {
    return (
        <>
            {/* Backdrop for mobile */}
            <div
                className="md:hidden fixed inset-0 bg-black/50 z-[1000]"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed md:right-4 md:top-20 md:bottom-4 md:w-96 
                      bottom-0 left-0 right-0 md:left-auto 
                      z-[1001] 
                      bg-gray-900/95 backdrop-blur-md 
                      md:rounded-xl rounded-t-2xl 
                      shadow-2xl border border-gray-700 
                      overflow-hidden flex flex-col
                      max-h-[80vh] md:max-h-none
                      animate-slide-up md:animate-none">

                {/* Header */}
                <div className="bg-gradient-to-r from-red-600 to-orange-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
                    <h2 className="text-white font-bold text-lg flex items-center gap-2">
                        ⚠️ Active Disasters
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white text-2xl leading-none"
                        aria-label="Close panel"
                    >
                        ✕
                    </button>
                </div>

                {/* Alert List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {alerts.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            <p className="text-6xl mb-3">✅</p>
                            <p className="text-sm">No active disaster alerts</p>
                            <p className="text-xs mt-1 opacity-70">All clear in monitored regions</p>
                        </div>
                    ) : (
                        alerts.map(alert => (
                            <div
                                key={alert.id}
                                className={`${SEVERITY_COLORS[alert.severity]} border-2 rounded-lg p-4 cursor-pointer hover:scale-[1.02] transition-transform`}
                            >
                                <div className="flex items-start gap-3">
                                    <span className="text-3xl flex-shrink-0">
                                        {ALERT_ICONS[alert.type] || '⚠️'}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1 gap-2">
                                            <h3 className="text-white font-bold text-sm truncate">{alert.title}</h3>
                                            <span className="text-xs px-2 py-1 bg-white/20 rounded-full uppercase flex-shrink-0">
                                                {alert.severity}
                                            </span>
                                        </div>
                                        <p className="text-white/90 text-xs mb-2 line-clamp-2">{alert.description}</p>

                                        {/* Affected Regions */}
                                        {alert.affected_regions.length > 0 && (
                                            <div className="flex items-center gap-2 text-xs text-white/70 mb-2">
                                                <span>📍</span>
                                                <span className="truncate">{alert.affected_regions.join(', ')}</span>
                                            </div>
                                        )}

                                        {/* Recommendations */}
                                        {alert.recommendations && alert.recommendations.length > 0 && (
                                            <div className="mt-3 bg-black/20 rounded p-2">
                                                <p className="text-xs text-white/80 font-semibold mb-1">Recommended Actions:</p>
                                                <ul className="text-xs text-white/70 space-y-1">
                                                    {alert.recommendations.slice(0, 3).map((rec, idx) => (
                                                        <li key={idx} className="truncate">• {rec}</li>
                                                    ))}
                                                    {alert.recommendations.length > 3 && (
                                                        <li className="text-white/50 italic">
                                                            +{alert.recommendations.length - 3} more...
                                                        </li>
                                                    )}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-700 px-4 py-3 bg-gray-800/50 flex-shrink-0">
                    <p className="text-xs text-gray-400">
                        Last updated: {new Date().toLocaleTimeString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        Refreshes every 4 hours
                    </p>
                </div>
            </div>
        </>
    );
}
