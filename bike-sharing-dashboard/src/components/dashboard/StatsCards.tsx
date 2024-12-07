import { Battery, Bike, MapPin } from 'lucide-react';
import React from 'react';

interface StatsCardsProps {
    bikes: {
        total: number;
        regular: number;
        electric: number;
        ebikes: Array<{
            bike_id: string;
            current_range_meters: number;
            lat: number;
            lon: number;
            is_reserved: boolean;
            is_disabled: boolean;
            vehicle_type_id: 'bbe';
    }>;
  };
  stations: {
    total: number;
    active: number;
  };
  locations: string[];
  onViewDetails: (index: number) => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ bikes, locations, onViewDetails }) => {
  const stats = [
    {
      title: "Available Bikes",
      value: bikes.total,
      icon: Bike,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      title: "E-Bikes Available",
      value: bikes.electric,
      icon: Battery,
      color: "text-green-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      title: "Active Locations",
      value: locations.length,
      icon: MapPin,
      description: "Click to view by location",
      color: "text-purple-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`${stat.bgColor} ${stat.borderColor} border-2 rounded-xl p-6 cursor-pointer 
            transition-all duration-300 hover:scale-105 hover:shadow-lg 
            transform hover:-translate-y-1 relative overflow-hidden`}
          onClick={() => onViewDetails(index)}
        >
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-semibold text-gray-700">{stat.title}</span>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div className={`text-3xl font-bold ${stat.color} mb-2`}>
              {stat.value}
            </div>
            <div className="text-xs text-gray-600 font-medium">
              {stat.description}
            </div>
          </div>
          <div className={`absolute top-0 right-0 w-16 h-16 -mr-6 -mt-6 rounded-full opacity-10 ${stat.color.replace('text', 'bg')}`} />
        </div>
      ))}
    </div>
  );
};