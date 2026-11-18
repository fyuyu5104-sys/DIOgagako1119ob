# DIO — Photography Site

A single-page photography portfolio on a pure white canvas.
No build step, no dependencies.

## Files

- `index.html` — page structure
- `styles.css` — all styling
- `main.js` — drifting photo strip, hover captions, staggered gallery
- `fonts/inter-latin-wght-normal.woff2` — body typeface
- `fonts/manrope-latin-wght-normal.woff2` — small labels
- `fonts/montserrat-latin-700-normal.woff2` — stand-in for Nexa Bold (wordmark)
- `fonts/montserrat-latin-900-normal.woff2` — stand-in for Nexa Heavy
- `img/p1.jpg … p7.jpg` — photographs, cropped to 3:2 (640×427) or 2:3 (720×1080)
- `img/p8.jpg … p22.jpg` — gallery-only photographs, same crop rules
- `preview-1920x1080.png` — homepage at 1920×1080
- `preview-hover.png` — hover state at 1920×1080
- `preview-gallery.png` — work gallery at 1920×1080

## Run it

Double-click `index.html`, or serve the folder:

```
npx serve .
```

## Add your own photographs

1. Put your images in `/img`.
2. Crop them to either **3:2** (landscape, 640×427) or **2:3** (portrait, 720×1080).
3. Edit the `PHOTOS` array at the top of `main.js`:

```js
{
  src: 'img/your-file.jpg',
  ar: '3/2',      // '3/2' landscape, '2/3' portrait
  h:  39.5,       // height in vh: 39.5 landscape, 65 portrait
  lift: 1.6,      // bottom edge lifted above the strip baseline (vh)
  title: 'CITY EDGE',
  place: 'NINGBO', year: '2025',
  phrase: 'Ningbo — Three Minutes of Light'
}
```

Each entry in `PHOTOS` feeds both the hero strip and the gallery below.
To add gallery-only work, append to `EXTRA_PHOTOS`; those images never enter the strip.

## The gallery

The work section is a three-column staggered layout (two on tablets, one on phones).
`DIO` sits at the top right. Columns are balanced on load and each one starts at a
different height, so the grid reads as a waterfall rather than a table.

## The strip

- Mix portrait and landscape freely: width follows from `ar` × `h`.
- Bottoms are staggered by `lift` (0–8vh). The strip runs just past the fold, so the
  first screen reads flush with the window; scrolling reveals the uneven bottom edges.
- Use `h: 39.5` for landscapes (640 px wide at 1920×1080) and `h: 65` for
  portraits (702 px tall at 1920×1080). All images of the same orientation
  therefore share one height; vary `lift` for the staggered rhythm.
- The marquee drifts right and loops seamlessly; hovering a photograph eases it to a stop.
- Hover captions are a single short English line, e.g. `Ningbo — Vale of Mist`.

## Adjustable details

| What | Where | Value |
| --- | --- | --- |
| Drift speed | `main.js` | `speed = 26` (px per second) |
| Gap between photos | `styles.css` | `--gap` |
| Photo height scale (mobile) | `styles.css` | `--hs` inside the media queries |
| Grey veil on hover | `styles.css` | `.frame::before { background: rgba(128,128,128,.30) }` |
| Wordmark size | `styles.css` | `.wordmark { font-size: clamp(60px,11.5vw,180px) }` |
| Wordmark weight | `styles.css` | `.wordmark { font-weight: 700 }` |
| Wordmark typeface | `styles.css` | `.wordmark { font-family: "Nexa", "Montserrat", … }` |
| Wordmark position | `index.html` | `.hero__head` block |
| Location label | `index.html` | `.loc` block |
| Contact email | `index.html` | `mailto:` link |

## Notes

- Hovering a photograph pauses the strip, adds a 30% grey veil, and reveals the date plus a short line at the bottom right. When a photo runs past the fold, the caption rides just above the visible edge.
- On touch devices the captions stay visible.
- Respects `prefers-reduced-motion`.

## About the wordmark font

The wordmark is set in **Nexa Bold**, a commercial typeface by Fontfabric, so it is not bundled.
The CSS tries, in order:

1. `local("Nexa Bold")` — used automatically if Nexa is installed on the visitor's machine
2. `fonts/nexa-bold.woff2` — drop your licensed file here and it is picked up with no code change
3. Montserrat Bold 700 — the bundled fallback, closest free geometric equivalent

To ship the real thing, add `fonts/nexa-bold.woff2` (web licence required).
