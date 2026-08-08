# StayCompare

Student accommodation discovery by region — search an area, open place profiles, save favourites on a map, and compare them against your university, budget, and what’s nearby.

Works on **GitHub Pages** (static) and locally with Node.

## What it does

- **Search a region** across 16 UK student cities (including London, Edinburgh, Manchester, Nottingham, and more)
- Browse **university halls**, **private student halls**, **shared houses**, **private rentals**, and **studios**
- Each listing shows a **photo** on cards, compare view, and the place profile
- **Pick your university** so listings are scored against campus distance and how many students from your uni usually live there
- **Open accommodation profiles** with rent, amenities, commute, and nearby stores / cafés / transport
- **Sign up / log in** to a browser-based profile (name, uni, budget, bio)
- **Save places** to your account and see them pinned on the map
- **Compare up to 4 stays** side-by-side: rent, walk/cycle to campus, store access, budget fit, and uni popularity

## GitHub Pages

This site is static-friendly: listing data and search run in the browser (`data.js` + `catalog.js`), so region/university dropdowns work without a server.

Demo accounts are stored in **your browser’s LocalStorage** (prototype auth, not a production backend).

Live: https://kimdaro.github.io/StayComparePrototype/

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Optional Express API routes still exist (`/api/meta`, `/api/search`, etc.) for local use; the UI itself does not depend on them.

## How it’s built

- HTML / CSS / vanilla JavaScript
- `data.js` — accommodation + university seed data
- `catalog.js` — search / score / compare logic (browser + Node)
- `auth.js` — signup, login, profile (LocalStorage)
- Leaflet + OpenStreetMap for maps

## Status

Early-stage prototype with sample UK student-city data. Designed to show the product concept end-to-end, including account profiles for shortlists.
