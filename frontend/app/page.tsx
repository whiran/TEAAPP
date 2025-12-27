'use client';

import dynamic from 'next/dynamic';
import ThemeToggle from '../components/ThemeToggle';

// Dynamically import WeatherMap with no SSR (Leaflet requires window)
const WeatherMap = dynamic(() => import('../components/map/WeatherMap'), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400 text-lg">Loading Map...</p>
            </div>
        </div>
    )
});

export default function Home() {
    return (
        <main className="relative h-screen w-full bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
            {/* Header */}
            <header className="absolute top-0 left-0 right-0 z-[500] bg-white/90 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                                <span className="text-xl">🍵</span>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white transition-colors">
                                    Ceylon Tea Intelligence
                                </h1>
                                <p className="text-xs text-gray-600 dark:text-gray-400 transition-colors">
                                    Geospatial Analytics & Weather Intelligence
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <nav className="hidden md:flex items-center space-x-1">
                                <a href="#dashboard" className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all text-sm font-medium">
                                    Dashboard
                                </a>
                                <a href="#estates" className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all text-sm font-medium">
                                    Estates
                                </a>
                                <a href="#analytics" className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all text-sm font-medium">
                                    Analytics
                                </a>
                                <a href="#reports" className="px-4 py-2 bg-green-600 text-white rounded-lg transition-all text-sm font-medium hover:bg-green-700">
                                    Reports
                                </a>
                            </nav>
                            <ThemeToggle />
                        </div>
                    </div>
                </div>
            </header>

            {/* Map Container - Full Screen */}
            <div className="h-screen w-full pt-[60px]">
                <WeatherMap />
            </div>

            {/* Stats Panel - Bottom Left */}
            <div className="absolute bottom-6 left-6 z-[500] bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 max-w-sm transition-colors duration-300">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2 transition-colors">
                    <span>📊</span> Platform Overview
                </h2>
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 rounded-lg p-3 border border-green-200 dark:border-green-700/50 transition-colors">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Total Estates</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">247</p>
                        <p className="text-xs text-green-600 dark:text-green-500">+12 this month</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/50 dark:to-cyan-900/50 rounded-lg p-3 border border-blue-200 dark:border-blue-700/50 transition-colors">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Total Area</p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">187K</p>
                        <p className="text-xs text-blue-600 dark:text-blue-500">hectares managed</p>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/50 dark:to-orange-900/50 rounded-lg p-3 border border-yellow-200 dark:border-yellow-700/50 transition-colors">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Active Alerts</p>
                        <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">3</p>
                        <p className="text-xs text-yellow-600 dark:text-yellow-500">weather warnings</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 rounded-lg p-3 border border-purple-200 dark:border-purple-700/50 transition-colors">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Yield Forecast</p>
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">+8%</p>
                        <p className="text-xs text-purple-600 dark:text-purple-500">vs last season</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions - Bottom Right */}
            <div className="absolute bottom-6 right-6 z-[400] flex flex-col gap-2">
                <button className="bg-green-600 hover:bg-green-700 text-white rounded-full p-3 shadow-lg transition-all hover:scale-105" title="Add New Estate">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                </button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-all hover:scale-105" title="Generate Report">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </button>
            </div>
        </main>
    );
}


