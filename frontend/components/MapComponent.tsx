'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';

export default function MapComponent() {
    const Map = useMemo(
        () =>
            dynamic(() => import('./TeaMap'), {
                loading: () => (
                    <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto"></div>
                            <p className="mt-4 text-gray-500">Loading map...</p>
                        </div>
                    </div>
                ),
                ssr: false,
            }),
        []
    );

    return <Map />;
}
