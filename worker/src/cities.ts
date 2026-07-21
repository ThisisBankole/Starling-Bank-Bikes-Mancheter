export interface City {
  id: string;
  name: string;
  gbfsBase: string;
  /** GBFS feed version; defaults to 2.2 (Beryl). 3.0 uses different paths and field names. */
  feedFormat?: "2.2" | "3.0";
  /** Map presentation hints for the frontend */
  center: { lat: number; lon: number };
  bounds: { sw: [number, number]; ne: [number, number] };
}

export const CITIES: City[] = [
  {
    id: "manchester",
    name: "Manchester",
    gbfsBase: "https://beryl-gbfs-production.web.app/v2_2/Greater_Manchester",
    center: { lat: 53.4807, lon: -2.2426 },
    bounds: { sw: [53.3331, -2.5313], ne: [53.6895, -1.9074] },
  },
];

export const DEFAULT_CITY = "manchester";

const CITY_IDS = new Set(CITIES.map((c) => c.id));

/** Returns a valid city id (defaulting when absent) or null if unknown. */
export function resolveCity(param: string | undefined): string | null {
  const id = param ?? DEFAULT_CITY;
  return CITY_IDS.has(id) ? id : null;
}
