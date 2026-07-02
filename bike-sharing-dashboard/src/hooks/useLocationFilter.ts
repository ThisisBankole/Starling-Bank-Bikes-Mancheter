
import { useState, useMemo } from 'react';
import { Station } from '../types';

export interface FilterOptions {
  hasAvailableBikes: boolean;
  hasEbikes: boolean;
  isActive: boolean;
}

export type SortOption = 'bikes' | 'ebikes' | 'name' | 'nearest';

export interface UserLocation {
  lat: number;
  lon: number;
}

export const distanceKm = (from: UserLocation, to: { lat: number; lon: number }) => {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(to.lat - from.lat);
  const dLon = toRad(to.lon - from.lon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

export const useLocationFilter = (stations: Station[], userLocation: UserLocation | null = null) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('nearest');
  const [filters, setFilters] = useState<FilterOptions>({
    hasAvailableBikes: false,
    hasEbikes: false,
    isActive: true,
  });

  const filteredStations = useMemo(() => {
    if (!stations) return [];

    const filtered = stations.filter(station => {
      const matchesSearch = station.name.toLowerCase().includes(searchTerm.toLowerCase());
      const hasAvailableBikes = station.status?.num_bikes_available > 0;

      const hasEbikes = station.status?.num_ebikes_available > 0;
      const isActive = station.status?.is_renting && station.status?.is_installed;

      return matchesSearch &&
        (!filters.hasAvailableBikes || hasAvailableBikes) &&
        (!filters.hasEbikes || hasEbikes) &&
        (!filters.isActive || isActive);
    });

    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'ebikes':
        filtered.sort((a, b) => (b.status?.num_ebikes_available ?? 0) - (a.status?.num_ebikes_available ?? 0));
        break;
      case 'nearest':
        if (userLocation) {
          filtered.sort((a, b) => distanceKm(userLocation, a) - distanceKm(userLocation, b));
        } else {
          // No location (yet) — most bikes is the sensible interim order
          filtered.sort((a, b) => (b.status?.num_bikes_available ?? 0) - (a.status?.num_bikes_available ?? 0));
        }
        break;
      case 'bikes':
      default:
        filtered.sort((a, b) => (b.status?.num_bikes_available ?? 0) - (a.status?.num_bikes_available ?? 0));
    }

    return filtered;
  }, [stations, searchTerm, filters, sortBy, userLocation]);

  return {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    filteredStations
  };
};
