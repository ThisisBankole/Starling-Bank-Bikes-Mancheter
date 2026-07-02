import { Bike, Zap, Navigation } from "lucide-react";
import { Station } from "../../types";

interface LocationCardProps {
    station: Station;
    distanceKm?: number;
  }

  export const LocationCard = ({ station, distanceKm }: LocationCardProps) => {
    const numBikes = station.status?.num_bikes_available || 0;
    const numEbikes = station.status?.num_ebikes_available || 0;
    const isOpen = !!station.status?.is_renting;
    const fillPercent = station.capacity > 0
      ? Math.min((numBikes / station.capacity) * 100, 100)
      : 0;
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lon}&travelmode=walking`;

    return (
      <div className="flex flex-col gap-3 p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-medium leading-tight">{station.name}</h3>
          <span className={`flex items-center gap-1.5 whitespace-nowrap text-xs font-medium ${isOpen ? 'text-green-600' : 'text-red-500'}`}>
            <span className={`h-2 w-2 rounded-full ${isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
            {isOpen ? 'Open' : 'Closed'}
          </span>
        </div>

        <div className="flex items-end gap-6">
          <div>
            <div className="flex items-center gap-1.5">
              <Bike className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold text-gray-900">{numBikes}</span>
            </div>
            <span className="text-xs text-gray-500">bikes</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <Zap className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold text-gray-900">{numEbikes}</span>
            </div>
            <span className="text-xs text-gray-500">e-bikes</span>
          </div>
          {distanceKm !== undefined && (
            <div className="ml-auto text-right">
              <span className="text-sm font-semibold text-gray-900">
                {distanceKm < 1 ? `${Math.round(distanceKm * 1000)} m` : `${distanceKm.toFixed(1)} km`}
              </span>
              <div className="text-xs text-gray-500">away</div>
            </div>
          )}
        </div>

        <div>
          <div className="h-2 w-full rounded-full bg-gray-100">
            <div
              className="h-2 rounded-full bg-blue-500 transition-all"
              style={{ width: `${fillPercent}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">{numBikes} / {station.capacity} capacity</p>
        </div>

        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Navigation className="h-4 w-4" />
          Directions
        </a>
      </div>
    );
  };
