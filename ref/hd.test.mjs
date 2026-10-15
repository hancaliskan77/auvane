import assert from 'node:assert/strict';
import { humanDesign } from './hd.mjs';
// Ground truth: chart from jovianarchive.com for 1991-07-21 02:30 local, Rize, Turkey (UTC 1991-07-20 23:30)
const r = humanDesign(new Date('1991-07-20T23:30:00Z'));
assert.deepEqual(r.personality, { Sun:'56.2', Moon:'14.1', Mercury:'4.6', Venus:'59.6', Mars:'59.4', Jupiter:'7.6', Saturn:'41.3', Uranus:'38.2', Neptune:'38.6', Pluto:'1.5', NorthNode:'54.5', Earth:'60.2', SouthNode:'53.5' });
assert.deepEqual(r.design, { Sun:'3.4', Moon:'39.5', Mercury:'51.6', Venus:'16.4', Mars:'52.6', Jupiter:'31.3', Saturn:'41.5', Uranus:'38.5', Neptune:'54.2', Pluto:'43.1', NorthNode:'61.3', Earth:'50.4', SouthNode:'62.3' });
assert.equal(r.type, 'Generator'); assert.equal(r.authority, 'Sacral'); assert.equal(r.definition, 'Split');
assert.equal(r.profile, '2/4'); assert.equal(r.cross, '56/60 | 3/50');
console.log('HD ground-truth chart: 26/26 activations + type, authority, definition, profile, cross OK');
console.log('Sample birth (1993-06-14 10:40 UTC):', JSON.stringify(humanDesign(new Date('1993-06-14T10:40:00Z')), null, 0));
