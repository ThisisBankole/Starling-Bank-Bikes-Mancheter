import { useState, useEffect } from 'react';
import config from '../config';

interface LatestSnapshot {
  timestamp: string;
  bikes: {
    total: number;
    available: number;
    reserved: number;
    disabled: number;
  };
  stations: {
    total: number;
    active: number;
    total_bikes: number;
    total_ebikes: number;
  };
}

interface HistoryDataPoint {
  timestamp: string;
  bikes_available: number;
  stations_active: number;
  total_bikes_at_stations: number;
}

interface PopularStation {
  station_id: string;
  name: string;
  average_bikes: number;
}

export const useLatestSnapshot = () => {
  const [data, setData] = useState<LatestSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${config.API_URL}/snapshots/latest`);
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); 
    return () => clearInterval(interval);
  }, []);

  return { data, loading, error };
};

export const useSnapshotHistory = (hours: number = 24) => {
  const [data, setData] = useState<HistoryDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${config.API_URL}/snapshots/history?hours=${hours}`);
        const result = await response.json();
        setData(result.history || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 300_000);
    return () => clearInterval(interval);
  }, [hours]);

  return { data, loading, error };
};

export const usePopularStations = (limit: number = 10) => {
  const [data, setData] = useState<PopularStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${config.API_URL}/stations/popular?limit=${limit}`);
        const result = await response.json();
        setData(result.popular_stations || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 300_000);
    return () => clearInterval(interval);
  }, [limit]);

  return { data, loading, error };
};