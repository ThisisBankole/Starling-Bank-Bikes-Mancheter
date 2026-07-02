import { useBikeData } from '../../hooks/useBikeData';
import { useLocationFilter, distanceKm, SortOption, UserLocation } from '../../hooks/useLocationFilter';
import { FilterBar } from './FilterBar';
import { LocationCard } from './LocationCard';
import { SearchBar } from './SearchBar';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowUpDown, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CitySelect } from '../ui/city-select';

const ITEMS_PER_PAGE = 18;

const LocationsPage = () => {
  const navigate = useNavigate();
  const { activeStations, loading, error } = useBikeData();
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    filteredStations
  } = useLocationFilter(activeStations || [], userLocation);

  // Back to the top of the list whenever the result set changes shape
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [searchTerm, filters, sortBy]);

  // Default sort is "nearest": ask for location once on load. If the user
  // declines (or it fails), quietly fall back to most-bikes — the explicit
  // dropdown path still surfaces errors via geoError.
  useEffect(() => {
    if (!navigator.geolocation) {
      setSortBy('bikes');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => setSortBy('bikes')
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSortChange = (value: string) => {
    if (value !== 'nearest') {
      setSortBy(value as SortOption);
      return;
    }
    if (userLocation) {
      setSortBy('nearest');
      return;
    }
    if (!navigator.geolocation) {
      setGeoError('Location is not supported by this browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setGeoError(null);
        setSortBy('nearest');
      },
      () => setGeoError('Could not get your location — check browser permissions')
    );
  };

  const clearAll = () => {
    setSearchTerm('');
    setFilters({ hasAvailableBikes: false, hasEbikes: false, isActive: true });
  };

  const visibleStations = filteredStations.slice(0, visibleCount);
  const stationsWithBikes = filteredStations.filter(s => (s.status?.num_bikes_available ?? 0) > 0).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded-lg">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-bold">Locations</h1>
                <p className="flex items-center gap-1.5 text-sm text-gray-500">
                    <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    Live &middot; {filteredStations.length} stations &middot; {stationsWithBikes} with bikes
                </p>
                </div>

                <div className="flex w-full sm:w-auto flex-col sm:flex-row gap-2">
                    <CitySelect className="w-full sm:w-64" />
                    <button
                        onClick={() => navigate('/')}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        <Home className="h-4 w-4" />
                        <span className="sm:inline">Back to Dashboard</span>
                    </button>
                </div>
            </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center w-full">
        <div className="w-full sm:w-2/3">
              <SearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
            />
        </div>
        <div className="relative w-full sm:w-1/3">
            <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              aria-label="Sort stations"
              className="w-full appearance-none p-3 pl-9 pr-9 border rounded-lg bg-card shadow-sm text-sm"
            >
              <option value="bikes">Most bikes</option>
              <option value="ebikes">Most e-bikes</option>
              <option value="name">Name A&ndash;Z</option>
              <option value="nearest">Nearest to me</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      </div>

      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
      />

      {geoError && (
        <p className="text-sm text-red-500">{geoError}</p>
      )}

      {filteredStations.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-10 text-center">
          <p className="text-gray-500">No stations match your search and filters.</p>
          <button onClick={clearAll} className="mt-2 text-sm text-blue-500 hover:underline">
            Clear search and filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleStations.map((station) => (
              <LocationCard
                key={station.station_id}
                station={station}
                distanceKm={userLocation ? distanceKm(userLocation, station) : undefined}
              />
            ))}
          </div>

          <div className="flex flex-col items-center gap-2 mt-4 sm:mt-6">
            {visibleCount < filteredStations.length && (
              <button
                onClick={() => setVisibleCount((count) => count + ITEMS_PER_PAGE)}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600 transition-colors"
              >
                Load {Math.min(ITEMS_PER_PAGE, filteredStations.length - visibleCount)} more
              </button>
            )}
            <p className="text-xs text-gray-400">
              Showing {visibleStations.length} of {filteredStations.length}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default LocationsPage;
