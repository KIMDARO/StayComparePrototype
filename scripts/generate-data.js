/**
 * Generates expanded data.js for StayCompare.
 * Run: node scripts/generate-data.js
 */
const fs = require("fs");
const path = require("path");

const UNIVERSITIES = [
  { id: "exeter", name: "University of Exeter", shortName: "Exeter", city: "Exeter", region: "exeter", lat: 50.7352, lng: -3.5342 },
  { id: "manchester", name: "University of Manchester", shortName: "Manchester", city: "Manchester", region: "manchester", lat: 53.4668, lng: -2.2339 },
  { id: "mmu", name: "Manchester Metropolitan University", shortName: "Man Met", city: "Manchester", region: "manchester", lat: 53.4705, lng: -2.239 },
  { id: "bristol", name: "University of Bristol", shortName: "Bristol", city: "Bristol", region: "bristol", lat: 51.4584, lng: -2.603 },
  { id: "leeds", name: "University of Leeds", shortName: "Leeds", city: "Leeds", region: "leeds", lat: 53.8067, lng: -1.555 },
  { id: "birmingham", name: "University of Birmingham", shortName: "Birmingham", city: "Birmingham", region: "birmingham", lat: 52.4508, lng: -1.9305 },
  { id: "nottingham", name: "University of Nottingham", shortName: "Nottingham", city: "Nottingham", region: "nottingham", lat: 52.9388, lng: -1.2001 },
  { id: "sheffield", name: "University of Sheffield", shortName: "Sheffield", city: "Sheffield", region: "sheffield", lat: 53.3811, lng: -1.4885 },
  { id: "liverpool", name: "University of Liverpool", shortName: "Liverpool", city: "Liverpool", region: "liverpool", lat: 53.4066, lng: -2.9665 },
  { id: "newcastle", name: "Newcastle University", shortName: "Newcastle", city: "Newcastle", region: "newcastle", lat: 54.9795, lng: -1.6147 },
  { id: "edinburgh", name: "University of Edinburgh", shortName: "Edinburgh", city: "Edinburgh", region: "edinburgh", lat: 55.9445, lng: -3.1892 },
  { id: "glasgow", name: "University of Glasgow", shortName: "Glasgow", city: "Glasgow", region: "glasgow", lat: 55.8721, lng: -4.2882 },
  { id: "cardiff", name: "Cardiff University", shortName: "Cardiff", city: "Cardiff", region: "cardiff", lat: 51.4875, lng: -3.178 },
  { id: "southampton", name: "University of Southampton", shortName: "Southampton", city: "Southampton", region: "southampton", lat: 50.934, lng: -1.3957 },
  { id: "bath", name: "University of Bath", shortName: "Bath", city: "Bath", region: "bath", lat: 51.3782, lng: -2.3264 },
  { id: "york", name: "University of York", shortName: "York", city: "York", region: "york", lat: 53.946, lng: -1.051 },
  { id: "ucl", name: "University College London", shortName: "UCL", city: "London", region: "london", lat: 51.5246, lng: -0.134 },
  { id: "kings", name: "King's College London", shortName: "King's", city: "London", region: "london", lat: 51.5115, lng: -0.116 }
];

const REGIONS = [
  { id: "exeter", name: "Exeter", label: "Exeter & campus area", lat: 50.7184, lng: -3.5339, zoom: 13 },
  { id: "manchester", name: "Manchester", label: "Manchester city & Oxford Road", lat: 53.4808, lng: -2.2426, zoom: 13 },
  { id: "bristol", name: "Bristol", label: "Bristol & Clifton", lat: 51.4545, lng: -2.5879, zoom: 13 },
  { id: "leeds", name: "Leeds", label: "Leeds & Headingley", lat: 53.8008, lng: -1.5491, zoom: 13 },
  { id: "birmingham", name: "Birmingham", label: "Birmingham & Selly Oak", lat: 52.4862, lng: -1.8904, zoom: 12 },
  { id: "nottingham", name: "Nottingham", label: "Nottingham & University Park", lat: 52.9548, lng: -1.1581, zoom: 12 },
  { id: "sheffield", name: "Sheffield", label: "Sheffield & Broomhill", lat: 53.3811, lng: -1.4701, zoom: 13 },
  { id: "liverpool", name: "Liverpool", label: "Liverpool city & campus", lat: 53.4084, lng: -2.9916, zoom: 13 },
  { id: "newcastle", name: "Newcastle", label: "Newcastle & Jesmond", lat: 54.9783, lng: -1.6178, zoom: 13 },
  { id: "edinburgh", name: "Edinburgh", label: "Edinburgh & Marchmont", lat: 55.9533, lng: -3.1883, zoom: 13 },
  { id: "glasgow", name: "Glasgow", label: "Glasgow & West End", lat: 55.8642, lng: -4.2518, zoom: 13 },
  { id: "cardiff", name: "Cardiff", label: "Cardiff & Cathays", lat: 51.4816, lng: -3.1791, zoom: 13 },
  { id: "southampton", name: "Southampton", label: "Southampton & Highfield", lat: 50.9097, lng: -1.4044, zoom: 13 },
  { id: "bath", name: "Bath", label: "Bath & campus", lat: 51.3811, lng: -2.359, zoom: 13 },
  { id: "york", name: "York", label: "York & Heslington", lat: 53.96, lng: -1.0873, zoom: 12 },
  { id: "london", name: "London", label: "Central & Bloomsbury", lat: 51.52, lng: -0.12, zoom: 12 }
];

const TYPE_LABELS = {
  "university-halls": "University halls",
  "private-halls": "Private student halls",
  "shared-house": "Shared student house",
  "private-rent": "Private rental",
  studio: "Studio"
};

function tone(type) {
  if (type === "university-halls") return "campus";
  if (type === "private-halls" || type === "studio") return type === "studio" ? "studio" : "city";
  return "house";
}

function uni(id, walk, share, cycle = Math.max(2, Math.round(walk / 2.4)), km = +(walk / 13).toFixed(1)) {
  return { [id]: { distanceKm: km, walkMins: walk, cycleMins: cycle, uniShare: share } };
}

function multi(entries) {
  return Object.assign({}, ...entries);
}

function nearby(store, cafe, transport) {
  return {
    stores: store,
    cafes: cafe,
    transport
  };
}

function place(o) {
  return {
    deposit: 300,
    billsIncluded: false,
    rating: 4.0,
    rooms: 1,
    amenities: ["wifi"],
    nearby: { stores: [], cafes: [], transport: [] },
    imageTone: tone(o.type),
    ...o
  };
}

