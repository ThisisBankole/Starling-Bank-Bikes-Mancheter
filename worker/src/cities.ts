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
  {
    id: "brighton",
    name: "Brighton & Hove",
    gbfsBase: "https://beryl-gbfs-production.web.app/v2_2/Brighton",
    center: { lat: 50.8357, lon: -0.1342 },
    bounds: { sw: [50.78, -0.26], ne: [50.89, -0.01] },
  },
  {
    id: "canterbury",
    name: "Canterbury",
    gbfsBase: "https://beryl-gbfs-production.web.app/v2_2/Canterbury",
    center: { lat: 51.2814, lon: 1.0833 },
    bounds: { sw: [51.25, 1.04], ne: [51.31, 1.13] },
  },
  {
    id: "cornwall",
    name: "Cornwall",
    gbfsBase: "https://beryl-gbfs-production.web.app/v2_2/Cornwall",
    center: { lat: 50.2576, lon: -5.1435 },
    bounds: { sw: [50.05, -5.6], ne: [50.47, -4.69] },
  },
  {
    id: "eastleigh",
    name: "Eastleigh",
    gbfsBase: "https://beryl-gbfs-production.web.app/v2_2/Eastleigh",
    center: { lat: 50.9687, lon: -1.3618 },
    bounds: { sw: [50.93, -1.4], ne: [51.01, -1.33] },
  },
  {
    id: "guildford",
    name: "Guildford",
    gbfsBase: "https://beryl-gbfs-production.web.app/v2_2/Guildford",
    center: { lat: 51.2375, lon: -0.5779 },
    bounds: { sw: [51.19, -0.64], ne: [51.28, -0.52] },
  },
  {
    id: "hackney-cargo",
    name: "Hackney Cargo Bikes",
    gbfsBase: "https://gbfs.beryl.cc/v2_2/Hackney_Cargo_Bike",
    center: { lat: 51.5444, lon: -0.073 },
    bounds: { sw: [51.51, -0.1], ne: [51.58, -0.045] },
  },
  {
    id: "hereford",
    name: "Hereford",
    gbfsBase: "https://beryl-gbfs-production.web.app/v2_2/Hereford",
    center: { lat: 52.0613, lon: -2.7363 },
    bounds: { sw: [52.02, -2.81], ne: [52.1, -2.66] },
  },
  {
    id: "hertsmere",
    name: "Hertsmere",
    gbfsBase: "https://beryl-gbfs-production.web.app/v2_2/Hertsmere",
    center: { lat: 51.6586, lon: -0.2721 },
    bounds: { sw: [51.63, -0.31], ne: [51.69, -0.235] },
  },
  {
    id: "isle-of-wight",
    name: "Isle of Wight",
    gbfsBase: "https://gbfs.beryl.cc/v2_2/Isle_of_Wight",
    center: { lat: 50.697, lon: -1.2213 },
    bounds: { sw: [50.61, -1.35], ne: [50.79, -1.1] },
  },
  {
    id: "leeds",
    name: "Leeds",
    gbfsBase: "https://beryl-gbfs-production.web.app/v2_2/Leeds",
    center: { lat: 53.8128, lon: -1.5439 },
    bounds: { sw: [53.76, -1.62], ne: [53.87, -1.47] },
  },
  {
    id: "liverpool",
    name: "Liverpool",
    gbfsBase: "https://mds.bolt.eu/gbfs/3/412",
    feedFormat: "3.0",
    center: { lat: 53.403, lon: -2.9114 },
    bounds: { sw: [53.32, -3.03], ne: [53.49, -2.8] },
  },
  {
    id: "norwich",
    name: "Norwich",
    gbfsBase: "https://beryl-gbfs-production.web.app/v2_2/Norwich",
    center: { lat: 52.6182, lon: 1.2443 },
    bounds: { sw: [52.54, 1.09], ne: [52.7, 1.4] },
  },
  {
    id: "plymouth",
    name: "Plymouth",
    gbfsBase: "https://beryl-gbfs-production.web.app/v2_2/Plymouth",
    center: { lat: 50.3912, lon: -4.133 },
    bounds: { sw: [50.33, -4.26], ne: [50.45, -4.0] },
  },
  {
    id: "portsmouth",
    name: "Portsmouth",
    gbfsBase: "https://gbfs.beryl.cc/v2_2/Portsmouth",
    center: { lat: 50.8154, lon: -1.0735 },
    bounds: { sw: [50.76, -1.14], ne: [50.87, -1.01] },
  },
  {
    id: "southampton",
    name: "Southampton",
    gbfsBase: "https://gbfs.beryl.cc/v2_2/Southampton",
    center: { lat: 50.9175, lon: -1.4083 },
    bounds: { sw: [50.87, -1.48], ne: [50.97, -1.34] },
  },
  {
    id: "stevenage",
    name: "Stevenage",
    gbfsBase: "https://beryl-gbfs-production.web.app/v2_2/Stevenage",
    center: { lat: 51.8998, lon: -0.1899 },
    bounds: { sw: [51.86, -0.24], ne: [51.94, -0.14] },
  },
  {
    id: "watford",
    name: "Watford",
    gbfsBase: "https://beryl-gbfs-production.web.app/v2_2/Watford",
    center: { lat: 51.6669, lon: -0.4013 },
    bounds: { sw: [51.62, -0.48], ne: [51.72, -0.33] },
  },
  {
    id: "west-midlands",
    name: "West Midlands",
    gbfsBase: "https://beryl-gbfs-production.web.app/v2_2/West_Midlands",
    center: { lat: 52.4837, lon: -1.8069 },
    bounds: { sw: [52.35, -2.18], ne: [52.62, -1.43] },
  },
  {
    id: "weymouth",
    name: "Weymouth",
    gbfsBase: "https://beryl-gbfs-production.web.app/v2_2/Weymouth",
    center: { lat: 50.6418, lon: -2.459 },
    bounds: { sw: [50.55, -2.52], ne: [50.74, -2.4] },
  },
  {
    id: "wool",
    name: "Wool",
    gbfsBase: "https://gbfs.beryl.cc/v2_2/Wool",
    center: { lat: 50.6896, lon: -2.2384 },
    bounds: { sw: [50.66, -2.28], ne: [50.72, -2.2] },
  },
  {
    id: "worcester",
    name: "Worcester",
    gbfsBase: "https://beryl-gbfs-production.web.app/v2_2/Worcester",
    center: { lat: 52.1962, lon: -2.2079 },
    bounds: { sw: [52.15, -2.28], ne: [52.24, -2.14] },
  },
];

export const DEFAULT_CITY = "manchester";

const CITY_IDS = new Set(CITIES.map((c) => c.id));

/** Returns a valid city id (defaulting when absent) or null if unknown. */
export function resolveCity(param: string | undefined): string | null {
  const id = param ?? DEFAULT_CITY;
  return CITY_IDS.has(id) ? id : null;
}
