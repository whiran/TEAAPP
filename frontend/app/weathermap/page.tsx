'use client';

import dynamic from 'next/dynamic';
import Navigation from '../../components/Navigation';

// Dynamically import RegionalMap with no SSR
const RegionalMap = dynamic(() => import('../../components/map/RegionalMap'), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400 text-lg">Loading Weather Map...</p>
            </div>
        </div>
    )
});

export default function WeatherMapPage() {
    return (
        <>
            <Navigation />
            <main className="relative h-screen w-full bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
                {/* Map Container */}
                <div className="h-screen w-full pt-[60px]">
                    <RegionalMap />
                </div>

                {/* Stats Summary */}
                <div className="absolute bottom-6 left-6 z-[500] bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 transition-colors duration-300">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2 transition-colors">
                        <span>📊</span> Weather Map Summary
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-lg p-3 border border-blue-200 dark:border-blue-700/50 transition-colors">
                            <p className="text-xs text-gray-600 dark:text-gray-400">ATC Offices</p>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">7</p>
                            <p className="text-xs text-blue-600 dark:text-blue-500">Regional HQs</p>
                        </div>
                        <div className="bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/50 dark:to-amber-900/50 rounded-lg p-3 border border-orange-200 dark:border-orange-700/50 transition-colors">
                            <p className="text-xs text-gray-600 dark:text-gray-400">TI Regions</p>
                            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">34</p>
                            <p className="text-xs text-orange-600 dark:text-orange-500">Active zones</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 rounded-lg p-3 border border-purple-200 dark:border-purple-700/50 transition-colors">
                            <p className="text-xs text-gray-600 dark:text-gray-400">Districts</p>
                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">7</p>
                            <p className="text-xs text-purple-600 dark:text-purple-500">Tea growing</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 rounded-lg p-3 border border-green-200 dark:border-green-700/50 transition-colors">
                            <p className="text-xs text-gray-600 dark:text-gray-400">Coverage</p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">100%</p>
                            <p className="text-xs text-green-600 dark:text-green-500">Full mapped</p>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}