const ACCOMMODATIONS = [
  // EXETER
  place({ id: "ex-birks", name: "Birks Grange Village", region: "exeter", city: "Exeter", area: "Streatham Campus", type: "university-halls", lat: 50.7378, lng: -3.5395, rentWeekly: 168, deposit: 250, billsIncluded: true, rating: 4.3, rooms: 1200, description: "On-campus halls with ensuite rooms and shared kitchens. Strong Exeter first-year community.", amenities: ["ensuite", "wifi", "laundry", "study-spaces", "gym"], universities: uni("exeter", 8, 92), nearby: nearby([{ name: "Campus shop", type: "convenience", walkMins: 3 }, { name: "Co-op Streatham", type: "supermarket", walkMins: 12 }], [{ name: "Forum Café", walkMins: 7 }], [{ name: "University bus stop", walkMins: 2 }]) }),
  place({ id: "ex-holland", name: "Holland Hall", region: "exeter", city: "Exeter", area: "Streatham Campus", type: "university-halls", lat: 50.7401, lng: -3.535, rentWeekly: 155, deposit: 250, billsIncluded: true, rating: 4.1, rooms: 480, description: "Hilltop university halls with lower rent shared bathrooms. Popular with Exeter first years.", amenities: ["wifi", "laundry", "study-spaces", "common-room"], universities: uni("exeter", 6, 95), nearby: nearby([{ name: "Campus shop", type: "convenience", walkMins: 5 }], [{ name: "Holland Hall bar", walkMins: 1 }], [{ name: "Campus bus loop", walkMins: 4 }]) }),
  place({ id: "ex-lafayette", name: "Lafayette Student Living", region: "exeter", city: "Exeter", area: "City centre", type: "private-halls", lat: 50.7228, lng: -3.5315, rentWeekly: 205, deposit: 320, billsIncluded: true, rating: 4.5, rooms: 260, description: "Modern private student halls near shops and nightlife, a bit further from Streatham campus.", amenities: ["ensuite", "wifi", "gym", "cinema", "laundry"], universities: uni("exeter", 30, 58), nearby: nearby([{ name: "Sainsbury's Local", type: "supermarket", walkMins: 3 }, { name: "High Street", type: "retail", walkMins: 5 }], [{ name: "Boston Tea Party", walkMins: 6 }], [{ name: "Exeter Central", walkMins: 7 }]) }),
  place({ id: "ex-stocker", name: "Stocker Road House Share", region: "exeter", city: "Exeter", area: "Stocker Road", type: "shared-house", lat: 50.7312, lng: -3.5285, rentWeekly: 128, deposit: 400, rating: 3.9, rooms: 5, description: "Classic student shared house between campus and town. Lower rent, lively street.", amenities: ["wifi", "garden", "parking"], universities: uni("exeter", 16, 74), nearby: nearby([{ name: "Tesco Express", type: "supermarket", walkMins: 5 }, { name: "Corner shop", type: "convenience", walkMins: 2 }], [{ name: "The Imperial", walkMins: 8 }], [{ name: "Bus to Streatham", walkMins: 3 }]) }),
  place({ id: "ex-pennsylvania", name: "Pennsylvania Road Flat", region: "exeter", city: "Exeter", area: "Pennsylvania", type: "private-rent", lat: 50.7295, lng: -3.525, rentWeekly: 175, deposit: 750, rating: 4.0, rooms: 2, description: "Privately rented 2-bed flat on a popular student street. Bills separate.", amenities: ["wifi", "furnished", "washer"], universities: uni("exeter", 20, 68), nearby: nearby([{ name: "Co-op", type: "supermarket", walkMins: 6 }], [{ name: "Café Direct", walkMins: 9 }], [{ name: "Bus into campus", walkMins: 4 }]) }),
  place({ id: "ex-studio", name: "Queen Street Studio", region: "exeter", city: "Exeter", area: "City centre", type: "studio", lat: 50.7258, lng: -3.5272, rentWeekly: 220, deposit: 500, rating: 4.0, description: "Self-contained city studio for students who want privacy and independence.", amenities: ["ensuite", "wifi", "kitchenette", "furnished"], universities: uni("exeter", 32, 38), nearby: nearby([{ name: "M&S Foodhall", type: "supermarket", walkMins: 3 }, { name: "Guildhall Shopping", type: "retail", walkMins: 4 }], [{ name: "Coffee #1", walkMins: 2 }], [{ name: "Exeter Central", walkMins: 5 }]) }),
  place({ id: "ex-stthomas", name: "St Thomas Private Flat", region: "exeter", city: "Exeter", area: "St Thomas", type: "private-rent", lat: 50.7165, lng: -3.543, rentWeekly: 145, deposit: 650, rating: 3.8, description: "Budget private one-bed across the river. Longer campus walk, strong supermarket access.", amenities: ["wifi", "furnished"], universities: uni("exeter", 35, 42), nearby: nearby([{ name: "Aldi", type: "supermarket", walkMins: 4 }, { name: "St Thomas High Street", type: "retail", walkMins: 5 }], [{ name: "Local café", walkMins: 6 }], [{ name: "St Thomas station", walkMins: 8 }]) }),

  // MANCHESTER
  place({ id: "man-owens", name: "Owens Park", region: "manchester", city: "Manchester", area: "Fallowfield", type: "university-halls", lat: 53.4425, lng: -2.218, rentWeekly: 152, deposit: 200, billsIncluded: true, rating: 4.0, rooms: 1100, description: "Large university halls in Fallowfield with a huge student social scene and buses into campus.", amenities: ["wifi", "laundry", "common-room", "sports"], universities: multi([uni("manchester", 40, 88), uni("mmu", 42, 40)]), nearby: nearby([{ name: "Sainsbury's Fallowfield", type: "supermarket", walkMins: 6 }, { name: "Wilmslow Road shops", type: "retail", walkMins: 8 }], [{ name: "Toast of Manchester", walkMins: 7 }], [{ name: "Fallowfield bus corridor", walkMins: 3 }]) }),
  place({ id: "man-richmond", name: "Richmond Park Halls", region: "manchester", city: "Manchester", area: "Fallowfield", type: "university-halls", lat: 53.444, lng: -2.215, rentWeekly: 148, deposit: 200, billsIncluded: true, rating: 3.9, rooms: 700, description: "University-owned halls popular with first years. Affordable classic Fallowfield living.", amenities: ["wifi", "laundry", "common-room"], universities: multi([uni("manchester", 38, 90), uni("mmu", 40, 35)]), nearby: nearby([{ name: "Co-op", type: "supermarket", walkMins: 5 }], [{ name: "Fuel Café", walkMins: 8 }], [{ name: "Oxford Road bus", walkMins: 4 }]) }),
  place({ id: "man-vita", name: "Vita Student Manchester", region: "manchester", city: "Manchester", area: "First Street", type: "private-halls", lat: 53.4735, lng: -2.246, rentWeekly: 245, deposit: 350, billsIncluded: true, rating: 4.6, rooms: 280, description: "Premium private student living with gym and co-working. Mid commute to Oxford Road.", amenities: ["ensuite", "wifi", "gym", "cinema", "laundry", "study-spaces"], universities: multi([uni("manchester", 24, 55), uni("mmu", 16, 62)]), nearby: nearby([{ name: "Tesco Express", type: "supermarket", walkMins: 4 }, { name: "Deansgate shops", type: "retail", walkMins: 10 }], [{ name: "Federal Café", walkMins: 6 }], [{ name: "Deansgate-Castlefield Metrolink", walkMins: 7 }]) }),
  place({ id: "man-unite", name: "Unite Students Sky Plaza", region: "manchester", city: "Manchester", area: "City centre", type: "private-halls", lat: 53.478, lng: -2.237, rentWeekly: 228, deposit: 300, billsIncluded: true, rating: 4.4, rooms: 450, description: "High-rise private halls in the city centre. Especially convenient for MMU students.", amenities: ["ensuite", "wifi", "gym", "laundry", "study-spaces"], universities: multi([uni("manchester", 22, 48), uni("mmu", 10, 72)]), nearby: nearby([{ name: "Tesco Metro", type: "supermarket", walkMins: 3 }, { name: "Arndale", type: "retail", walkMins: 8 }], [{ name: "Coffee shop cluster", walkMins: 4 }], [{ name: "Piccadilly Gardens", walkMins: 6 }]) }),
  place({ id: "man-victoria", name: "Victoria Park House", region: "manchester", city: "Manchester", area: "Victoria Park", type: "shared-house", lat: 53.455, lng: -2.221, rentWeekly: 135, deposit: 450, rating: 3.8, rooms: 6, description: "Affordable shared house walkable to campus, surrounded by student lets.", amenities: ["wifi", "garden", "bike-storage"], universities: multi([uni("manchester", 18, 81), uni("mmu", 26, 28)]), nearby: nearby([{ name: "Co-op", type: "supermarket", walkMins: 5 }, { name: "Corner shop", type: "convenience", walkMins: 2 }], [{ name: "Fuel Café", walkMins: 9 }], [{ name: "Oxford Road bus", walkMins: 6 }]) }),
  place({ id: "man-rusholme", name: "Rusholme Private Terrace", region: "manchester", city: "Manchester", area: "Rusholme", type: "private-rent", lat: 53.4535, lng: -2.2225, rentWeekly: 140, deposit: 700, rating: 3.7, rooms: 4, description: "Privately rented terrace near the curry mile. Typical private student rental with bills extra.", amenities: ["wifi", "furnished", "garden"], universities: multi([uni("manchester", 20, 70), uni("mmu", 28, 30)]), nearby: nearby([{ name: "Wilmslow Road shops", type: "retail", walkMins: 3 }, { name: "Asda", type: "supermarket", walkMins: 10 }], [{ name: "Curry restaurants", walkMins: 2 }], [{ name: "Bus to campus", walkMins: 3 }]) }),
  place({ id: "man-studio", name: "Oxford Road Studio Pod", region: "manchester", city: "Manchester", area: "Oxford Road", type: "studio", lat: 53.4638, lng: -2.2325, rentWeekly: 210, deposit: 400, billsIncluded: true, rating: 4.2, rooms: 90, description: "Compact studio steps from campus if commute time is your priority.", amenities: ["ensuite", "wifi", "kitchenette", "laundry"], universities: multi([uni("manchester", 7, 70), uni("mmu", 14, 45)]), nearby: nearby([{ name: "Tesco Express", type: "supermarket", walkMins: 3 }, { name: "Campus convenience", type: "convenience", walkMins: 4 }], [{ name: "Christie Café", walkMins: 5 }], [{ name: "Oxford Road station", walkMins: 8 }]) }),
  place({ id: "man-salford", name: "Salford Quays Apartment", region: "manchester", city: "Manchester", area: "Salford Quays", type: "private-rent", lat: 53.4715, lng: -2.298, rentWeekly: 190, deposit: 900, rating: 4.1, description: "Modern private apartment by MediaCity. Longer Metrolink commute, quieter than Fallowfield.", amenities: ["wifi", "furnished", "concierge"], universities: multi([uni("manchester", 70, 22), uni("mmu", 62, 25)]), nearby: nearby([{ name: "The Lowry Outlet", type: "retail", walkMins: 8 }, { name: "Tesco Extra", type: "supermarket", walkMins: 12 }], [{ name: "Quayside cafés", walkMins: 6 }], [{ name: "MediaCityUK Metrolink", walkMins: 5 }]) }),

  // BRISTOL
  place({ id: "bri-hiatt", name: "Hiatt Baker Hall", region: "bristol", city: "Bristol", area: "Stoke Bishop", type: "university-halls", lat: 51.4805, lng: -2.628, rentWeekly: 162, deposit: 250, billsIncluded: true, rating: 4.2, rooms: 600, description: "Leafy university halls with a big first-year community and shuttle buses to the precinct.", amenities: ["wifi", "laundry", "common-room", "sports"], universities: uni("bristol", 45, 90), nearby: nearby([{ name: "Sainsbury's Local", type: "supermarket", walkMins: 10 }], [{ name: "Halls café", walkMins: 2 }], [{ name: "Uni shuttle stop", walkMins: 3 }]) }),
  place({ id: "bri-badock", name: "Badock Hall", region: "bristol", city: "Bristol", area: "Stoke Bishop", type: "university-halls", lat: 51.482, lng: -2.625, rentWeekly: 158, deposit: 250, billsIncluded: true, rating: 4.0, rooms: 520, description: "University halls with a friendly community feel. Good value for Bristol first years.", amenities: ["wifi", "laundry", "common-room"], universities: uni("bristol", 42, 91), nearby: nearby([{ name: "Local shop", type: "convenience", walkMins: 8 }], [{ name: "Halls bar", walkMins: 2 }], [{ name: "Shuttle bus", walkMins: 3 }]) }),
  place({ id: "bri-unite", name: "Unite Students Bristol", region: "bristol", city: "Bristol", area: "Hotwells", type: "private-halls", lat: 51.4495, lng: -2.615, rentWeekly: 215, deposit: 320, billsIncluded: true, rating: 4.5, rooms: 410, description: "Modern riverside private halls with good shops nearby.", amenities: ["ensuite", "wifi", "gym", "laundry", "study-spaces"], universities: uni("bristol", 22, 58), nearby: nearby([{ name: "Asda Express", type: "supermarket", walkMins: 5 }, { name: "Hotwells shops", type: "retail", walkMins: 7 }], [{ name: "Watershed café", walkMins: 12 }], [{ name: "Hotwells bus links", walkMins: 4 }]) }),
  place({ id: "bri-clifton", name: "Clifton Shared House", region: "bristol", city: "Bristol", area: "Clifton", type: "shared-house", lat: 51.4608, lng: -2.6185, rentWeekly: 145, deposit: 500, rating: 4.0, rooms: 4, description: "Character shared house in Clifton close to campus and cafés.", amenities: ["wifi", "garden", "furnished"], universities: uni("bristol", 12, 76), nearby: nearby([{ name: "Co-op Clifton", type: "supermarket", walkMins: 4 }, { name: "Whiteladies Road", type: "retail", walkMins: 8 }], [{ name: "Spicer and Cole", walkMins: 6 }], [{ name: "Bus to precinct", walkMins: 3 }]) }),
  place({ id: "bri-redland", name: "Redland Private Flat", region: "bristol", city: "Bristol", area: "Redland", type: "private-rent", lat: 51.468, lng: -2.605, rentWeekly: 185, deposit: 850, rating: 4.1, rooms: 2, description: "Privately rented flat in Redland. Quieter residential feel, popular with returning students.", amenities: ["wifi", "furnished", "washer"], universities: uni("bristol", 18, 55), nearby: nearby([{ name: "Waitrose", type: "supermarket", walkMins: 7 }, { name: "Whiteladies Road", type: "retail", walkMins: 10 }], [{ name: "Independent cafés", walkMins: 6 }], [{ name: "Bus links", walkMins: 4 }]) }),
  place({ id: "bri-studio", name: "Park Street Studio", region: "bristol", city: "Bristol", area: "Park Street", type: "studio", lat: 51.4548, lng: -2.6025, rentWeekly: 235, deposit: 550, rating: 4.1, description: "City-centre studio above shops. Short campus walk, premium convenience.", amenities: ["ensuite", "wifi", "kitchenette"], universities: uni("bristol", 10, 42), nearby: nearby([{ name: "Park Street shops", type: "retail", walkMins: 1 }, { name: "Tesco Metro", type: "supermarket", walkMins: 5 }], [{ name: "Boston Tea Party", walkMins: 3 }], [{ name: "Triangle bus hub", walkMins: 4 }]) }),
  place({ id: "bri-easton", name: "Easton House Share", region: "bristol", city: "Bristol", area: "Easton", type: "private-rent", lat: 51.462, lng: -2.562, rentWeekly: 125, deposit: 600, rating: 3.7, rooms: 4, description: "Cheaper private rental east of the centre. Longer commute if budget is tight.", amenities: ["wifi", "garden"], universities: uni("bristol", 40, 35), nearby: nearby([{ name: "Tesco", type: "supermarket", walkMins: 6 }], [{ name: "Local café", walkMins: 5 }], [{ name: "Bus to campus", walkMins: 3 }]) }),

  // LEEDS
  place({ id: "lee-devonshire", name: "Devonshire Hall", region: "leeds", city: "Leeds", area: "Headingley", type: "university-halls", lat: 53.8215, lng: -1.575, rentWeekly: 148, deposit: 200, billsIncluded: true, rating: 4.1, rooms: 450, description: "Historic university halls in Headingley with buses into campus.", amenities: ["wifi", "laundry", "common-room", "study-spaces"], universities: uni("leeds", 35, 89), nearby: nearby([{ name: "Sainsbury's Local", type: "supermarket", walkMins: 7 }, { name: "Otley Road shops", type: "retail", walkMins: 8 }], [{ name: "North Bar", walkMins: 10 }], [{ name: "Headingley bus corridor", walkMins: 4 }]) }),
  place({ id: "lee-charles", name: "Charles Morris Hall", region: "leeds", city: "Leeds", area: "Campus", type: "university-halls", lat: 53.8075, lng: -1.5535, rentWeekly: 160, deposit: 200, billsIncluded: true, rating: 4.2, rooms: 380, description: "On-campus university halls with an unbeatable commute.", amenities: ["wifi", "laundry", "study-spaces", "ensuite"], universities: uni("leeds", 5, 94), nearby: nearby([{ name: "Campus shop", type: "convenience", walkMins: 3 }], [{ name: "Refectory", walkMins: 4 }], [{ name: "Campus stops", walkMins: 2 }]) }),
  place({ id: "lee-iq", name: "iQ Leeds The Plaza", region: "leeds", city: "Leeds", area: "City centre", type: "private-halls", lat: 53.7975, lng: -1.5465, rentWeekly: 205, deposit: 300, billsIncluded: true, rating: 4.4, rooms: 520, description: "Central private halls near shops, stations, and nightlife.", amenities: ["ensuite", "wifi", "gym", "cinema", "laundry"], universities: uni("leeds", 20, 52), nearby: nearby([{ name: "Trinity Leeds", type: "retail", walkMins: 5 }, { name: "Marks & Spencer", type: "supermarket", walkMins: 6 }], [{ name: "Coffee House Company", walkMins: 4 }], [{ name: "Leeds station", walkMins: 8 }]) }),
  place({ id: "lee-hyde", name: "Hyde Park Terrace House", region: "leeds", city: "Leeds", area: "Hyde Park", type: "shared-house", lat: 53.811, lng: -1.5635, rentWeekly: 118, deposit: 380, rating: 3.7, rooms: 5, description: "Budget student shared house near campus in a lively neighbourhood.", amenities: ["wifi", "bike-storage"], universities: uni("leeds", 11, 84), nearby: nearby([{ name: "Co-op Hyde Park", type: "supermarket", walkMins: 4 }, { name: "Corner shop", type: "convenience", walkMins: 2 }], [{ name: "Hyde Park Book Club", walkMins: 6 }], [{ name: "Campus walk", walkMins: 11 }]) }),
  place({ id: "lee-headingley", name: "Headingley Private Flat", region: "leeds", city: "Leeds", area: "Headingley", type: "private-rent", lat: 53.819, lng: -1.58, rentWeekly: 155, deposit: 750, rating: 3.9, rooms: 2, description: "Private rental flat in Headingley with shops, bars, and bus links to campus.", amenities: ["wifi", "furnished", "washer"], universities: uni("leeds", 32, 72), nearby: nearby([{ name: "Sainsbury's", type: "supermarket", walkMins: 5 }, { name: "Otley Road", type: "retail", walkMins: 4 }], [{ name: "Arcadia", walkMins: 6 }], [{ name: "Bus to uni", walkMins: 2 }]) }),
  place({ id: "lee-studio", name: "Woodhouse Lane Studio", region: "leeds", city: "Leeds", area: "Woodhouse", type: "studio", lat: 53.8085, lng: -1.552, rentWeekly: 198, deposit: 450, billsIncluded: true, rating: 4.0, rooms: 60, description: "Studio on the campus corridor for students who want their own space.", amenities: ["ensuite", "wifi", "kitchenette", "laundry"], universities: uni("leeds", 6, 65), nearby: nearby([{ name: "Tesco Express", type: "supermarket", walkMins: 4 }, { name: "Campus shop", type: "convenience", walkMins: 5 }], [{ name: "Refectory café", walkMins: 6 }], [{ name: "University bus stops", walkMins: 2 }]) }),

  // BIRMINGHAM
  place({ id: "bir-vale", name: "The Vale Village", region: "birmingham", city: "Birmingham", area: "Edgbaston", type: "university-halls", lat: 52.4485, lng: -1.9285, rentWeekly: 158, deposit: 250, billsIncluded: true, rating: 4.2, rooms: 1800, description: "Large university campus village with shops on-site. Extremely popular with first years.", amenities: ["wifi", "laundry", "gym", "study-spaces", "common-room"], universities: uni("birmingham", 8, 94), nearby: nearby([{ name: "Vale Village shop", type: "convenience", walkMins: 2 }, { name: "Selly Oak Sainsbury's", type: "supermarket", walkMins: 14 }], [{ name: "Vale café", walkMins: 3 }], [{ name: "Campus shuttle", walkMins: 4 }]) }),
  place({ id: "bir-mason", name: "Mason Hall", region: "birmingham", city: "Birmingham", area: "Edgbaston", type: "university-halls", lat: 52.4495, lng: -1.926, rentWeekly: 150, deposit: 250, billsIncluded: true, rating: 4.0, rooms: 400, description: "University halls close to teaching buildings. Reliable first-year choice.", amenities: ["wifi", "laundry", "common-room"], universities: uni("birmingham", 6, 93), nearby: nearby([{ name: "Campus shop", type: "convenience", walkMins: 4 }], [{ name: "Staff House", walkMins: 7 }], [{ name: "University station", walkMins: 12 }]) }),
  place({ id: "bir-iq", name: "iQ Birmingham", region: "birmingham", city: "Birmingham", area: "City centre", type: "private-halls", lat: 52.4795, lng: -1.904, rentWeekly: 225, deposit: 350, billsIncluded: true, rating: 4.5, rooms: 380, description: "City-centre private halls next to retail and nightlife. Longer commute to Edgbaston.", amenities: ["ensuite", "wifi", "gym", "cinema", "laundry"], universities: uni("birmingham", 48, 48), nearby: nearby([{ name: "Bullring / Grand Central", type: "retail", walkMins: 5 }, { name: "Tesco Metro", type: "supermarket", walkMins: 4 }], [{ name: "1000 Trades", walkMins: 8 }], [{ name: "New Street station", walkMins: 6 }]) }),
  place({ id: "bir-selly", name: "Selly Oak House Share", region: "birmingham", city: "Birmingham", area: "Selly Oak", type: "shared-house", lat: 52.4415, lng: -1.9375, rentWeekly: 122, deposit: 400, rating: 3.8, rooms: 6, description: "Classic Birmingham student shared house. Cheap, social, Bristol Road shops nearby.", amenities: ["wifi", "garden", "parking"], universities: uni("birmingham", 17, 86), nearby: nearby([{ name: "Sainsbury's Selly Oak", type: "supermarket", walkMins: 6 }, { name: "Bristol Road shops", type: "retail", walkMins: 5 }], [{ name: "The Oak", walkMins: 7 }], [{ name: "Selly Oak station", walkMins: 10 }]) }),
  place({ id: "bir-harborne", name: "Harborne Private Flat", region: "birmingham", city: "Birmingham", area: "Harborne", type: "private-rent", lat: 52.46, lng: -1.953, rentWeekly: 165, deposit: 800, rating: 4.0, rooms: 2, description: "Private rental in Harborne village. Quieter than Selly Oak with good cafés and shops.", amenities: ["wifi", "furnished", "washer"], universities: uni("birmingham", 26, 50), nearby: nearby([{ name: "Harborne High Street", type: "retail", walkMins: 4 }, { name: "Tesco", type: "supermarket", walkMins: 6 }], [{ name: "Harborne cafés", walkMins: 5 }], [{ name: "Bus to campus", walkMins: 3 }]) }),
  place({ id: "bir-studio", name: "Edgbaston Studio Suite", region: "birmingham", city: "Birmingham", area: "Edgbaston", type: "studio", lat: 52.452, lng: -1.922, rentWeekly: 208, deposit: 480, billsIncluded: true, rating: 4.1, rooms: 75, description: "Quiet studio near campus gates. Solid for focus and commute.", amenities: ["ensuite", "wifi", "kitchenette", "study-spaces"], universities: uni("birmingham", 9, 67), nearby: nearby([{ name: "Campus convenience", type: "convenience", walkMins: 5 }, { name: "Harborne Road Co-op", type: "supermarket", walkMins: 12 }], [{ name: "Staff House café", walkMins: 8 }], [{ name: "University station", walkMins: 11 }]) }),
];

