import { Station } from "../../types";

interface LocationCardProps {
    station: Station;
  }
  
  export const LocationCard = ({ station }: LocationCardProps) => {
    const numBikes = station.status?.num_bikes_available || 0;
    const numEbikes = station.status?.vehicle_types_available.find(
      vt => vt.vehicle_type_id === 'bbe'
    )?.count || 0;
  
    return (
      <div className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">{station.name}</h3>
          <div className={`w-2 h-2 rounded-full ${station.status?.is_renting ? 'bg-green-500' : 'bg-red-500'}`} />
        </div>
        <div className="space-y-1 text-sm text-gray-600">
          <div>Available Bikes: {numBikes} ({numEbikes} e-bikes)</div>
          <div>Dock Capacity: {station.capacity}</div>
        </div>
      </div>
    );
  };