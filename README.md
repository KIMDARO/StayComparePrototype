# StayCompare

Student accommodation discovery by region — search an area, open place profiles, save favourites on a map, and compare them against your university, budget, and what’s nearby.

## What it does

- **Search a region** (Exeter, Manchester, Bristol, Leeds, Birmingham) for student stays
- **Pick your university** so every listing is scored against campus distance and how many students from your uni usually live there
- **Open accommodation profiles** with rent, amenities, commute, and nearby stores / cafés / transport
- **Save places you like** and see them pinned on the map
- **Compare up to 4 stays** side-by-side: rent, walk/cycle to campus, store access, budget fit, and uni popularity
- **Filter by budget**, max walk time, property type, and whether shops are close

All shortlists and preferences are stored in the browser (LocalStorage). Listing data is served by a small Express API with curated demo accommodations.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How it’s built

- HTML / CSS / vanilla JavaScript
- Express API (`/api/meta`, `/api/search`, `/api/accommodation/:id`, `/api/compare`)
- Leaflet + OpenStreetMap for maps
- LocalStorage for saved places, compare tray, and search preferences

## Status

Early-stage prototype with sample data for UK student cities. Designed to show the product concept end-to-end, not as a production housing marketplace.
