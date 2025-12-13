'use client';

import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Next.js
import L from 'leaflet';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Sample tea estate locations in Sri Lanka
const teaEstates = [
    { id: 1, name: 'Nuwara Eliya Estate', position: [6.9497, 80.7891] as LatLngExpression, area: 150 },
    { id: 2, name: 'Kandy Hills Estate', position: [7.2906, 80.6337] as LatLngExpression, area: 200 },
    { id: 3, name: 'Uva Province Estate', position: [6.7500, 81.0500] as LatLngExpression, area: 180 },
    { id: 4, name: 'Dimbula Estate', position: [7.0500, 80.6000] as LatLngExpression, area: 220 },
    { id: 5, name: 'Ratnapura Estate', position: [6.6828, 80.4014] as LatLngExpression, area: 120 },
];

export default function MapComponent() {
    // Center of Sri Lanka's tea country (Nuwara Eliya)
    const center: LatLngExpression = [7.0, 80.7];
    const zoom = 9;

    return (
        <MapContainer
            center={center}
            zoom={zoom}
            className="h-full w-full"
            scrollWheelZoom={true}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Alternative: Satellite view */}
            {/* <TileLayer
        attribution='Tiles &copy; Esri'
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      /> */}

            {/* Tea Estate Markers and Circles */}
            {teaEstates.map((estate) => (
                <div key={estate.id}>
                    {/* Marker for estate location */}
                    <Marker position={estate.position}>
                        <Popup>
                            <div className="p-2">
                                <h3 className="font-bold text-lg">{estate.name}</h3>
                                <p className="text-sm text-gray-600">Area: {estate.area} hectares</p>
                                <p className="text-sm text-gray-600">
                                    Coordinates: {estate.position[0].toFixed(4)}, {estate.position[1].toFixed(4)}
                                </p>
                            </div>
                        </Popup>
                    </Marker>

                    {/* Circle representing estate boundary (approximate) */}
                    <Circle
                        center={estate.position}
                        radius={estate.area * 30} // Approximate radius based on area
                        pathOptions={{
                            color: '#16a34a',
                            fillColor: '#22c55e',
                            fillOpacity: 0.2,
                        }}
                    />
                </div>
            ))}
        </MapContainer>
    );
}
