'use client';

import Link from 'next/link';
import Navigation from '../../components/Navigation';

export default function AnalyticsPage() {
    return (
        <>
            <Navigation />
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-[60px] flex items-center justify-center p-6">
                <div className="text-center max-w-2xl">
                    <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
                        <span className="text-6xl">📊</span>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Analytics Dashboard
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
                        Coming Soon
                    </p>
                    <p className="text-gray-500 dark:text-gray-500 mb-8">
                        Advanced analytics and insights for production trends, yield forecasting,
                        and climate impact analysis.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-left">
                        {[
                            { icon: '📈', title: 'Yield Trends', desc: 'Monthly and seasonal production graphs per estate and district' },
                            { icon: '🌦️', title: 'Climate Impact', desc: 'Correlate rainfall, temperature, and harvest volumes over time' },
                            { icon: '🦠', title: 'Disease Risk', desc: 'Blister Blight and other disease risk scoring from weather data' },
                        ].map(f => (
                            <div key={f.title} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow">
                                <p className="text-2xl mb-2">{f.icon}</p>
                                <p className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{f.title}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-4 justify-center">
                        <Link
                            href="/"
                            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all font-medium"
                        >
                            Back to Dashboard
                        </Link>
                        <Link
                            href="/weathermap"
                            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all font-medium"
                        >
                            View Weather Map
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
