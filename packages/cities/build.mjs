// Build the offline city list: every US place (pop >= 1000) + world cities (pop >= 100k).
// Output rows: [name, region, countryCode, lat, lon, tzIndex], sorted by population (largest first).
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire(import.meta.url);
const cities = require('all-the-cities');
const tzlookup = require('tz-lookup');

const US_STATES = { AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', DC: 'District of Columbia', FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming', PR: 'Puerto Rico', GU: 'Guam', VI: 'U.S. Virgin Islands' };
const countryName = new Intl.DisplayNames(['en'], { type: 'region' });

const keep = cities
  .filter((c) => (c.country === 'US' ? !!US_STATES[c.adminCode] : c.population >= 100000))
  .sort((a, b) => b.population - a.population);

const tzs = [];
const tzIndex = new Map();
const rows = keep.map((c) => {
  const [lon, lat] = c.loc.coordinates;
  const tz = tzlookup(lat, lon);
  if (!tzIndex.has(tz)) { tzIndex.set(tz, tzs.length); tzs.push(tz); }
  const region = c.country === 'US' ? US_STATES[c.adminCode] : '';
  return [c.name, region, c.country, Math.round(lat * 1e4) / 1e4, Math.round(lon * 1e4) / 1e4, tzIndex.get(tz)];
});

const countries = {};
for (const r of rows) countries[r[2]] ??= countryName.of(r[2]);

writeFileSync('../../apps/mobile/src/data/cities.json', JSON.stringify({ tzs, countries, rows }));
console.log(`${rows.length} cities, ${tzs.length} time zones`);
