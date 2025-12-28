'use client';

import { DisasterAlert } from '@/hooks/useDisasterAlerts';

interface Props {
    alerts: DisasterAlert[];
}

/**
 * Disaster Alert Banner - Shows critical and warning alerts at top of screen
 * Displays at the top of the page for immediate visibility
 */
export function DisasterAlertBanner({ alerts }: Props) {
    const criticalAlerts = alerts.filter(a => a.severity === 'critical');
    const warningAlerts = alerts.filter(a => a.severity === 'warning');

    if (criticalAlerts.length === 0 && warningAlerts.length === 0) {
        return null;
    }

    return (
        <div className="fixed top-16 left-0 right-0 z-[1002] px-4 md:px-6 space-y-2 pointer-events-none">
            <div className="pointer-events-auto space-y-2">
                {/* Critical Alerts */}
                {criticalAlerts.map(alert => (
                    <div
                        key={alert.id}
                        className="bg-red-600 text-white px-4 md:px-6 py-4 rounded-lg shadow-2xl animate-pulse"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-3xl md:text-4xl flex-shrink-0">🚨</span>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-base md:text-lg truncate">{alert.title}</h3>
                                <p className="text-xs md:text-sm opacity-90 line-clamp-2">{alert.description}</p>
                            </div>
                            <span className="text-xs bg-white/20 px-2 md:px-3 py-1 rounded-full uppercase font-semibold flex-shrink-0">
                                CRITICAL
                            </span>
                        </div>
                    </div>
                ))}

                {/* Warning Alerts */}
                {warningAlerts.map(alert => (
                    <div
                        key={alert.id}
                        className="bg-orange-600 text-white px-4 md:px-6 py-3 rounded-lg shadow-xl"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-2xl md:text-3xl flex-shrink-0">⚠️</span>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-sm md:text-base truncate">{alert.title}</h3>
                                <p className="text-xs opacity-90 line-clamp-1">{alert.description}</p>
                            </div>
                            <span className="text-xs bg-white/20 px-2 md:px-3 py-1 rounded-full uppercase font-semibold flex-shrink-0">
                                WARNING
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
