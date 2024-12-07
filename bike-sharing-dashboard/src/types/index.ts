
export interface Bike {
    bike_id: string;
    is_reserved: boolean;
    is_disabled: boolean;
    vehicle_type_id: string;
    lat: number;
    lon: number;
    station_id: string;
    current_range_meters?: number;
}

export interface EBike extends Bike {
    vehicle_type_id: 'bbe';
    current_range_meters: number;
    lat: number;
    lon: number;
}



export interface VehicleTypeAvailable {
    vehicle_type_id: string;
    count: number;
}

export interface StationStatus {
    station_id: string;
    num_bikes_available: number;
    num_docks_available: number;
    is_installed: boolean;
    is_renting: boolean;
    is_returning: boolean;
    last_reported: number;
    vehicle_types_available: VehicleTypeAvailable[];
}

export interface Station {
    station_id: string;
    name: string;
    lat: number;
    lon: number;
    capacity: number;
    rental_uris: {
      android: string;
      ios: string;
    };
    status: StationStatus;
}
