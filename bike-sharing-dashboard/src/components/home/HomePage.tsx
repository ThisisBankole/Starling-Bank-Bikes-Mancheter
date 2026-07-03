import { useState, lazy, Suspense } from 'react';
import { StatsCards } from '../dashboard/StatsCards';
import { useBikeData } from '../../hooks/useBikeData';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, Code } from 'lucide-react';
import { useCity } from '../../context/CityContext';
import { CitySelect } from '../ui/city-select';
import { Logo } from '../ui/logo';

const PopularStationsAnalytics = lazy(() => import('../dashboard/PopularStationAnalytics'));
const InteractiveMap = lazy(() => import('../dashboard/InteractiveMap'));
const HistoryChart = lazy(() => import('../dashboard/HistoryChart'));

const ComponentSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
    <div className="h-64 bg-gray-200 rounded"></div>
  </div>
);

const HomePage = () => {
    const navigate = useNavigate();
    const { cityInfo } = useCity();
    const { bikes, stations, locations, activeStations, lastUpdated, loading, error} = useBikeData();

    const [, setShowDetails] = useState(false);
    const [, setSelectedCardIndex] = useState<number | null>(null);

    if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    if (error) return <div className="text-red-500 text-center">{error}</div>;

    const handleViewDetails = (index: number) => {
      setSelectedCardIndex(index);
      setShowDetails(true);
      
      if (index == 2) {
        navigate('/locations')
      }
    };
  
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <header className="border-b border-gray-200 bg-white">
          <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-4">
            <Logo />
            <div className="flex w-full sm:w-auto items-center gap-4">
              <CitySelect className="w-full sm:w-64" />
              <Link
                to="/docs"
                className="flex shrink-0 items-center gap-1.5 text-sm text-gray-600 transition-colors hover:text-blue-600"
              >
                <BookOpen className="h-4 w-4" />
                Docs
              </Link>
            </div>
          </div>
        </header>
        <div className="container mx-auto py-8 px-4">
          <div className="flex flex-col gap-8">
            <div className="text-center md:text-left">
              <p className="text-sm sm:text-base md:text-lg text-gray-600">
                Real-time monitoring of the {cityInfo?.name ?? 'Manchester'} network
              </p>
              {lastUpdated && (
                <p className="mt-1 flex items-center justify-center md:justify-start gap-1.5 text-xs text-gray-400">
                  <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  Live
                </p>
              )}
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
              <HistoryChart />
            </Suspense>

            <Suspense fallback={<ComponentSkeleton />}>
              <PopularStationsAnalytics activeStations={activeStations} />
            </Suspense>

            <footer className="pb-4 text-center">
              <Link
                to="/docs"
                className="inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-blue-500"
              >
                <Code className="h-4 w-4" />
                Data &amp; Docs
              </Link>
            </footer>
          </div>
        </div>
      </div>
    );
  };
  
  export default HomePage;