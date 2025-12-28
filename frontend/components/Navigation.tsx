'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';

interface NavLinkProps {
    href: string;
    children: React.ReactNode;
    onClick?: () => void;
}

function NavLink({ href, children, onClick }: NavLinkProps) {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link
            href={href}
            onClick={onClick}
            className={`px-4 py-2 rounded-lg transition-all text-sm font-medium ${isActive
                    ? 'bg-green-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
        >
            {children}
        </Link>
    );
}

export default function Navigation() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <header className="fixed top-0 left-0 right-0 z-[1000] bg-white/90 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-xl">🍵</span>
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white transition-colors">
                                Ceylon Tea Intelligence
                            </h1>
                            <p className="text-xs text-gray-600 dark:text-gray-400 transition-colors">
                                Geospatial Analytics & Weather Intelligence
                            </p>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-1">
                        <NavLink href="/">Dashboard</NavLink>
                        <NavLink href="/weathermap">Weather Map</NavLink>
                        <NavLink href="/estates">Estates</NavLink>
                        <NavLink href="/analytics">Analytics</NavLink>
                        <NavLink href="/alerts">Disaster Alerts</NavLink>
                        <NavLink href="/reports">Reports</NavLink>
                    </nav>

                    {/* Right Side */}
                    <div className="flex items-center gap-2">
                        <ThemeToggle />

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <nav className="md:hidden mt-4 pb-4 space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4">
                        <NavLink href="/" onClick={() => setIsMobileMenuOpen(false)}>
                            Dashboard
                        </NavLink>
                        <NavLink href="/weathermap" onClick={() => setIsMobileMenuOpen(false)}>
                            Weather Map
                        </NavLink>
                        <NavLink href="/estates" onClick={() => setIsMobileMenuOpen(false)}>
                            Estates
                        </NavLink>
                        <NavLink href="/analytics" onClick={() => setIsMobileMenuOpen(false)}>
                            Analytics
                        </NavLink>
                        <NavLink href="/alerts" onClick={() => setIsMobileMenuOpen(false)}>
                            Disaster Alerts
                        </NavLink>
                        <NavLink href="/reports" onClick={() => setIsMobileMenuOpen(false)}>
                            Reports
                        </NavLink>
                    </nav>
                )}
            </div>
        </header>
    );
}
