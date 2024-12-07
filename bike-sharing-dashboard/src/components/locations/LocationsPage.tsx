import { useBikeData } from '../../hooks/useBikeData';
import { useLocationFilter } from '../../hooks/useLocationFilter';
import { FilterBar } from './FilterBar';
import { LocationCard } from './LocationCard';
import { SearchBar } from './SearchBar';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react'
import { useState } from 'react';

const ITEMS_PER_PAGE = 18;

export const LocationsPage = () => {
  const navigate = useNavigate();
  const { activeStations, loading, error } = useBikeData();
  const [currentPage, setCurrentPage] = useState(1);
  const {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    filteredStations
  } = useLocationFilter(activeStations || []);

  // Pagination
    const totalPages = Math.ceil(filteredStations.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedStations = filteredStations.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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
    <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Locations</h1>
                <p className="text-gray-500">
                    {filteredStations.length} locations found
                </p>
                </div>

                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    <Home className="h-4 w-4" />
                    <span>Back to Dashboard</span>
                </button>
            </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
        <FilterBar
          filters={filters}
          onFilterChange={setFilters}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {paginatedStations.map((station) => (
          <LocationCard key={station.station_id} station={station} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className='flex justify-center gap-2 mt-6'>
            <button
                onClick={() => setCurrentPage((prev: number) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded bg-blue-100 text-blue-600 disabled:opacity-50"
          >
            Previous
          </button>

          {[...Array(totalPages)].map((_, index) => (
            <button
            key={index}
            onClick={() => setCurrentPage(index + 1)}
            className={`px-3 py-1 rounded ${
              currentPage === index + 1 
                ? 'bg-blue-500 text-white' 
                : 'bg-blue-100 text-blue-600'
            }`}
          >
            {index + 1}
          </button>
        ))}
        <button
            onClick={() => setCurrentPage((prev:number) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded bg-blue-100 text-blue-600 disabled:opacity-50"
          >
            Next
          </button>     

        </div>  
    )}
    </div>
  );
};