// Append remaining cities in a compact batch
const extra = [
  // Nottingham
  ["not-broadgate", "Broadgate Park", "nottingham", "Nottingham", "University Park", "university-halls", 52.9405, -1.202, 155, true, 4.2, 2200, "Huge university halls village next to University Park.", ["wifi", "laundry", "gym", "common-room"], "nottingham", 10, 93, "Broadgate shop", "Hopper bus"],
  ["not-raleigh", "Raleigh Park", "nottingham", "Nottingham", "University Park", "university-halls", 52.942, -1.198, 148, true, 4.0, 800, "University-managed halls with a strong community close to lectures.", ["wifi", "laundry", "common-room"], "nottingham", 8, 92, "Campus shop", "Campus bus"],
  ["not-iq", "iQ Nottingham Newtown House", "nottingham", "Nottingham", "City centre", "private-halls", 52.954, -1.15, 198, true, 4.4, 340, "Private halls in the city with tram/bus back to University Park.", ["ensuite", "wifi", "gym", "laundry"], "nottingham", 45, 50, "Victoria Centre", "Tram to uni"],
  ["not-lenton", "Lenton Shared House", "nottingham", "Nottingham", "Lenton", "shared-house", 52.948, -1.175, 115, false, 3.8, 5, "Classic Lenton student house — cheap, social, packed with Nottingham students.", ["wifi", "garden", "bike-storage"], "nottingham", 22, 85, "Co-op Lenton", "Bus to campus"],
  ["not-beeston", "Beeston Private Flat", "nottingham", "Nottingham", "Beeston", "private-rent", 52.927, -1.215, 150, false, 3.9, 2, "Private rental in Beeston with strong supermarket access for returning students.", ["wifi", "furnished", "washer"], "nottingham", 28, 60, "Tesco Extra", "Tram / bus to uni"],
  ["not-studio", "Dunkirk Studio", "nottingham", "Nottingham", "Dunkirk", "studio", 52.944, -1.185, 185, true, 4.0, 50, "Studio between campus and Lenton — privacy with a short commute.", ["ensuite", "wifi", "kitchenette"], "nottingham", 15, 64, "Sainsbury's Local", "Bus to uni"],

  // Sheffield
  ["she-ranmoor", "Ranmoor Village", "sheffield", "Sheffield", "Ranmoor", "university-halls", 53.375, -1.522, 145, true, 4.1, 1100, "Large university halls village with buses into Western Bank campus.", ["wifi", "laundry", "common-room", "sports"], "sheffield", 32, 90, "Village shop", "Uni bus"],
  ["she-endcliffe", "Endcliffe Student Village", "sheffield", "Sheffield", "Endcliffe", "university-halls", 53.372, -1.515, 152, true, 4.2, 900, "University halls with strong facilities — a go-to for Sheffield first years.", ["wifi", "laundry", "gym", "study-spaces"], "sheffield", 26, 91, "Co-op", "Bus to campus"],
  ["she-unite", "Unite Students Sheffield", "sheffield", "Sheffield", "City centre", "private-halls", 53.381, -1.47, 190, true, 4.3, 400, "Central private halls near shops and stations.", ["ensuite", "wifi", "gym", "laundry"], "sheffield", 18, 55, "Tesco", "Sheffield station"],
  ["she-broomhill", "Broomhill Shared House", "sheffield", "Sheffield", "Broomhill", "shared-house", 53.378, -1.498, 110, false, 3.9, 5, "Affordable shared house on one of Sheffield's main student private-rent streets.", ["wifi", "garden"], "sheffield", 13, 82, "Broomhill shops", "Bus to campus"],
  ["she-crookes", "Crookes Private Flat", "sheffield", "Sheffield", "Crookes", "private-rent", 53.385, -1.508, 140, false, 3.8, 2, "Private flat in Crookes with good local shops for returning students.", ["wifi", "furnished", "washer"], "sheffield", 24, 58, "Co-op", "Bus to uni"],
  ["she-studio", "Western Bank Studio", "sheffield", "Sheffield", "Western Bank", "studio", 53.3815, -1.487, 175, true, 4.0, 40, "Studio near campus with a short walk to lectures.", ["ensuite", "wifi", "kitchenette"], "sheffield", 6, 70, "Campus shop", "Campus stops"],

  // Liverpool
  ["liv-vinecourt", "Vine Court", "liverpool", "Liverpool", "City campus", "university-halls", 53.4055, -2.965, 150, true, 4.1, 900, "University halls right by campus — ideal first-year base.", ["wifi", "laundry", "common-room", "ensuite"], "liverpool", 6, 92, "Campus shop", "Campus bus"],
  ["liv-crown", "Crown Place", "liverpool", "Liverpool", "City centre", "private-halls", 53.408, -2.98, 185, true, 4.3, 500, "Private student halls near shops and nightlife.", ["ensuite", "wifi", "gym", "laundry", "cinema"], "liverpool", 16, 60, "Liverpool ONE", "Lime Street"],
  ["liv-kensington", "Kensington Shared House", "liverpool", "Liverpool", "Kensington", "shared-house", 53.411, -2.948, 105, false, 3.6, 5, "Budget shared house in a busy student private-rent area.", ["wifi", "garden"], "liverpool", 20, 78, "Asda", "Bus to campus"],
  ["liv-wavertree", "Wavertree Private Flat", "liverpool", "Liverpool", "Wavertree", "private-rent", 53.4, -2.93, 135, false, 3.8, 2, "Private flat with good local shops, popular for year 2+ renting.", ["wifi", "furnished", "washer"], "liverpool", 35, 45, "Tesco", "Bus to uni"],
  ["liv-studio", "Mount Pleasant Studio", "liverpool", "Liverpool", "Mount Pleasant", "studio", 53.404, -2.97, 170, true, 4.0, 55, "Studio near campus and city amenities.", ["ensuite", "wifi", "kitchenette"], "liverpool", 8, 66, "Corner shop", "Bus links"],

  // Newcastle
  ["new-henderson", "Henderson Hall", "newcastle", "Newcastle", "Jesmond", "university-halls", 54.991, -1.605, 142, true, 4.0, 450, "University halls in Jesmond with shops and buses into campus.", ["wifi", "laundry", "common-room"], "newcastle", 24, 88, "Jesmond shops", "Bus to campus"],
  ["new-parkview", "Park View Student Village", "newcastle", "Newcastle", "Campus", "university-halls", 54.98, -1.615, 155, true, 4.2, 600, "Campus-side university accommodation with a short walk to lectures.", ["wifi", "laundry", "ensuite", "study-spaces"], "newcastle", 7, 93, "Campus shop", "Campus stops"],
  ["new-iq", "iQ Newcastle", "newcastle", "Newcastle", "City centre", "private-halls", 54.973, -1.615, 195, true, 4.4, 380, "Private halls near Northumberland Street shops and nightlife.", ["ensuite", "wifi", "gym", "laundry", "cinema"], "newcastle", 14, 58, "Northumberland Street", "Monument Metro"],
  ["new-jesmond", "Jesmond Shared House", "newcastle", "Newcastle", "Jesmond", "shared-house", 54.988, -1.608, 120, false, 3.9, 5, "Private shared house in Jesmond — Newcastle's classic student rent street.", ["wifi", "garden", "furnished"], "newcastle", 20, 80, "Co-op", "Bus / Metro links"],
  ["new-heaton", "Heaton Private Flat", "newcastle", "Newcastle", "Heaton", "private-rent", 54.985, -1.58, 135, false, 3.8, 2, "Private rental in Heaton with local shops and a slightly longer commute.", ["wifi", "furnished", "washer"], "newcastle", 30, 48, "Tesco", "Metro / bus"],

  // Edinburgh
  ["edi-pollock", "Pollock Halls", "edinburgh", "Edinburgh", "Holyrood", "university-halls", 55.9405, -3.171, 195, true, 4.2, 2000, "Large university halls beneath Arthur's Seat. Very popular with Edinburgh first years.", ["wifi", "laundry", "common-room", "gym", "catered"], "edinburgh", 25, 92, "Pollock shop", "Bus to central campus"],
  ["edi-unite", "Unite Students Edinburgh", "edinburgh", "Edinburgh", "Fountainbridge", "private-halls", 55.943, -3.21, 260, true, 4.5, 420, "Modern private halls with excellent facilities and city access. Higher Edinburgh rents.", ["ensuite", "wifi", "gym", "laundry", "study-spaces"], "edinburgh", 22, 55, "Tesco", "Bus / tram links"],
  ["edi-marchmont", "Marchmont Shared Flat", "edinburgh", "Edinburgh", "Marchmont", "shared-house", 55.937, -3.192, 165, false, 4.0, 4, "Traditional Marchmont tenement share — classic Edinburgh private student renting.", ["wifi", "furnished"], "edinburgh", 14, 75, "Marchmont shops", "Bus to campus"],
  ["edi-newington", "Newington Private Flat", "edinburgh", "Edinburgh", "Newington", "private-rent", 55.939, -3.178, 210, false, 4.1, 2, "Private flat in Newington with great shops on South Clerk Street.", ["wifi", "furnished", "washer"], "edinburgh", 16, 60, "Sainsbury's", "Bus to uni"],
  ["edi-studio", "Southside Studio", "edinburgh", "Edinburgh", "Southside", "studio", 55.942, -3.184, 250, true, 4.2, 35, "Self-contained studio near central campus. Expensive but hard to beat for commute.", ["ensuite", "wifi", "kitchenette"], "edinburgh", 7, 58, "Tesco Metro", "Central buses"],

  // Glasgow
  ["gla-murano", "Murano Street Student Village", "glasgow", "Glasgow", "Maryhill", "university-halls", 55.891, -4.292, 140, true, 3.9, 1700, "Large university halls village. Affordable and social with buses into Gilmorehill.", ["wifi", "laundry", "common-room", "sports"], "glasgow", 35, 88, "Village shop", "Bus to campus"],
  ["gla-queen", "Queen Margaret Residences", "glasgow", "Glasgow", "Kelvinside", "university-halls", 55.878, -4.292, 155, true, 4.1, 700, "University residences near the West End, closer to campus than Murano.", ["wifi", "laundry", "study-spaces"], "glasgow", 12, 90, "Byres Road shops", "Hillhead Subway"],
  ["gla-unite", "Unite Students Glasgow", "glasgow", "Glasgow", "City centre", "private-halls", 55.862, -4.255, 200, true, 4.4, 450, "City-centre private halls with shops and nightlife on the doorstep.", ["ensuite", "wifi", "gym", "laundry"], "glasgow", 32, 48, "Buchanan Galleries", "Buchanan Street Subway"],
  ["gla-byres", "Byres Road Shared Flat", "glasgow", "Glasgow", "West End", "shared-house", 55.875, -4.294, 130, false, 4.0, 4, "West End shared flat near Byres Road — classic Glasgow private student renting.", ["wifi", "furnished"], "glasgow", 10, 78, "Waitrose", "Hillhead Subway"],
  ["gla-partick", "Partick Private Flat", "glasgow", "Glasgow", "Partick", "private-rent", 55.87, -4.31, 145, false, 3.9, 2, "Private rental in Partick with supermarket and subway access.", ["wifi", "furnished", "washer"], "glasgow", 22, 52, "Morrisons", "Partick Subway"],

  // Cardiff
  ["car-talybont", "Talybont Residences", "cardiff", "Cardiff", "Talybont", "university-halls", 51.497, -3.195, 148, true, 4.1, 1500, "Major Cardiff University halls site with campus bus links.", ["wifi", "laundry", "common-room", "sports"], "cardiff", 20, 91, "Halls shop", "Uni bus"],
  ["car-aberconway", "Aberconway Halls", "cardiff", "Cardiff", "Cathays", "university-halls", 51.49, -3.18, 155, true, 4.0, 400, "University halls closer to Cathays campus and student streets.", ["wifi", "laundry", "study-spaces"], "cardiff", 7, 90, "Salisbury Road shops", "Cathays station"],
  ["car-unite", "Unite Students Cardiff", "cardiff", "Cardiff", "City centre", "private-halls", 51.48, -3.175, 185, true, 4.3, 360, "Private halls near the city centre, shops and nightlife.", ["ensuite", "wifi", "gym", "laundry"], "cardiff", 16, 55, "St David's Centre", "Cardiff Central"],
  ["car-cathays", "Cathays Shared House", "cardiff", "Cardiff", "Cathays", "shared-house", 51.492, -3.178, 112, false, 3.8, 6, "Cathays student house — Cardiff's main private-rent student neighbourhood.", ["wifi", "garden", "bike-storage"], "cardiff", 9, 86, "Crwys Road shops", "Cathays station"],
  ["car-roath", "Roath Private Flat", "cardiff", "Cardiff", "Roath", "private-rent", 51.49, -3.165, 140, false, 3.9, 2, "Private flat in Roath with parks and local shops for year 2+ renting.", ["wifi", "furnished", "washer"], "cardiff", 18, 55, "Wellfield Road", "Bus to campus"],

  // Southampton
  ["sou-wessex", "Wessex Lane Halls", "southampton", "Southampton", "Swaythling", "university-halls", 50.937, -1.375, 145, true, 4.0, 1800, "Large university halls site with a strong first-year community.", ["wifi", "laundry", "common-room", "sports"], "southampton", 22, 90, "Halls shop", "Uni bus"],
  ["sou-highfield", "Highfield Hall", "southampton", "Southampton", "Highfield", "university-halls", 50.935, -1.397, 160, true, 4.2, 500, "Halls close to the Highfield campus — short walk to lectures.", ["wifi", "laundry", "ensuite", "study-spaces"], "southampton", 6, 93, "Campus shop", "Campus stops"],
  ["sou-unite", "Unite Students Southampton", "southampton", "Southampton", "City centre", "private-halls", 50.91, -1.404, 180, true, 4.3, 320, "Private halls in the city centre near shops and the station.", ["ensuite", "wifi", "gym", "laundry"], "southampton", 35, 50, "Westquay", "Southampton Central"],
  ["sou-portswood", "Portswood Shared House", "southampton", "Southampton", "Portswood", "shared-house", 50.928, -1.392, 118, false, 3.8, 5, "Portswood student house — the main private-rent strip for Southampton students.", ["wifi", "garden"], "southampton", 14, 82, "Portswood Broadway", "Bus to campus"],
  ["sou-private", "Portswood Private Flat", "southampton", "Southampton", "Portswood", "private-rent", 50.926, -1.39, 145, false, 3.9, 2, "Private rental flat above the shops on Portswood Broadway.", ["wifi", "furnished", "washer"], "southampton", 16, 60, "Sainsbury's Local", "Bus to uni"],

  // Bath
  ["bat-eastwood", "Eastwood Student Village", "bath", "Bath", "Campus", "university-halls", 51.379, -2.328, 170, true, 4.3, 900, "On-campus university halls with excellent facilities and a short walk to teaching buildings.", ["wifi", "laundry", "gym", "ensuite", "study-spaces"], "bath", 5, 94, "Campus shop", "Campus loop"],
  ["bat-woodland", "Woodland Court", "bath", "Bath", "Campus", "university-halls", 51.377, -2.33, 162, true, 4.1, 600, "University halls on campus — popular, social, and convenient.", ["wifi", "laundry", "common-room"], "bath", 7, 92, "Campus shop", "Campus stops"],
  ["bat-unite", "Unite Students Bath", "bath", "Bath", "City centre", "private-halls", 51.382, -2.36, 230, true, 4.4, 280, "Private halls in Bath city centre near shops; bus up to campus.", ["ensuite", "wifi", "gym", "laundry"], "bath", 35, 48, "SouthGate", "Bus to campus"],
  ["bat-oldfield", "Oldfield Park Shared House", "bath", "Bath", "Oldfield Park", "shared-house", 51.375, -2.375, 150, false, 3.9, 5, "Shared house in Oldfield Park — Bath's main student private-rent area.", ["wifi", "garden", "furnished"], "bath", 28, 80, "Local shops", "Bus / train to campus"],
  ["bat-private", "Widcombe Private Flat", "bath", "Bath", "Widcombe", "private-rent", 51.376, -2.352, 195, false, 4.0, 2, "Private flat in Widcombe with canal-side cafés and a steeper campus commute.", ["wifi", "furnished", "washer"], "bath", 30, 45, "Widcombe Parade", "Bus to uni"],

  // York
  ["yor-halifax", "Halifax College", "york", "York", "Heslington", "university-halls", 53.947, -1.055, 155, true, 4.2, 1200, "Large university college halls on Heslington campus.", ["wifi", "laundry", "common-room", "study-spaces"], "york", 8, 93, "Campus shop", "Campus bus"],
  ["yor-james", "James College", "york", "York", "Heslington", "university-halls", 53.945, -1.053, 150, true, 4.1, 800, "University college accommodation with a strong community feel.", ["wifi", "laundry", "ensuite"], "york", 6, 92, "Campus shop", "Campus stops"],
  ["yor-iq", "iQ York", "york", "York", "City centre", "private-halls", 53.958, -1.082, 195, true, 4.3, 300, "Private halls near York city centre shops and the station.", ["ensuite", "wifi", "gym", "laundry"], "york", 40, 45, "Coppergate", "Bus to campus"],
  ["yor-badger", "Badger Hill Shared House", "york", "York", "Badger Hill", "shared-house", 53.955, -1.04, 125, false, 3.8, 5, "Shared house near campus — popular private-rent option for York students.", ["wifi", "garden"], "york", 15, 78, "Local Co-op", "Walk / bus to campus"],
  ["yor-private", "Fulford Private Flat", "york", "York", "Fulford", "private-rent", 53.948, -1.07, 155, false, 3.9, 2, "Private rental toward Fulford with decent shops and bus links.", ["wifi", "furnished", "washer"], "york", 25, 50, "Fulford shops", "Bus to uni"],

  // London
  ["lon-rams", "Ramsay Hall", "london", "London", "Bloomsbury", "university-halls", 51.5235, -0.133, 280, true, 4.0, 500, "UCL university halls in Bloomsbury. Expensive London rents, unbeatable central location.", ["wifi", "laundry", "common-room", "study-spaces"], "ucl", 6, 88, "Tesco Metro", "Euston / Warren Street", "kings", 18, 25],
  ["lon-garden", "Garden Halls", "london", "London", "Cartwright Gardens", "university-halls", 51.526, -0.128, 295, true, 4.2, 1200, "Large central university halls used by London students. Premium price for campus proximity.", ["wifi", "laundry", "gym", "ensuite"], "ucl", 10, 70, "Local shops", "Russell Square", "kings", 20, 40],
  ["lon-chapter", "Chapter Kings Cross", "london", "London", "King's Cross", "private-halls", 51.532, -0.122, 420, true, 4.6, 600, "Premium private student halls near King's Cross with top-tier facilities.", ["ensuite", "wifi", "gym", "cinema", "laundry", "study-spaces"], "ucl", 18, 45, "King's Cross shops", "King's Cross St Pancras", "kings", 25, 40],
  ["lon-unite", "Unite Students London", "london", "London", "Elephant & Castle", "private-halls", 51.494, -0.1, 350, true, 4.3, 700, "Private halls south of the river. Strong for King's students, longer trip to UCL.", ["ensuite", "wifi", "gym", "laundry"], "kings", 16, 65, "Elephant shopping", "Elephant & Castle", "ucl", 35, 30],
  ["lon-camden", "Camden Shared Flat", "london", "London", "Camden", "shared-house", 51.539, -0.142, 260, false, 3.8, 4, "Shared private flat in Camden. Lively area, classic London student private renting.", ["wifi", "furnished"], "ucl", 28, 40, "Camden High Street", "Camden Town tube", "kings", 35, 30],
  ["lon-zone2", "Zone 2 Private Studio", "london", "London", "Holloway", "private-rent", 51.552, -0.117, 300, false, 3.9, 1, "Private studio rental in Zone 2. Cheaper than central halls, longer commute.", ["wifi", "furnished", "kitchenette"], "ucl", 40, 28, "Local supermarket", "Holloway Road tube", "kings", 45, 25],
  ["lon-studio", "Bloomsbury Studio", "london", "London", "Bloomsbury", "studio", 51.522, -0.13, 390, true, 4.2, 40, "Central studio near UCL and the British Museum. High rent for maximum convenience.", ["ensuite", "wifi", "kitchenette"], "ucl", 5, 55, "Tottenham Court Road shops", "Goodge Street", "kings", 16, 35]
];

