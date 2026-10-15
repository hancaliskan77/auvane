// DEV SEED ONLY. The real list is GeoNames (~50k cities, CC BY) bundled offline.
// It could not be downloaded from this environment, so this short list stands in until it is added.
export interface City { name: string; region: string; country: string; lat: number; lon: number; tz: string }

export const CITIES: City[] = [
  { name: 'Brooklyn', region: 'New York', country: 'United States', lat: 40.6782, lon: -73.9442, tz: 'America/New_York' },
  { name: 'New York', region: 'New York', country: 'United States', lat: 40.7128, lon: -74.006, tz: 'America/New_York' },
  { name: 'Brooklyn Park', region: 'Minnesota', country: 'United States', lat: 45.0941, lon: -93.3563, tz: 'America/Chicago' },
  { name: 'Brookline', region: 'Massachusetts', country: 'United States', lat: 42.3318, lon: -71.1212, tz: 'America/New_York' },
  { name: 'Boston', region: 'Massachusetts', country: 'United States', lat: 42.3601, lon: -71.0589, tz: 'America/New_York' },
  { name: 'Philadelphia', region: 'Pennsylvania', country: 'United States', lat: 39.9526, lon: -75.1652, tz: 'America/New_York' },
  { name: 'Miami', region: 'Florida', country: 'United States', lat: 25.7617, lon: -80.1918, tz: 'America/New_York' },
  { name: 'Atlanta', region: 'Georgia', country: 'United States', lat: 33.749, lon: -84.388, tz: 'America/New_York' },
  { name: 'Chicago', region: 'Illinois', country: 'United States', lat: 41.8781, lon: -87.6298, tz: 'America/Chicago' },
  { name: 'Houston', region: 'Texas', country: 'United States', lat: 29.7604, lon: -95.3698, tz: 'America/Chicago' },
  { name: 'Dallas', region: 'Texas', country: 'United States', lat: 32.7767, lon: -96.797, tz: 'America/Chicago' },
  { name: 'San Antonio', region: 'Texas', country: 'United States', lat: 29.4241, lon: -98.4936, tz: 'America/Chicago' },
  { name: 'Denver', region: 'Colorado', country: 'United States', lat: 39.7392, lon: -104.9903, tz: 'America/Denver' },
  { name: 'Phoenix', region: 'Arizona', country: 'United States', lat: 33.4484, lon: -112.074, tz: 'America/Phoenix' },
  { name: 'Los Angeles', region: 'California', country: 'United States', lat: 34.0522, lon: -118.2437, tz: 'America/Los_Angeles' },
  { name: 'San Diego', region: 'California', country: 'United States', lat: 32.7157, lon: -117.1611, tz: 'America/Los_Angeles' },
  { name: 'San Francisco', region: 'California', country: 'United States', lat: 37.7749, lon: -122.4194, tz: 'America/Los_Angeles' },
  { name: 'Las Vegas', region: 'Nevada', country: 'United States', lat: 36.1699, lon: -115.1398, tz: 'America/Los_Angeles' },
  { name: 'Portland', region: 'Oregon', country: 'United States', lat: 45.5152, lon: -122.6784, tz: 'America/Los_Angeles' },
  { name: 'Seattle', region: 'Washington', country: 'United States', lat: 47.6062, lon: -122.3321, tz: 'America/Los_Angeles' },
  { name: 'Anchorage', region: 'Alaska', country: 'United States', lat: 61.2181, lon: -149.9003, tz: 'America/Anchorage' },
  { name: 'Honolulu', region: 'Hawaii', country: 'United States', lat: 21.3069, lon: -157.8583, tz: 'Pacific/Honolulu' },
  { name: 'Rize', region: 'Rize', country: 'Türkiye', lat: 41.0201, lon: 40.5234, tz: 'Europe/Istanbul' },
];

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function searchCities(q: string, limit = 5): City[] {
  const n = norm(q.trim());
  if (n.length < 2) return [];
  const starts = CITIES.filter((c) => norm(c.name).startsWith(n));
  const rest = CITIES.filter((c) => !starts.includes(c) && norm(c.name).includes(n));
  return [...starts, ...rest].slice(0, limit);
}
