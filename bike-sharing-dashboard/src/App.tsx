
import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';


const HomePage = lazy(() => import('./components/home/HomePage'));
const LocationsPage = lazy(() => import('./components/locations/LocationsPage'));


const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500" />
  </div>
);

const App = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/locations" element={<LocationsPage />} />
      </Routes>
    </Suspense>
  );
};

export default App;