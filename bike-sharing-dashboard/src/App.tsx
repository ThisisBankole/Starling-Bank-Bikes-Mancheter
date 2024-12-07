// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import HomePage from './components/home/HomePage';
import { LocationsPage } from './components/locations/LocationsPage';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/locations" element={<LocationsPage />} />
    </Routes>
  );
};

export default App;