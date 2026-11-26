# Kundli chart translator (AstroChat)

Turns the backend's kundli chart into an SVG in AstroChat's design.

```
backend SVG  ──read──▶  chart JSON  ──check──▶  AstroChat SVG (marriage = rose, kundli = yellow)
(or planet positions) ─┘
```

One file, no dependencies, Node 18+ or browser: `kundli-chart-translator.js`.

## Use

```js
import { translateSvg, fromPositions, renderChartSvg } from './kundli-chart-translator.js';

const chart = translateSvg(backendSvg, { person: 'Sample' });      // or fromPositions({...})
if (!chart.ok) return showFallback(chart.errors);                 // never draw a wrong chart
const svg = renderChartSvg(chart, { theme: 'kundli' });            // 'marriage' | 'kundli'
// save to S3 once per person per report; the app loads it like any image
```

CLI:

```
node kundli-chart-translator.js backend.svg --theme kundli --person Sample --json chart.json --out chart.svg
node kundli-chart-translator.js positions.json --theme marriage
node test.js
```

Options for `renderChartSvg`: `theme`, `highlightLagna` (default off; Marriage shows it on some screens), `size` (px, default 320; the drawing is vector so any size is sharp), `idPrefix` (set a unique one if two charts are inlined in the same page), `background` (card colour; default none).

## Preferred input: planet positions

If the astrology API can return data instead of a picture, use `fromPositions`, it's safer than reading an SVG:

```json
{ "ascendantSign": 3, "planets": [ { "name": "Jupiter", "sign": 4, "retro": false, "degree": 14 } ] }
```

Names can be English, short (Ju) or Hindi (गुरु). Signs are 1 Mesha … 12 Meena. Houses are counted from the ascendant unless `house` is given.

## Chart JSON

```json
{
  "ok": true, "errors": [], "warnings": [],
  "chart": "north_indian", "person": "Sample", "lagnaSign": 3, "lagnaName": "Mithun",
  "houses": [ { "house": 2, "sign": 4, "planets": [ { "id": "Ju", "degree": 14, "retro": false } ] } ]
}
```

All 12 houses are always listed. Planet ids: Su Mo Ma Me Ju Ve Sa Ra Ke.

## How the SVG is read

- Every text label is read with its position (handles `transform`, `tspan`, `text-anchor`, entities, Devanagari digits).
- The chart square is the biggest square `rect`, else the extent of the drawn lines, else the viewBox.
- Each label is placed in a house by position (house 1 = top diamond, counter-clockwise).
- A number 1–12 is the sign of that house. Planet names in English, short form or Hindi, with degrees and retro marks (`(R)`, `℞`, `*`, `(व)`), are kept.
- Sign names also work (`1 · KANYA`, Hindi or English zodiac). If the numbers are house numbers (1–12 in house order) and sign names are present, the names win.
- Lagna = the sign in house 1. All sign numbers vote, so one misplaced number doesn't break it.

## Checks (chart.ok = false → show the fallback)

- Lagna found; sign numbers agree (less than 75% agreement = error, otherwise a warning)
- All 9 planets present, each once
- Rahu and Ketu 6 houses apart

## Design (from Figma, Hackfest 2026 › Reports)

| | Marriage Prediction | Kundli Milan |
|---|---|---|
| Figma | 5197:39967 | 5211:41257, 5211:41290 |
| Board | #ffffff | #fffcf5 |
| Lines | #cc93a6 (85% outer, 62% diagonals, 85% diamond) | #d9a043 (same) |
| Rashi symbols | #a5677d at 55% | #b5862f at 55% |
| LAGNA | #a5677d | #b5862f |
| Planet names | #5d3a46 | #7a4f0c |
| Card behind chart (app) | #ffffff | #fef0c7 first person, #fffaeb second |

Planet balls (gradient, shadow) are the same in both. Rashi symbols, planet balls and the LAGNA label are embedded as exact Figma exports with text outlined, so no fonts are needed when the SVG is shown as an image.

