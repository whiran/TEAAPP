'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import type { Map, TileLayer, LayerGroup } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTheme } from '../ThemeProvider';
import FactoryFilterPanel, {
    EMPTY_FILTERS,
    type FilterState,
    type FilterOptions,
} from './FactoryFilterPanel';

// ── Types ────────────────────────────────────────────────────────────────────

interface Factory {
    facno: string;
    name: string;
    address: string | null;
    year: number | null;
    method: string | null;
    isActive: boolean;
    gnDiv: string | null;
    village: string | null;
    elevHeight: number | null;
    greenTeaAvg: number | null;
    capacity: number | string | null;
    elevation: string | null;   // High | Medium | Low
    subElevation: string | null;
    district: string | null;
    dsDiv: string | null;
    atcReg: string | null;
    inspectorRegion: string | null;
    agroDiv: string | null;
    managementType: string | null;
    lat: number;
    lng: number;
}

// ── Colour palette per elevation ─────────────────────────────────────────────

const ELEV_COLOUR: Record<string, string> = {
    High:   '#22c55e',   // green-500
    Medium: '#3b82f6',   // blue-500
    Low:    '#f59e0b',   // amber-400
};
const DEFAULT_COLOUR = '#94a3b8'; // slate-400

function elevColour(e: string | null) {
    if (!e) return DEFAULT_COLOUR;
    return ELEV_COLOUR[e] ?? DEFAULT_COLOUR;
}

// ── SVG factory icon (inline, no external deps) ──────────────────────────────

function factoryIconSvg(colour: string, active: boolean): string {
    const opacity = active ? '1' : '0.45';
    return `
        <div style="
            position:relative;
            width:28px;height:28px;
            filter: drop-shadow(0 2px 6px ${colour}88);
            opacity:${opacity};
            transition: transform 0.15s ease, filter 0.15s ease;
        " class="factory-icon-wrapper">
            <svg viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg" width="28" height="28">
                <!-- chimney left -->
                <rect x="4" y="6" width="4" height="10" rx="1" fill="${colour}" opacity="0.9"/>
                <!-- chimney right -->
                <rect x="10" y="9" width="4" height="7" rx="1" fill="${colour}" opacity="0.8"/>
                <!-- smoke puffs -->
                <circle cx="6" cy="5" r="1.5" fill="${colour}" opacity="0.4"/>
                <circle cx="12" cy="8" r="1.2" fill="${colour}" opacity="0.3"/>
                <!-- main building -->
                <rect x="3" y="16" width="22" height="9" rx="2" fill="${colour}"/>
                <!-- roof trim -->
                <rect x="3" y="14" width="22" height="3" rx="1" fill="${colour}" opacity="0.7"/>
                <!-- door -->
                <rect x="12" y="20" width="4" height="5" rx="1" fill="white" opacity="0.3"/>
                <!-- window left -->
                <rect x="5"  y="18" width="4" height="3" rx="0.5" fill="white" opacity="0.25"/>
                <!-- window right -->
                <rect x="19" y="18" width="4" height="3" rx="0.5" fill="white" opacity="0.25"/>
            </svg>
        </div>`;
}

// ── Tooltip HTML ─────────────────────────────────────────────────────────────

function tooltipHtml(f: Factory): string {
    const colour = elevColour(f.elevation);
    const active = f.isActive ? '✅ Active' : '❌ Inactive';
    const cap = f.capacity && f.capacity !== 'NULL'
        ? Number(f.capacity).toLocaleString() + ' kg'
        : '—';
    const elev = f.elevHeight ? f.elevHeight.toLocaleString() + ' ft' : '—';
    const avg  = f.greenTeaAvg ? f.greenTeaAvg.toLocaleString() + ' kg' : '—';

    return `
        <div style="
            min-width:220px; max-width:270px;
            background: rgba(15,20,30,0.92);
            backdrop-filter: blur(12px);
            border: 1px solid ${colour}55;
            border-radius: 12px;
            padding: 0;
            overflow: hidden;
            box-shadow: 0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px ${colour}22;
            font-family: system-ui, sans-serif;
        ">
            <!-- Header -->
            <div style="
                background: linear-gradient(135deg, ${colour}22, ${colour}11);
                border-bottom: 1px solid ${colour}44;
                padding: 10px 14px 8px;
            ">
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                    <span style="font-size:16px;">🏭</span>
                    <span style="color:${colour}; font-size:13px; font-weight:700; letter-spacing:0.03em;">${f.name}</span>
                </div>
                <div style="color:#94a3b8; font-size:10px; margin-left:24px;">${f.facno} &nbsp;·&nbsp; ${active}</div>
            </div>
            <!-- Body -->
            <div style="padding:10px 14px; display:grid; grid-template-columns:1fr 1fr; gap:6px 12px;">
                ${row('📍', 'District', f.district ?? '—')}
                ${row('📅', 'Est.', f.year ? String(f.year) : '—')}
                ${row('⛰️', 'Elevation', f.elevation ?? '—')}
                ${row('📏', 'Elev. Height', elev)}
                ${row('🏢', 'Capacity', cap)}
                ${row('🍃', 'Green Tea Avg', avg)}
                ${row('⚙️', 'Method', f.method ?? '—')}
                ${row('🌿', 'ATC Region', f.atcReg ?? '—')}
            </div>
            ${f.address ? `<div style="padding:0 14px 10px; color:#64748b; font-size:10px; line-height:1.4;">${f.address}</div>` : ''}
        </div>`;
}

