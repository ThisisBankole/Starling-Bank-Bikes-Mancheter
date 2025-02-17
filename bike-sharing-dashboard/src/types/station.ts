
export interface Station {
  station_id: string;
  name: string;
  lat: number;
  lon: number;
  capacity: number;
  status: {
    num_bikes_available: number;
    num_docks_available: number;
    is_installed: boolean;
    is_renting: boolean;
    is_returning: boolean;
  };
}
