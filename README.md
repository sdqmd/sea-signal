# Sea Signal

An interactive field guide for finding halal chilli crab in Singapore. It combines a tilted MapLibre map, 3D building extrusions, a researched restaurant shortlist, MUIS listing references, dish sources, saved places, and directions.

## Run locally

```bash
npm install
npm run dev
```

Open the URL printed by Vite. For a production build, run `npm run build`.

## Data and map

The seven outlets in `src/places.ts` were checked against the [MUIS halal establishment register](https://halal.muis.gov.sg/halal/establishments) on 2 October 2026. Each entry includes its outlet-specific register reference and a restaurant source naming chilli crab. Certification and menus can change, so the app links to the register and dish source for a fresh check before visiting. The ordering is an editorial shortlist, not a review score.

Map rendering uses [MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/) with [OpenFreeMap](https://openfreemap.org/quick_start/) vector tiles. Map data is © OpenStreetMap contributors.
