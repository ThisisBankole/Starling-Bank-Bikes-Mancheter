// hooks/useLocationFilter.ts
import { useState, useMemo } from 'react';
import { Station } from '../types';

export interface FilterOptions {
  hasAvailableBikes: boolean;
  hasEbikes: boolean;
  isActive: boolean;
}

export const useLocationFilter = (stations: Station[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    hasAvailableBikes: false,
    hasEbikes: false,
    isActive: true,
  });

  const filteredStations = useMemo(() => {
    if (!stations) return [];
    
    return stations.filter(station => {
      const matchesSearch = station.name.toLowerCase().includes(searchTerm.toLowerCase());
      const hasAvailableBikes = station.status?.num_bikes_available > 0;
      const hasEbikes = station.status?.vehicle_types_available.some(
        vt => vt.vehicle_type_id === 'bbe' && vt.count > 0
      );
      const isActive = station.status?.is_renting && station.status?.is_installed;

      return matchesSearch &&
        (!filters.hasAvailableBikes || hasAvailableBikes) &&
        (!filters.hasEbikes || hasEbikes) &&
        (!filters.isActive || isActive);
    });
  }, [stations, searchTerm, filters]);

  return {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    filteredStations
  };
};