for (const row of extra) {
  const [
    id, name, region, city, area, type, lat, lng, rentWeekly, billsIncluded, rating, rooms,
    description, amenities, uniId, walk, share, storeName, transportName,
    uniId2, walk2, share2
  ] = row;

  const universities = uniId2
    ? multi([uni(uniId, walk, share), uni(uniId2, walk2, share2)])
    : uni(uniId, walk, share);

  ACCOMMODATIONS.push(
    place({
      id,
      name,
      region,
      city,
      area,
      type,
      lat,
      lng,
      rentWeekly,
      deposit: type === "private-rent" ? 700 : type === "shared-house" ? 400 : billsIncluded ? 250 : 450,
      billsIncluded,
      rating,
      rooms,
      description,
      amenities,
      universities,
      nearby: nearby(
        [{ name: storeName, type: storeName.toLowerCase().includes("tesco") || storeName.toLowerCase().includes("sains") || storeName.toLowerCase().includes("asda") || storeName.toLowerCase().includes("coop") || storeName.toLowerCase().includes("co-op") || storeName.toLowerCase().includes("waitrose") || storeName.toLowerCase().includes("morrison") ? "supermarket" : storeName.toLowerCase().includes("shop") ? "convenience" : "retail", walkMins: 4 }],
        [{ name: "Local café", walkMins: 5 }],
        [{ name: transportName, walkMins: 3 }]
      )
    })
  );
}

