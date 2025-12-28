'use client';

export default function EstatesPage() {
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-6">
            <div className="text-center max-w-2xl">
                <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
                    <span className="text-6xl">🏞️</span>
                </div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    Estate Management
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                    Coming Soon
                </p>
                <p className="text-gray-500 dark:text-gray-500 mb-8">
                    Comprehensive tea estate management system with inventory tracking,
                    worker management, and production analytics.
                </p>
                <div className="flex gap-4 justify-center">
                    <a
                        href="/"
                        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all font-medium"
                    >
                        Back to Dashboard
                    </a>
                    <a
                        href="/weathermap"
                        className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all font-medium"
                    >
                        View Weather Map
                    </a>
                </div>
            </div>
        </div>
    );
}
