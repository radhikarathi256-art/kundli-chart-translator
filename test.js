// node test.mjs — checks the reader and the checks on the sample charts
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { translateSvg, fromPositions, renderChartSvg, readLabel } from './kundli-chart-translator.js';

const where = (c) => Object.fromEntries(c.houses.filter((h) => h.planets.length).map((h) => [h.house, h.planets.map((p) => p.id).join(' ')]));

const m = translateSvg(fs.readFileSync('samples/backend-english.svg', 'utf8'));
assert.equal(m.ok, true); assert.equal(m.lagnaName, 'Mithun');
assert.deepEqual(where(m), { 2: 'Ju Ke', 7: 'Su Mo Me Ve', 8: 'Sa Ra', 12: 'Ma' });
assert.equal(m.houses[7].planets[0].retro, true); // Sa(R)

const a = translateSvg(fs.readFileSync('samples/backend-hindi.svg', 'utf8'));
assert.equal(a.ok, true); assert.equal(a.lagnaName, 'Vrishchik');
assert.deepEqual(where(a), { 2: 'Ra', 3: 'Sa', 4: 'Mo', 8: 'Ma Ke', 10: 'Su Me Ju', 11: 'Ve' });

const p = fromPositions(JSON.parse(fs.readFileSync('samples/positions.json', 'utf8')));
assert.deepEqual(where(p), where(m));

// chart that prints house numbers + sign names ("1 · KANYA") instead of sign numbers
const hn = translateSvg(fs.readFileSync('samples/backend-house-numbered.svg', 'utf8'));
assert.equal(hn.ok, true); assert.equal(hn.lagnaName, 'Kanya');
assert.deepEqual(where(hn), { 4: 'Sa', 5: 'Ra', 8: 'Ma', 9: 'Mo', 11: 'Su Ju Ve Ke', 12: 'Me' });

const bad = translateSvg(fs.readFileSync('samples/backend-broken.svg', 'utf8'));
assert.equal(bad.ok, false); assert.match(bad.errors.join(), /Missing planets: Ke/);
assert.throws(() => renderChartSvg(bad, { theme: 'kundli' }));

assert.deepEqual(readLabel('Ju(R) 14°').planets[0], { id: 'Ju', degree: 14, retro: true });
assert.equal(readLabel('१२').sign, 12);
assert.equal(readLabel('5 · MAKAR').signName, 10);

for (const theme of ['marriage', 'kundli']) {
  const svg = renderChartSvg(m, { theme });
  assert.equal((svg.match(/data-planet=/g) || []).length, 9);
  assert.equal((svg.match(/data-sign=/g) || []).length, 12);
}
console.log('all checks passed');
