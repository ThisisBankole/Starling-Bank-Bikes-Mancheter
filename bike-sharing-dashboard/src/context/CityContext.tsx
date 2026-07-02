import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import config from '../config';

export interface CityInfo {
  id: string;
  name: string;
  center: { lat: number; lon: number };
  bounds: { sw: [number, number]; ne: [number, number] };
}

interface CityContextValue {
  city: string;
  setCity: (id: string) => void;
  cities: CityInfo[];
  cityInfo: CityInfo | undefined;
}

const STORAGE_KEY = 'cycle-tracker-city';
const DEFAULT_CITY = 'manchester';

const CityContext = createContext<CityContextValue>({
  city: DEFAULT_CITY,
  setCity: () => {},
  cities: [],
  cityInfo: undefined,
});

export const CityProvider = ({ children }: { children: ReactNode }) => {
  const [city, setCityState] = useState(() => localStorage.getItem(STORAGE_KEY) ?? DEFAULT_CITY);
  const [cities, setCities] = useState<CityInfo[]>([]);

  useEffect(() => {
    fetch(`${config.API_URL}/cities`)
      .then((res) => res.json())
      .then((data) => {
        setCities(data.cities ?? []);
        // A stale stored id (e.g. a removed city) falls back to the server default
        if (data.cities?.length && !data.cities.some((c: CityInfo) => c.id === localStorage.getItem(STORAGE_KEY))) {
          setCityState((current: string) =>
            data.cities.some((c: CityInfo) => c.id === current) ? current : data.default ?? DEFAULT_CITY
          );
        }
      })
      .catch(() => setCities([]));
  }, []);

  const setCity = (id: string) => {
    localStorage.setItem(STORAGE_KEY, id);
    setCityState(id);
  };

  return (
    <CityContext.Provider
      value={{ city, setCity, cities, cityInfo: cities.find((c) => c.id === city) }}
    >
      {children}
    </CityContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCity = () => useContext(CityContext);
