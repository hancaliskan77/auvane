import assert from 'node:assert/strict';
import { arcanaName, ARCANA_NAMES } from '../src/arcana';
assert.equal(ARCANA_NAMES.length, 22);
assert.equal(arcanaName(20), 'Judgement');
assert.equal(arcanaName(22), 'Fool');
assert.equal(arcanaName(8), null);   // unconfirmed order: must stay null
assert.equal(arcanaName(11), null);
console.log('arcana names OK (8 and 11 intentionally unnamed)');
