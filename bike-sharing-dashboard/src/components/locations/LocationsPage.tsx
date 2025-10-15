import { useBikeData } from '../../hooks/useBikeData';
import { useLocationFilter } from '../../hooks/useLocationFilter';
import { FilterBar } from './FilterBar';
import { LocationCard } from './LocationCard';
import { SearchBar } from './SearchBar';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react'
import { useState } from 'react';

const ITEMS_PER_PAGE = 18;

const LocationsPage = () => {
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
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1 sm:space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold">Locations</h1>
                <p className="text-sm sm:text-base text-gray-500">
                    {filteredStations.length} locations found
                </p>
                </div>

                <button
                    onClick={() => navigate('/')}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    <Home className="h-4 w-4" />
                    <span className="sm:inline">Back to Dashboard</span>
                </button>
            </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center w-full">
        <div className="w-full sm:w-2/3">
              <SearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
            />
        </div>
        <div className="w-full sm:w-1/3">
            <FilterBar
            filters={filters}
            onFilterChange={setFilters}
            />
        </div>

      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {paginatedStations.map((station) => (
          <LocationCard key={station.station_id} station={station} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className='flex flex-wrap justify-center gap-2 mt-4 sm:mt-6'>
            <button
                onClick={() => setCurrentPage((prev: number) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded bg-blue-100 text-blue-600 disabled:opacity-50 text-sm sm:text-base"
          >
            Previous
          </button>

          <div className="flex flex-wrap gap-2 justify-center">
            {[...Array(totalPages)].map((_, index) => {
              // Show first page, last page, and pages around current page
              if (
                index === 0 ||
                index === totalPages - 1 ||
                (index >= currentPage - 2 && index <= currentPage + 2)
              ) {
                return (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`px-3 py-1 rounded text-sm sm:text-base ${
                      currentPage === index + 1 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-blue-100 text-blue-600'
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              } else if (
                index === currentPage - 3 ||
                index === currentPage + 3
              ) {
                return <span key={index} className="px-2">...</span>;
              }
              return null;
            })}
          </div>

        <button
            onClick={() => setCurrentPage((prev:number) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded bg-blue-100 text-blue-600 disabled:opacity-50 text-sm sm:text-base"
          >
            Next
          </button>     

        </div>  
    )}
    </div>
  );
};

export default LocationsPage;