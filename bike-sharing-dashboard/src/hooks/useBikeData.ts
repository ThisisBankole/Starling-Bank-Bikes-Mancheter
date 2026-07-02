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
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      let cancelled = false;

      const fetchData = async () => {
        try {
          const [bikesRes, ebikesRes, activeStationsRes] = await Promise.all([
            fetch(`${config.API_URL}/bikes`),
            fetch(`${config.API_URL}/ebikes`),
            fetch(`${config.API_URL}/stations/active`)
          ]);

          const [bikesData, ebikesData, activeStationsData] = await Promise.all([
            bikesRes.json(),
            ebikesRes.json(),
            activeStationsRes.json()
          ]);

          if (cancelled) return;

          if (!activeStationsData?.stations) {
              setError('Station data unavailable');
              return;
          }

          const allBikes = bikesData.data || [];
          const availableEbikes = (ebikesData.ebikes || []).filter((bike: EBike) =>
            !bike.is_reserved && !bike.is_disabled
          );

          setBikes(allBikes);
          setEbikes(availableEbikes);
          setActiveStations(activeStationsData.stations || []);
          setLastUpdated(bikesData.last_updated ?? null);
          setError(null);

        } catch (err) {
          if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to fetch data');
        } finally {
          if (!cancelled) setLoading(false);
        }
      };

      fetchData();
      // Silent refresh: loading stays false, so the page doesn't flash
      const interval = setInterval(fetchData, 60_000);
      return () => {
        cancelled = true;
        clearInterval(interval);
      };
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
      lastUpdated,
      loading,
      error
    };
};