import { useState } from 'react';
import { StatsCards } from '../dashboard/StatsCards';
import { useBikeData } from '../../hooks/useBikeData';
import { useNavigate } from 'react-router-dom';
import PopularStationsAnalytics from '../dashboard/PopularStationAnalytics';
import InteractiveMap from '../dashboard/InteractiveMap';


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

            <InteractiveMap/>   

           

            <PopularStationsAnalytics activeStations={activeStations} />

             
          </div>
        </div>
      </div>
    );
  };
  
  export default HomePage;