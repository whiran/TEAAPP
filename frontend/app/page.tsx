import dynamic from 'next/dynamic';

// Dynamically import map component (Leaflet requires window object)
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-lg text-muted-foreground">Loading map...</p>
            </div>
        </div>
    ),
});

export default function Home() {
    return (
        <main className="relative h-screen w-full">
            {/* Header */}
            <header className="absolute top-0 left-0 right-0 z-10 bg-white/95 backdrop-blur-sm shadow-md">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                                <span className="text-2xl">🍵</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Ceylon Tea Intelligence Platform
                                </h1>
                                <p className="text-sm text-gray-600">
                                    Geospatial Analytics for Tea Estates
                                </p>
                            </div>
                        </div>
                        <nav className="hidden md:flex items-center space-x-6">
                            <a href="#dashboard" className="text-gray-700 hover:text-primary transition-colors">
                                Dashboard
                            </a>
                            <a href="#estates" className="text-gray-700 hover:text-primary transition-colors">
                                Estates
                            </a>
                            <a href="#analytics" className="text-gray-700 hover:text-primary transition-colors">
                                Analytics
                            </a>
                            <a href="#reports" className="text-gray-700 hover:text-primary transition-colors">
                                Reports
                            </a>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Map Container */}
            <div className="h-screen w-full pt-20">
                <MapComponent />
            </div>

            {/* Info Panel */}
            <div className="absolute bottom-8 left-8 z-10 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-6 max-w-md">
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                    Welcome to Ceylon Tea Intelligence
                </h2>
                <p className="text-gray-700 mb-4">
                    Explore tea estates across Sri Lanka with interactive mapping and real-time analytics.
                </p>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-primary/10 rounded-lg p-3">
                        <p className="text-sm text-gray-600">Total Estates</p>
                        <p className="text-2xl font-bold text-primary">247</p>
                    </div>
                    <div className="bg-primary/10 rounded-lg p-3">
                        <p className="text-sm text-gray-600">Total Area</p>
                        <p className="text-2xl font-bold text-primary">187K ha</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
