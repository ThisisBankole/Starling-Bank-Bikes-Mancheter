import { MapPin, ChevronDown } from 'lucide-react';
import { useCity } from '../../context/CityContext';

export const CitySelect = ({ className = '' }: { className?: string }) => {
  const { city, setCity, cities } = useCity();

  if (cities.length < 2) return null;

  return (
    <div className={`relative ${className}`}>
      <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <select
        value={city}
        onChange={(e) => setCity(e.target.value)}
        aria-label="Choose city"
        className="w-full appearance-none rounded-lg border bg-white p-2.5 pl-9 pr-9 text-sm shadow-sm"
      >
        {cities.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
    </div>
  );
};
