'use client';

import { useEffect, useRef } from 'react';
import type { Map, LayerGroup, FeatureGroup } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

interface TeaEstate {
    id: number;
    name: string;
    position: [number, number];
    area: number;
}

// Sample tea estate locations in Sri Lanka
const teaEstates: TeaEstate[] = [
    { id: 1, name: 'Nuwara Eliya Estate', position: [6.9497, 80.7891], area: 150 },
    { id: 2, name: 'Kandy Hills Estate', position: [7.2906, 80.6337], area: 200 },
    { id: 3, name: 'Uva Province Estate', position: [6.7500, 81.0500], area: 180 },
    { id: 4, name: 'Dimbula Estate', position: [7.0500, 80.6000], area: 220 },
    { id: 5, name: 'Ratnapura Estate', position: [6.6828, 80.4014], area: 120 },
];

export default function TeaMap() {
    console.log("TeaMap: Rendering...");
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<Map | null>(null);
    const drawnItemsRef = useRef<FeatureGroup | null>(null);

    useEffect(() => {
        if (!mapContainerRef.current) return;
        if (mapInstanceRef.current) return; // Map already initialized

        console.log("TeaMap: Initializing Leaflet map with Draw tools...");

        const initMap = async () => {
            try {
                // Dynamic import to support Next.js SSR
                const L = (await import('leaflet')).default;
                await import('leaflet-draw'); // Import side-effects
                const turfArea = (await import('@turf/area')).default;

                // Cleanup existing map if somehow present on the DOM element
                // @ts-ignore
                if (mapContainerRef.current._leaflet_id) {
                    // This is the manual cleanup check react-leaflet misses
                    // @ts-ignore
                    mapContainerRef.current._leaflet_id = null;
                }

                // Default Icon Fix
                // @ts-ignore
                delete L.Icon.Default.prototype._getIconUrl;
                L.Icon.Default.mergeOptions({
                    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
                    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                });

                // Initialize Map
                const map = L.map(mapContainerRef.current!).setView([7.0, 80.7], 9);
                mapInstanceRef.current = map;

                // Add Tile Layer
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(map);

                // Initialize FeatureGroup to store editable layers
                const drawnItems = new L.FeatureGroup();
                map.addLayer(drawnItems);
                drawnItemsRef.current = drawnItems;

                // Add Draw Control
                const drawControl = new L.Control.Draw({
                    draw: {
                        polygon: true,
                        polyline: false,
                        rectangle: false,
                        circle: false,
                        circlemarker: false,
                        marker: false
                    },
                    edit: {
                        featureGroup: drawnItems
                    }
                });
                map.addControl(drawControl);

                // Handle Draw Created Event
                map.on(L.Draw.Event.CREATED, (e: any) => {
                    const layer = e.layer;
                    drawnItems.addLayer(layer);

                    // Calculate Area
                    const geoJson = layer.toGeoJSON();
                    const areaSqMeters = turfArea(geoJson);
                    const areaHectares = (areaSqMeters / 10000).toFixed(2);

                    console.log(`TeaMap: Polygon created. Area: ${areaHectares} ha`);

                    // Bind Popup with Save Button
                    const popupContent = document.createElement('div');
                    popupContent.innerHTML = `
                        <div class="p-2">
                            <h3 class="font-bold text-lg mb-2">New Estate</h3>
                            <p class="text-sm text-gray-600 mb-2"><strong>Calculated Area:</strong> ${areaHectares} hectares</p>
                            <div class="flex flex-col gap-2">
                                <input type="text" id="estateName" placeholder="Enter Estate Name" class="border p-1 rounded text-sm w-full" />
                                <button id="saveBtn" class="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm w-full">Save Estate</button>
                            </div>
                        </div>
                    `;

                    // Handle Click on Save Button inside Popup
                    const saveBtn = popupContent.querySelector('#saveBtn');
                    if (saveBtn) {
                        // We need to delay attachment or use a delegation approach, but binding to element works if we do it right
                        // Since popup content is just HTML string usually, Leaflet binds it. 
                        // To attach events, we bind the element itself.
                        saveBtn.addEventListener('click', async () => {
                            const nameInput = popupContent.querySelector('#estateName') as HTMLInputElement;
                            const name = nameInput?.value || "Unnamed Estate";

                            try {
                                saveBtn.textContent = "Saving...";
                                // @ts-ignore
                                saveBtn.disabled = true;

                                const response = await fetch('http://localhost:8000/api/tea-lands/estates', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        name: name,
                                        geometry: geoJson.geometry,
                                        area_hectares: parseFloat(areaHectares),
                                        properties: geoJson.properties
                                    }),
                                });

                                if (response.ok) {
                                    alert(`Estate "${name}" saved successfully!`);
                                    layer.closePopup();
                                } else {
                                    throw new Error("Failed to save");
                                }
                            } catch (err) {
                                console.error("Save error:", err);
                                alert("Error saving estate. Check backend connection.");
                                saveBtn.textContent = "Save Estate";
                                // @ts-ignore
                                saveBtn.disabled = false;
                            }
                        });
                    }

                    layer.bindPopup(popupContent).openPopup();
                });

                // Add Markers and Circles (Existing)
                teaEstates.forEach(estate => {
                    L.marker(estate.position)
                        .addTo(map)
                        .bindPopup(`
                            <div class="p-2">
                                <h3 class="font-bold text-lg">${estate.name}</h3>
                                <p class="text-sm text-gray-600">Area: ${estate.area} hectares</p>
                                <p class="text-sm text-gray-600">
                                    Coordinates: ${estate.position[0].toFixed(4)}, ${estate.position[1].toFixed(4)}
                                </p>
                            </div>
                        `);

                    L.circle(estate.position, {
                        color: '#16a34a',
                        fillColor: '#22c55e',
                        fillOpacity: 0.2,
                        radius: estate.area * 30
                    }).addTo(map);
                });

            } catch (error) {
                console.error("TeaMap: Error initializing map", error);
            }
        };

        initMap();

        // Cleanup function
        return () => {
            if (mapInstanceRef.current) {
                console.log("TeaMap: Cleaning up map instance");
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    return (
        <div
            ref={mapContainerRef}
            className="h-full w-full z-0"
            style={{ minHeight: '400px' }}
        />
    );
}