function row(icon: string, label: string, value: string): string {
    return `
        <div>
            <div style="color:#64748b; font-size:9px; text-transform:uppercase; letter-spacing:0.06em;">${icon} ${label}</div>
            <div style="color:#e2e8f0; font-size:11px; font-weight:500; margin-top:1px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${value}</div>
        </div>`;
}

// ── Compute distinct filter options from data ─────────────────────────────────

function buildOptions(data: Factory[]): FilterOptions {
    const distinct = (key: keyof Factory) =>
        [...new Set(data.map(f => f[key]).filter(Boolean) as string[])].sort();
    return {
        elevation:       distinct('elevation'),
        subElevation:    distinct('subElevation'),
        district:        distinct('district'),
        dsDiv:           distinct('dsDiv'),
        atcReg:          distinct('atcReg'),
        inspectorRegion: distinct('inspectorRegion'),
        agroDiv:         distinct('agroDiv'),
        managementType:  distinct('managementType'),
    };
}

// ── Main component ────────────────────────────────────────────────────────────

export default function FactoryMap() {
    const mapRef      = useRef<HTMLDivElement>(null);
    const mapInst     = useRef<Map | null>(null);
    const tileRef     = useRef<TileLayer | null>(null);
    const markerLayer = useRef<LayerGroup | null>(null);
    const { theme }   = useTheme();

    const [allFactories, setAllFactories] = useState<Factory[]>([]);
    const [filters, setFilters]           = useState<FilterState>(EMPTY_FILTERS);
    const [isLoading, setIsLoading]       = useState(true);

    // Compute filter options once from full dataset
    const filterOptions = useMemo(() => buildOptions(allFactories), [allFactories]);

    // Client-side filtering
    const visible = useMemo(() => {
        let r = allFactories;
        if (filters.elevation)       r = r.filter(f => (f.elevation ?? '') === filters.elevation);
        if (filters.subElevation)    r = r.filter(f => (f.subElevation ?? '') === filters.subElevation);
        if (filters.district)        r = r.filter(f => (f.district ?? '') === filters.district);
        if (filters.dsDiv)           r = r.filter(f => (f.dsDiv ?? '') === filters.dsDiv);
        if (filters.atcReg)          r = r.filter(f => (f.atcReg ?? '') === filters.atcReg);
        if (filters.inspectorRegion) r = r.filter(f => (f.inspectorRegion ?? '') === filters.inspectorRegion);
        if (filters.agroDiv)         r = r.filter(f => (f.agroDiv ?? '') === filters.agroDiv);
        if (filters.managementType)  r = r.filter(f => (f.managementType ?? '') === filters.managementType);
        if (filters.isActive === 'true')  r = r.filter(f => f.isActive);
        if (filters.isActive === 'false') r = r.filter(f => !f.isActive);
        return r;
    }, [allFactories, filters]);

    // ── Load JSON data ──────────────────────────────────────────────────────

    useEffect(() => {
        fetch('/data/factories.json')
            .then(r => r.json())
            .then((data: Factory[]) => {
                setAllFactories(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error('Failed to load factories.json', err);
                setIsLoading(false);
            });
    }, []);

    // ── Initialise Leaflet map ──────────────────────────────────────────────

    useEffect(() => {
        if (!mapRef.current || mapInst.current) return;

        const init = async () => {
            const L = (await import('leaflet')).default;

            // @ts-ignore
            if (mapRef.current!._leaflet_id) {
                // @ts-ignore
                mapRef.current!._leaflet_id = null;
            }

            const map = L.map(mapRef.current!, {
                center: [7.8731, 80.7718],
                zoom: 8,
                zoomControl: false,
                attributionControl: true,
            });
            mapInst.current = map;

            L.control.zoom({ position: 'bottomright' }).addTo(map);

            // Tile layer
            const isDark = document.documentElement.classList.contains('dark');
            const url = isDark
                ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
            tileRef.current = L.tileLayer(url, {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 20,
            }).addTo(map);

            // District overlay
            try {
                const geojson = await fetch('/data/districts.geojson').then(r => r.json());
                L.geoJSON(geojson, {
                    style: {
                        color: '#22c55e',
                        weight: 1.2,
                        fillColor: '#22c55e',
                        fillOpacity: isDark ? 0.04 : 0.06,
                        opacity: 0.4,
                    },
                }).addTo(map);
            } catch {
                // district overlay is optional
            }

            // Marker layer group
            markerLayer.current = L.layerGroup().addTo(map);
        };

        init();

        return () => {
            if (mapInst.current) {
                mapInst.current.remove();
                mapInst.current = null;
            }
        };
    }, []);

    // ── Swap tile layer on theme change ────────────────────────────────────

    useEffect(() => {
        if (!mapInst.current || !tileRef.current) return;
        const swap = async () => {
            const L   = (await import('leaflet')).default;
            const map = mapInst.current!;
            if (tileRef.current) map.removeLayer(tileRef.current);
            const url = theme === 'dark'
                ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
            tileRef.current = L.tileLayer(url, {
                attribution: '&copy; OpenStreetMap &copy; CARTO',
                subdomains: 'abcd',
                maxZoom: 20,
            }).addTo(map);
            tileRef.current.bringToBack();
        };
        swap();
    }, [theme]);

    // ── Re-render markers whenever visible set changes ─────────────────────

    useEffect(() => {
        if (!markerLayer.current || !mapInst.current) return;

        const renderMarkers = async () => {
            const L = (await import('leaflet')).default;
            const layer = markerLayer.current!;
            layer.clearLayers();

            visible.forEach(f => {
                const colour = elevColour(f.elevation);
                const icon = L.divIcon({
                    className: '',
                    html: factoryIconSvg(colour, f.isActive),
                    iconSize: [28, 28],
                    iconAnchor: [14, 28],
                    tooltipAnchor: [14, -28],
                });

                const marker = L.marker([f.lat, f.lng], { icon })
                    .bindTooltip(tooltipHtml(f), {
                        direction: 'top',
                        offset: [0, -4],
                        opacity: 1,
                        className: 'factory-glass-tooltip',
                        sticky: false,
                    });

                marker.on('mouseover', (e: any) => {
                    const el = e.target.getElement() as HTMLElement | undefined;
                    if (el) {
                        const wrapper = el.querySelector('.factory-icon-wrapper') as HTMLElement | null;
                        if (wrapper) {
                            wrapper.style.transform = 'scale(1.45) perspective(300px) rotateX(14deg)';
                            wrapper.style.filter = `drop-shadow(0 4px 12px ${colour}cc)`;
                        }
                    }
                    e.target.openTooltip();
                });
                marker.on('mouseout', (e: any) => {
                    const el = e.target.getElement() as HTMLElement | undefined;
                    if (el) {
                        const wrapper = el.querySelector('.factory-icon-wrapper') as HTMLElement | null;
                        if (wrapper) {
                            wrapper.style.transform = '';
                            wrapper.style.filter = `drop-shadow(0 2px 6px ${colour}88)`;
                        }
                    }
                    e.target.closeTooltip();
                });

                layer.addLayer(marker);
            });
        };

        renderMarkers();
    }, [visible]);

    // ── Handlers ───────────────────────────────────────────────────────────

    const handleFiltersChange = useCallback((f: FilterState) => setFilters(f), []);
    const handleReset = useCallback(() => setFilters(EMPTY_FILTERS), []);

    // ── Render ─────────────────────────────────────────────────────────────

    return (
        <div className="relative h-full w-full bg-gray-950">
            {/* Map canvas */}
            <div ref={mapRef} className="h-full w-full z-0" />

            {/* Loading overlay */}
            {isLoading && (
                <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-gray-950/80 backdrop-blur-sm">
                    <div className="text-center space-y-3">
                        <div className="relative mx-auto w-14 h-14">
                            <div className="absolute inset-0 rounded-full border-4 border-green-500/20 animate-ping" />
                            <div className="absolute inset-0 rounded-full border-4 border-t-green-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                            <div className="absolute inset-2 flex items-center justify-center text-xl">🏭</div>
                        </div>
                        <p className="text-green-400 text-sm font-medium tracking-widest uppercase animate-pulse">
                            Loading factories…
                        </p>
                    </div>
                </div>
            )}

            {/* Filter Panel */}
            <FactoryFilterPanel
                filters={filters}
                options={filterOptions}
                total={allFactories.length}
                filtered={visible.length}
                onChange={handleFiltersChange}
                onReset={handleReset}
            />

            {/* Stats badge (top-right) */}
            <div className="absolute top-4 right-4 z-[1000] bg-gray-900/90 backdrop-blur-md border border-gray-700 rounded-xl px-4 py-2.5 shadow-xl">
                <div className="flex items-center gap-3 text-sm">
                    <span className="text-2xl">🏭</span>
                    <div>
                        <div className="text-white font-bold leading-tight">
                            {visible.length.toLocaleString()}
                            <span className="text-gray-400 font-normal text-xs"> / {allFactories.length.toLocaleString()}</span>
                        </div>
                        <div className="text-gray-400 text-xs">Factories shown</div>
                    </div>
                </div>
            </div>

            {/* Tooltip + icon hover styles */}
            <style>{`
                .factory-glass-tooltip {
                    background: transparent !important;
                    border: none !important;
                    padding: 0 !important;
                    box-shadow: none !important;
                }
                .factory-glass-tooltip::before {
                    display: none !important;
                }
                .factory-icon-wrapper {
                    transition: transform 0.15s ease, filter 0.15s ease;
                }
                .leaflet-tooltip.factory-glass-tooltip {
                    margin-top: 0;
                }
            `}</style>
        </div>
    );
}
