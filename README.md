# StayCompare

Student accommodation discovery by region — search an area, open place profiles, save favourites on a map, and compare them against your university, budget, and what’s nearby.

Works on **GitHub Pages** (static) and locally with Node.

## What it does

- **Add places you find** by pasting a listing link (preview title/image when available; you confirm weekly rent)
- Keep a **shortlist** of linked + saved places and compare them side by side
- Browse **default university halls** and other sample catalogue places across 16 UK student cities
- See **recent-year rent bands** on university halls (prototype/sample year pricing, not live scrapes)
- Each listing shows a **photo** on cards, compare view, and the place profile
- **Pick your university** so listings are scored against campus distance and how many students from your uni usually live there
- **Sign up / log in** to keep shortlists and linked places on your profile (browser LocalStorage)

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

## Data sources

- Catalogue listings are **demo/sample seed data** in `data.js`
- Student-added places are stored in the browser from links + details you enter
- Link preview only reads public Open Graph / page title / image tags (when the local server can reach the URL). Weekly rent is confirmed by the student.
- University halls show **sample academic-year price bands** for comparison — not scraped commercial datasets

This project does **not** use Homemove/Homedata, or any other commercial property listings API.

## Status

Early-stage prototype with sample UK student-city data. Designed to show the product concept end-to-end, including account profiles for shortlists.
