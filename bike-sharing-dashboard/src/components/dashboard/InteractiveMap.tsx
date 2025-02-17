import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Station } from '../../types/station';
import config from '../../config';

// Greater Manchester bounds
const GM_BOUNDS: L.LatLngBoundsLiteral = [
  [53.3331, -2.5313], // Southwest corner
  [53.6895, -1.9074]  // Northeast corner
];

const createMarkerIcon = (numBikesAvailable: number, capacity: number) => {
  const ratio = numBikesAvailable / capacity;
  const bgColor = ratio > 0.5 ? 'bg-green-500' : ratio > 0 ? 'bg-orange-500' : 'bg-gray-500';
  
  return L.divIcon({
    className: `relative`,
    html: `
      <div class="relative">
        <div class="${bgColor} w-6 h-8 md:w-8 md:h-10 rounded-t-full rounded-b-full flex items-center justify-center text-white font-bold text-sm md:text-base shadow-lg">
          ${numBikesAvailable}
        </div>
        <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
          <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] ${
            ratio > 0.5 ? 'border-t-green-500' : ratio > 0 ? 'border-t-orange-500' : 'border-t-gray-500'
          }"></div>
        </div>
      </div>
    `,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -36]
  });
};

const InteractiveMap: React.FC = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLegend, setShowLegend] = useState(false);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await fetch(`${config.API_URL}/stations/active`);
        if (!response.ok) {
          throw new Error('Failed to fetch stations');
        }
        const data = await response.json();
        setStations(data.stations);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch stations');
        console.error('Error fetching stations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
    const interval = setInterval(fetchStations, 30000);
    return () => clearInterval(interval);
  }, []);

  const defaultCenter = { lat: 53.4807, lng: -2.2426 };

  if (loading) {
    return <div className="w-full h-[100vh] flex items-center justify-center">Loading stations...</div>;
  }

  if (error) {
    return <div className="w-full h-[100vh] flex items-center justify-center text-red-500">{error}</div>;
  }

  return (
    <div className="w-full h-[50vh] relative">
      <MapContainer
        center={[defaultCenter.lat, defaultCenter.lng]}
        zoom={13}
        className="w-full h-full"
        maxBounds={GM_BOUNDS}
        minZoom={11}
        maxZoom={18}
        bounds={GM_BOUNDS}
        boundsOptions={{ padding: [50, 50] }}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          bounds={GM_BOUNDS}
        />

        <ZoomControl position="topright" />

        {stations.map((station) => (
          <Marker
            key={station.station_id}
            position={[station.lat, station.lon]}
            icon={createMarkerIcon(
              station.status.num_bikes_available,
              station.capacity
            )}
          >
            <Popup className="station-popup">
              <div className="p-2 min-w-[200px] md:min-w-[250px]">
                <h3 className="font-bold mb-2 text-base md:text-lg">{station.name}</h3>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-sm md:text-base">
                    <span>Bikes Available:</span>
                    <span className="font-bold">{station.status.num_bikes_available}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm md:text-base">
                    <span>Total Capacity:</span>
                    <span className="font-bold">{station.capacity}</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="text-sm md:text-base">
                      <div>Renting: {station.status.is_renting ? '✅' : '❌'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Toggle Legend Button */}
      <button 
        onClick={() => setShowLegend(!showLegend)}
        className="absolute bottom-4 right-4 bg-white p-2 rounded-full shadow-lg z-[1000] md:hidden"
        aria-label="Toggle legend"
      >
        ℹ️
      </button>

      {/* Legend */}
      <div className={`
        absolute bottom-16 right-4 bg-white p-3 rounded-lg shadow-lg z-[1000]
        transition-all duration-300 ease-in-out
        ${showLegend ? 'opacity-100 visible' : 'opacity-0 invisible'}
        md:opacity-100 md:visible md:bottom-4
      `}>
        <h4 className="font-bold mb-2 text-sm md:text-base">Bike Availability</h4>
        <div className="space-y-2 text-xs md:text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-4 md:w-4 md:h-5 rounded-t-full rounded-b-full bg-green-500"></div>
            <span>High (50% and above)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-4 md:w-4 md:h-5 rounded-t-full rounded-b-full bg-orange-500"></div>
            <span>Low (1-50%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-4 md:w-4 md:h-5 rounded-t-full rounded-b-full bg-gray-500"></div>
            <span>None (0)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;