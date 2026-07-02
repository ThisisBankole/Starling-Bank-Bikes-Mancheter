export interface City {
  id: string;
  name: string;
  gbfsBase: string;
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
  {
    id: "bcp",
    name: "Bournemouth, Christchurch & Poole",
    gbfsBase: "https://beryl-gbfs-production.web.app/v2_2/BCP",
    center: { lat: 50.7205, lon: -1.8795 },
    bounds: { sw: [50.66, -2.08], ne: [50.82, -1.66] },
  },
  {
    id: "bradford",
    name: "Bradford",
    gbfsBase: "https://beryl-gbfs-production.web.app/v2_2/Bradford",
    center: { lat: 53.8121, lon: -1.7709 },
    bounds: { sw: [53.77, -1.82], ne: [53.85, -1.72] },
  },
];

export const DEFAULT_CITY = "manchester";

const CITY_IDS = new Set(CITIES.map((c) => c.id));

/** Returns a valid city id (defaulting when absent) or null if unknown. */
export function resolveCity(param: string | undefined): string | null {
  const id = param ?? DEFAULT_CITY;
  return CITY_IDS.has(id) ? id : null;
}
