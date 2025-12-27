'use client';

import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="relative w-14 h-7 rounded-full bg-gradient-to-r from-gray-700 to-gray-800 dark:from-gray-700 dark:to-gray-800 light:from-blue-100 light:to-orange-100 p-0.5 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg border border-gray-600 dark:border-gray-600"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
        >
            {/* Toggle Track Background */}
            <div className={`absolute inset-0.5 rounded-full transition-all duration-500 ${theme === 'dark'
                    ? 'bg-gradient-to-r from-indigo-900 via-purple-900 to-gray-900'
                    : 'bg-gradient-to-r from-sky-400 via-blue-300 to-yellow-200'
                }`} />

            {/* Stars (visible in dark mode) */}
            <div className={`absolute inset-0 transition-opacity duration-300 ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}`}>
                <span className="absolute top-1.5 left-2 text-[6px]">✨</span>
                <span className="absolute bottom-1 left-4 text-[5px]">⭐</span>
            </div>

            {/* Toggle Circle */}
            <div className={`relative w-6 h-6 rounded-full shadow-md transform transition-all duration-300 flex items-center justify-center ${theme === 'dark'
                    ? 'translate-x-0 bg-gradient-to-br from-gray-300 to-gray-100'
                    : 'translate-x-7 bg-gradient-to-br from-yellow-300 to-orange-400'
                }`}>
                <span className="text-sm">
                    {theme === 'dark' ? '🌙' : '☀️'}
                </span>
            </div>
        </button>
    );
}
