'use client';

import { useState, useCallback, useMemo } from 'react';

export interface FilterState {
    elevation: string;
    subElevation: string;
    district: string;
    dsDiv: string;
    atcReg: string;
    inspectorRegion: string;
    agroDiv: string;
    managementType: string;
    isActive: string; // 'all' | 'true' | 'false'
}

export interface FilterOptions {
    elevation: string[];
    subElevation: string[];
    district: string[];
    dsDiv: string[];
    atcReg: string[];
    inspectorRegion: string[];
    agroDiv: string[];
    managementType: string[];
}

interface Props {
    filters: FilterState;
    options: FilterOptions;
    total: number;
    filtered: number;
    onChange: (filters: FilterState) => void;
    onReset: () => void;
}

const EMPTY_FILTERS: FilterState = {
    elevation: '',
    subElevation: '',
    district: '',
    dsDiv: '',
    atcReg: '',
    inspectorRegion: '',
    agroDiv: '',
    managementType: '',
    isActive: 'all',
};

function FilterSelect({
    label,
    value,
    options,
    onChange,
    icon,
}: {
    label: string;
    value: string;
    options: string[];
    onChange: (v: string) => void;
    icon: string;
}) {
    return (
        <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>{icon}</span> {label}
            </label>
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full bg-gray-800/80 border border-gray-700 text-gray-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all appearance-none cursor-pointer hover:border-gray-500"
            >
                <option value="">All</option>
                {options.map(o => (
                    <option key={o} value={o}>{o}</option>
                ))}
            </select>
        </div>
    );
}

export default function FactoryFilterPanel({ filters, options, total, filtered, onChange, onReset }: Props) {
    const [isOpen, setIsOpen] = useState(true);

    const hasActiveFilters = useMemo(() =>
        Object.entries(filters).some(([k, v]) => k === 'isActive' ? v !== 'all' : v !== ''),
        [filters]
    );

    const set = useCallback((key: keyof FilterState) => (value: string) => {
        onChange({ ...filters, [key]: value });
    }, [filters, onChange]);

    const elevationColour: Record<string, string> = {
        High: 'text-green-400',
        Medium: 'text-blue-400',
        Low: 'text-amber-400',
    };

    return (
        <div
            className={`absolute top-4 left-4 z-[1000] transition-all duration-300 ${isOpen ? 'w-72' : 'w-12'}`}
            style={{ maxHeight: 'calc(100vh - 100px)' }}
        >
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                title={isOpen ? 'Collapse filters' : 'Expand filters'}
                className="absolute -right-3 top-4 z-10 w-7 h-7 bg-gray-800 border border-gray-600 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-700 transition-colors text-gray-300 text-xs"
            >
                {isOpen ? '◀' : '▶'}
            </button>

            <div className="bg-gray-900/95 backdrop-blur-md rounded-xl border border-gray-700 shadow-2xl overflow-hidden h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 bg-gradient-to-r from-green-900/40 to-emerald-900/30 shrink-0">
                    {isOpen && (
                        <>
                            <div className="flex items-center gap-2">
                                <span className="text-lg">🏭</span>
                                <div>
                                    <h2 className="text-white font-bold text-sm">Factory Filters</h2>
                                    <p className="text-green-400 text-xs font-medium">
                                        {filtered.toLocaleString()} of {total.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            {hasActiveFilters && (
                                <button
                                    onClick={onReset}
                                    className="text-xs text-red-400 hover:text-red-300 border border-red-800 hover:border-red-600 rounded-lg px-2 py-1 transition-all"
                                >
                                    Reset
                                </button>
                            )}
                        </>
                    )}
                    {!isOpen && <span className="text-base mx-auto">🔍</span>}
                </div>

                {/* Filters (only when open) */}
                {isOpen && (
                    <div className="overflow-y-auto flex-1 px-4 py-3 space-y-3 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">

                        {/* Active status */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                <span>⚡</span> Status
                            </label>
                            <div className="flex gap-2">
                                {(['all', 'true', 'false'] as const).map(v => (
                                    <button
                                        key={v}
                                        onClick={() => set('isActive')(v)}
                                        className={`flex-1 text-xs py-1.5 rounded-lg border transition-all font-medium ${filters.isActive === v
                                            ? v === 'true'
                                                ? 'bg-green-600 border-green-500 text-white'
                                                : v === 'false'
                                                    ? 'bg-red-700 border-red-600 text-white'
                                                    : 'bg-gray-700 border-gray-500 text-white'
                                            : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
                                            }`}
                                    >
                                        {v === 'all' ? 'All' : v === 'true' ? '✅ Active' : '❌ Inactive'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Elevation quick-select */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                <span>⛰️</span> Elevation
                            </label>
                            <div className="flex gap-2">
                                {['', 'High', 'Medium', 'Low'].map(v => (
                                    <button
                                        key={v || 'all'}
                                        onClick={() => set('elevation')(v)}
                                        className={`flex-1 text-xs py-1.5 rounded-lg border transition-all font-medium ${filters.elevation === v
                                            ? v === 'High'
                                                ? 'bg-green-600 border-green-500 text-white'
                                                : v === 'Medium'
                                                    ? 'bg-blue-600 border-blue-500 text-white'
                                                    : v === 'Low'
                                                        ? 'bg-amber-600 border-amber-500 text-white'
                                                        : 'bg-gray-700 border-gray-500 text-white'
                                            : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
                                            }`}
                                    >
                                        {v || 'All'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <FilterSelect label="Sub-Elevation" icon="🗻" value={filters.subElevation} options={options.subElevation} onChange={set('subElevation')} />
                        <FilterSelect label="District" icon="📍" value={filters.district} options={options.district} onChange={set('district')} />
                        <FilterSelect label="DS Division" icon="🏙️" value={filters.dsDiv} options={options.dsDiv} onChange={set('dsDiv')} />
                        <FilterSelect label="ATC Region" icon="🌿" value={filters.atcReg} options={options.atcReg} onChange={set('atcReg')} />
                        <FilterSelect label="Inspector Region" icon="🔍" value={filters.inspectorRegion} options={options.inspectorRegion} onChange={set('inspectorRegion')} />
                        <FilterSelect label="Agro Division" icon="🌱" value={filters.agroDiv} options={options.agroDiv} onChange={set('agroDiv')} />
                        <FilterSelect label="Management Type" icon="🏢" value={filters.managementType} options={options.managementType} onChange={set('managementType')} />
                    </div>
                )}

                {/* Legend always visible when panel open */}
                {isOpen && (
                    <div className="px-4 py-3 border-t border-gray-700 shrink-0 bg-gray-900/60">
                        <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wider">Legend</p>
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                                <div className="w-3.5 h-3.5 rounded-full bg-green-500 shadow-lg shadow-green-500/40 shrink-0" />
                                <span className="text-xs text-gray-300">High Elevation (&gt;4,000 ft)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3.5 h-3.5 rounded-full bg-blue-500 shadow-lg shadow-blue-500/40 shrink-0" />
                                <span className="text-xs text-gray-300">Medium Elevation</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3.5 h-3.5 rounded-full bg-amber-400 shadow-lg shadow-amber-400/40 shrink-0" />
                                <span className="text-xs text-gray-300">Low Elevation</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export { EMPTY_FILTERS };
