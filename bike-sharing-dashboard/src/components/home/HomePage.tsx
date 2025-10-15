import { useState, lazy, Suspense } from 'react';
import { StatsCards } from '../dashboard/StatsCards';
import { useBikeData } from '../../hooks/useBikeData';
import { useNavigate } from 'react-router-dom';


const PopularStationsAnalytics = lazy(() => import('../dashboard/PopularStationAnalytics'));
const InteractiveMap = lazy(() => import('../dashboard/InteractiveMap'));


const ComponentSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
    <div className="h-64 bg-gray-200 rounded"></div>
  </div>
);

const HomePage = () => {
    const navigate = useNavigate();
    const { bikes, stations, locations, activeStations, loading, error} = useBikeData();

    const [, setShowDetails] = useState(false);
    const [, setSelectedCardIndex] = useState<number | null>(null);

    if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    if (error) return <div className="text-red-500 text-center">{error}</div>;

  
  
  
    const handleViewDetails = (index: number) => {
      setSelectedCardIndex(index);
      setShowDetails(true);
      
      
      // const details = [
      //   `Total bikes: ${bikes.total} (${bikes.regular} regular, ${bikes.electric} electric)`,
      //   `Total bikes: ${bikes.total} (${bikes.regular} regular, ${bikes.electric} electric)`,
      //   `E-bikes range: ${bikes.ebikes.map(bike => 
      //     `${bike.bike_id}: ${bike.current_range_meters}m`).join(', ')}`,
      //   `Locations: ${locations.join(', ')}`
      // ];

      if (index == 2) {
        navigate('/locations')
      }
      
  
    };
  
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="container mx-auto py-8 px-4">
          <div className="flex flex-col gap-8">
            <div className="text-center md:text-left">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent mb-2 md:mb-4">
                Starling Bikes Manchester
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-gray-600">
                Real-time monitoring of the network
              </p>
            </div>

            
            
  
            <StatsCards
              bikes={bikes}
              stations={stations}
              locations={locations}
              onViewDetails={handleViewDetails}
            />

          
            <Suspense fallback={<ComponentSkeleton />}>
              <InteractiveMap/>   
            </Suspense>

           

         
            <Suspense fallback={<ComponentSkeleton />}>
              <PopularStationsAnalytics activeStations={activeStations} />
            </Suspense>

             
          </div>
        </div>
      </div>
    );
  };
  
  export default HomePage;