import { useState, useEffect } from 'react';
import config  from '../config';
import { Bike, EBike, Station } from '../types';


// interface ApiResponse<T> {
//     last_updated: number;
//     ttl: number;
//     version: string;
//     data: T;
// }

export const useBikeData = () => {
    const [bikes, setBikes] = useState<Bike[]>([]);
    const [ebikes, setEbikes] = useState<EBike[]>([]);
    const [activeStations, setActiveStations] = useState<Station[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
  
    useEffect(() => {
      const fetchData = async () => {
        try {
          console.log('Starting fetch...');
      
          const [bikesRes, ebikesRes, activeStationsRes] = await Promise.all([
            fetch(`${config.API_URL}/bikes`),
            fetch(`${config.API_URL}/ebikes`),
            fetch(`${config.API_URL}/stations/active`)  // New endpoint
          ]);
  
          console.log('Fetched data from API');
  
          const [bikesData, ebikesData, activeStationsData] = await Promise.all([
            bikesRes.json(),
            ebikesRes.json(),
            activeStationsRes.json()
          ]);
  
          console.log('Data parsed:', bikesData, ebikesData, activeStationsData);
  
          if (!activeStationsData?.stations) {
              console.error('Missing stations data structure:', activeStationsData);
              return;
          }
  
          const allBikes = bikesData.data || [];
          const availableEbikes = ebikesData.ebikes.filter((bike: EBike) => 
            !bike.is_reserved && !bike.is_disabled
          );
  
          setBikes(allBikes);
          setEbikes(availableEbikes);
          setActiveStations(activeStationsData.stations || []);

        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to fetch data');
        } finally {
          setLoading(false);
        }
      };
  
      fetchData();
    }, []);
  
    return {
      bikes: {
        total: bikes.filter(bike => !bike.is_reserved && !bike.is_disabled).length,
        regular: bikes.filter(bike => !bike.is_reserved && !bike.is_disabled && bike.vehicle_type_id === 'beryl_bike').length,
        electric: ebikes.filter(bike => !bike.is_reserved && !bike.is_disabled).length,
        ebikes: ebikes.filter(bike => !bike.is_reserved && !bike.is_disabled)
      },
      stations: {
        total: activeStations.length,
        active: activeStations.filter(station => 
          station.status?.is_installed && station.status?.is_renting
        ).length
      },
      locations: activeStations.map(station => station.name),
      activeStations,  // Add this if you need the full station data with status
      loading,
      error
    };
};