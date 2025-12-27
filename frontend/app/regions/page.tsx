'use client';

import dynamic from 'next/dynamic';

// Dynamically import RegionalMap with no SSR
const RegionalMap = dynamic(() => import('../../components/map/RegionalMap'), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full flex items-center justify-center bg-gray-900">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-400 text-lg">Loading Regional Map...</p>
            </div>
        </div>
    )
});

export default function RegionsPage() {
    return (
        <main className="relative h-screen w-full bg-gray-900">
            {/* Header */}
            <header className="absolute top-0 left-0 right-0 z-[500] bg-gray-900/80 backdrop-blur-md border-b border-gray-700">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                <span className="text-xl">🗺️</span>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">
                                    Regional Intelligence
                                </h1>
                                <p className="text-xs text-gray-400">
                                    ATC Offices • TI Regions • District Boundaries
                                </p>
                            </div>
                        </div>
                        <nav className="hidden md:flex items-center space-x-1">
                            <a href="/" className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all text-sm font-medium">
                                Weather Map
                            </a>
                            <a href="/regions" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                                Regions
                            </a>
                            <a href="#analytics" className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all text-sm font-medium">
                                Analytics
                            </a>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Map Container */}
            <div className="h-screen w-full pt-[60px]">
                <RegionalMap />
            </div>

            {/* Stats Summary */}
            <div className="absolute bottom-6 left-6 z-[500] bg-gray-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-700 p-4">
                <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <span>📊</span> Regional Summary
                </h2>
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-blue-900/50 to-indigo-900/50 rounded-lg p-3 border border-blue-700/50">
                        <p className="text-xs text-gray-400">ATC Offices</p>
                        <p className="text-2xl font-bold text-blue-400">7</p>
                        <p className="text-xs text-blue-500">Regional HQs</p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-900/50 to-amber-900/50 rounded-lg p-3 border border-orange-700/50">
                        <p className="text-xs text-gray-400">TI Regions</p>
                        <p className="text-2xl font-bold text-orange-400">34</p>
                        <p className="text-xs text-orange-500">Active zones</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-lg p-3 border border-purple-700/50">
                        <p className="text-xs text-gray-400">Districts</p>
                        <p className="text-2xl font-bold text-purple-400">7</p>
                        <p className="text-xs text-purple-500">Tea growing</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 rounded-lg p-3 border border-green-700/50">
                        <p className="text-xs text-gray-400">Coverage</p>
                        <p className="text-2xl font-bold text-green-400">100%</p>
                        <p className="text-xs text-green-500">Full mapped</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