const out = `/**
 * Seed data for StayCompare — student accommodation discovery.
 * Coordinates are approximate and used for map + distance demos.
 * Works in Node (module.exports) and the browser (window.StayCompareData).
 * Generated by scripts/generate-data.js
 */
(function (root, factory) {
  const data = factory();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = data;
  }
  root.StayCompareData = data;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {

const UNIVERSITIES = ${JSON.stringify(UNIVERSITIES, null, 2)};

const REGIONS = ${JSON.stringify(REGIONS, null, 2)};

const ACCOMMODATIONS = ${JSON.stringify(ACCOMMODATIONS, null, 2)};

const TYPE_LABELS = ${JSON.stringify(TYPE_LABELS, null, 2)};

return {
  UNIVERSITIES,
  REGIONS,
  ACCOMMODATIONS,
  TYPE_LABELS
};

});
`;

const target = path.join(__dirname, "..", "data.js");
fs.writeFileSync(target, out);
const byType = ACCOMMODATIONS.reduce((acc, a) => {
  acc[a.type] = (acc[a.type] || 0) + 1;
  return acc;
}, {});
console.log("Wrote", target);
console.log("universities", UNIVERSITIES.length);
console.log("regions", REGIONS.length);
console.log("accommodations", ACCOMMODATIONS.length);
console.log("by type", byType);
