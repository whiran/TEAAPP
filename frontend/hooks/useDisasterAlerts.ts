/**
 * Custom React hook for fetching and managing disaster alerts.
 * Polls Tomorrow.io Alerts API every 4 hours for active disaster warnings.
 */

import { useState, useEffect, useCallback } from 'react';

export interface DisasterAlert {
    id: string;
    type: 'flood' | 'heavy_rain' | 'landslide' | 'drought' | 'cyclone' | 'wind' | 'temperature';
    severity: 'advisory' | 'watch' | 'warning' | 'critical';
    title: string;
    description: string;
    affected_regions: string[];
    start_time: string;
    end_time?: string;
    coordinates: [number, number];
    radius: number; // km
    source: string;
    recommendations: string[];
}

interface UseDisasterAlertsReturn {
    alerts: DisasterAlert[];
    loading: boolean;
    error: string | null;
    lastUpdated: Date | null;
    refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage disaster alerts
 *
 * @param lat - Latitude (default: Nuwara Eliya, Sri Lanka)
 * @param lon - Longitude (default: Nuwara Eliya, Sri Lanka)
 * @param pollInterval - Polling interval in ms (default: 4 hours)
 */
export function useDisasterAlerts(
    lat: number = 6.9497,
    lon: number = 80.7891,
    pollInterval: number = 14400000 // 4 hours in milliseconds
): UseDisasterAlertsReturn {
    const [alerts, setAlerts] = useState<DisasterAlert[]>([]);
    // Start as true so the spinner shows immediately — avoids a blank flash
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchAlerts = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const response = await fetch(`${API_URL}/api/alerts/active?lat=${lat}&lon=${lon}`);

            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
            }

            const data: DisasterAlert[] = await response.json();
            setAlerts(data);
            setLastUpdated(new Date());
            console.log(`✅ Fetched ${data.length} disaster alerts`);
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : 'Unknown error fetching alerts';
            setError(errorMessage);
            console.error('❌ Error fetching disaster alerts:', errorMessage);
        } finally {
            setLoading(false);
        }
    }, [lat, lon]);

    useEffect(() => {
        // Fetch immediately on mount
        fetchAlerts();

        // Set up polling interval (default: 4 hours)
        const interval = setInterval(fetchAlerts, pollInterval);

        // Cleanup on unmount
        return () => clearInterval(interval);
    }, [fetchAlerts, pollInterval]);

    return { alerts, loading, error, lastUpdated, refetch: fetchAlerts };
}
