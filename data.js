/**
 * Seed data for StayCompare — student accommodation discovery.
 * Coordinates are approximate and used for map + distance demos.
 */

const UNIVERSITIES = [
  {
    id: "exeter",
    name: "University of Exeter",
    shortName: "Exeter",
    city: "Exeter",
    region: "exeter",
    lat: 50.7352,
    lng: -3.5342
  },
  {
    id: "manchester",
    name: "University of Manchester",
    shortName: "Manchester",
    city: "Manchester",
    region: "manchester",
    lat: 53.4668,
    lng: -2.2339
  },
  {
    id: "bristol",
    name: "University of Bristol",
    shortName: "Bristol",
    city: "Bristol",
    region: "bristol",
    lat: 51.4584,
    lng: -2.603
  },
  {
    id: "leeds",
    name: "University of Leeds",
    shortName: "Leeds",
    city: "Leeds",
    region: "leeds",
    lat: 53.8067,
    lng: -1.555
  },
  {
    id: "birmingham",
    name: "University of Birmingham",
    shortName: "Birmingham",
    city: "Birmingham",
    region: "birmingham",
    lat: 52.4508,
    lng: -1.9305
  }
];

const REGIONS = [
  {
    id: "exeter",
    name: "Exeter",
    label: "Exeter & campus area",
    lat: 50.7184,
    lng: -3.5339,
    zoom: 13
  },
  {
    id: "manchester",
    name: "Manchester",
    label: "Manchester city & Oxford Road",
    lat: 53.4808,
    lng: -2.2426,
    zoom: 13
  },
  {
    id: "bristol",
    name: "Bristol",
    label: "Bristol & Clifton",
    lat: 51.4545,
    lng: -2.5879,
    zoom: 13
  },
  {
    id: "leeds",
    name: "Leeds",
    label: "Leeds & Headingley",
    lat: 53.8008,
    lng: -1.5491,
    zoom: 13
  },
  {
    id: "birmingham",
    name: "Birmingham",
    label: "Birmingham & Selly Oak",
    lat: 52.4862,
    lng: -1.8904,
    zoom: 12
  }
];

const ACCOMMODATIONS = [
  {
    id: "ex-birks",
    name: "Birks Grange Village",
    region: "exeter",
    city: "Exeter",
    area: "Streatham Campus",
    type: "university-halls",
    lat: 50.7378,
    lng: -3.5395,
    rentWeekly: 168,
    deposit: 250,
    billsIncluded: true,
    rating: 4.3,
    rooms: 1200,
    description:
      "On-campus halls with ensuite rooms, shared kitchens, and a short walk to teaching buildings. Strong Exeter student community.",
    amenities: ["ensuite", "wifi", "laundry", "study-spaces", "gym"],
    universities: {
      exeter: { distanceKm: 0.6, walkMins: 8, cycleMins: 4, uniShare: 92 }
    },
    nearby: {
      stores: [
        { name: "Campus shop", type: "convenience", walkMins: 3 },
        { name: "Co-op Streatham", type: "supermarket", walkMins: 12 }
      ],
      cafes: [{ name: "Forum Café", walkMins: 7 }],
      transport: [{ name: "University bus stop", walkMins: 2 }]
    },
    imageTone: "campus"
  },
  {
    id: "ex-holland",
    name: "Holland Hall",
    region: "exeter",
    city: "Exeter",
    area: "Streatham Campus",
    type: "university-halls",
    lat: 50.7401,
    lng: -3.535,
    rentWeekly: 155,
    deposit: 250,
    billsIncluded: true,
    rating: 4.1,
    rooms: 480,
    description:
      "Hilltop halls with panoramic views. Shared bathrooms keep rent lower; popular with first-year Exeter students.",
    amenities: ["wifi", "laundry", "study-spaces", "common-room"],
    universities: {
      exeter: { distanceKm: 0.4, walkMins: 6, cycleMins: 3, uniShare: 95 }
    },
    nearby: {
      stores: [{ name: "Campus shop", type: "convenience", walkMins: 5 }],
      cafes: [{ name: "Holland Hall bar", walkMins: 1 }],
      transport: [{ name: "Campus bus loop", walkMins: 4 }]
    },
    imageTone: "campus"
  },
  {
    id: "ex-into",
    name: "INTO Exeter Residences",
    region: "exeter",
    city: "Exeter",
    area: "City centre",
    type: "private-halls",
    lat: 50.7235,
    lng: -3.5298,
    rentWeekly: 195,
    deposit: 300,
    billsIncluded: true,
    rating: 4.4,
    rooms: 320,
    description:
      "Modern private halls near the high street. Slightly further from campus but excellent shops and nightlife on the doorstep.",
    amenities: ["ensuite", "wifi", "gym", "cinema", "laundry"],
    universities: {
      exeter: { distanceKm: 2.1, walkMins: 28, cycleMins: 12, uniShare: 61 }
    },
    nearby: {
      stores: [
        { name: "Sainsbury's Local", type: "supermarket", walkMins: 4 },
        { name: "Primark / High Street", type: "retail", walkMins: 6 }
      ],
      cafes: [{ name: "Boston Tea Party", walkMins: 5 }],
      transport: [{ name: "Exeter Central station", walkMins: 8 }]
    },
    imageTone: "city"
  },
  {
    id: "ex-stocker",
    name: "Stocker Road House Share",
    region: "exeter",
    city: "Exeter",
    area: "Stocker Road",
    type: "shared-house",
    lat: 50.7312,
    lng: -3.5285,
    rentWeekly: 128,
    deposit: 400,
    billsIncluded: false,
    rating: 3.9,
    rooms: 5,
    description:
      "Classic student house between campus and town. Lower rent, shared facilities, and a strong Exeter undergrad presence on the street.",
    amenities: ["wifi", "garden", "parking"],
    universities: {
      exeter: { distanceKm: 1.2, walkMins: 16, cycleMins: 7, uniShare: 74 }
    },
    nearby: {
      stores: [
        { name: "Tesco Express", type: "supermarket", walkMins: 5 },
        { name: "Corner shop", type: "convenience", walkMins: 2 }
      ],
      cafes: [{ name: "The Imperial", walkMins: 8 }],
      transport: [{ name: "Bus to Streatham", walkMins: 3 }]
    },
    imageTone: "house"
  },
  {
    id: "ex-studio",
    name: "Queen Street Studio",
    region: "exeter",
    city: "Exeter",
    area: "City centre",
    type: "studio",
    lat: 50.7258,
    lng: -3.5272,
    rentWeekly: 220,
    deposit: 500,
    billsIncluded: false,
    rating: 4.0,
    rooms: 1,
    description:
      "Self-contained studio for students who want privacy and city life. Higher rent; best if budget allows and you value independence.",
    amenities: ["ensuite", "wifi", "kitchenette", "furnished"],
    universities: {
      exeter: { distanceKm: 2.4, walkMins: 32, cycleMins: 14, uniShare: 38 }
    },
    nearby: {
      stores: [
        { name: "M&S Foodhall", type: "supermarket", walkMins: 3 },
        { name: "Guildhall Shopping", type: "retail", walkMins: 4 }
      ],
      cafes: [{ name: "Coffee #1", walkMins: 2 }],
      transport: [{ name: "Exeter Central", walkMins: 5 }]
    },
    imageTone: "studio"
  },
  {
    id: "man-owens",
    name: "Owens Park",
    region: "manchester",
    city: "Manchester",
    area: "Fallowfield",
    type: "university-halls",
    lat: 53.4425,
    lng: -2.218,
    rentWeekly: 152,
    deposit: 200,
    billsIncluded: true,
    rating: 4.0,
    rooms: 1100,
    description:
      "Large Manchester halls in Fallowfield with a huge student social scene. Buses run straight into campus.",
    amenities: ["wifi", "laundry", "common-room", "sports"],
    universities: {
      manchester: { distanceKm: 3.2, walkMins: 40, cycleMins: 15, uniShare: 88 }
    },
    nearby: {
      stores: [
        { name: "Sainsbury's Fallowfield", type: "supermarket", walkMins: 6 },
        { name: "Wilmslow Road shops", type: "retail", walkMins: 8 }
      ],
      cafes: [{ name: "Toast of Manchester", walkMins: 7 }],
      transport: [{ name: "Fallowfield bus corridor", walkMins: 3 }]
    },
    imageTone: "campus"
  },
  {
    id: "man-vita",
    name: "Vita Student Manchester",
    region: "manchester",
    city: "Manchester",
    area: "First Street",
    type: "private-halls",
    lat: 53.4735,
    lng: -2.246,
    rentWeekly: 245,
    deposit: 350,
    billsIncluded: true,
    rating: 4.6,
    rooms: 280,
    description:
      "Premium private student living with co-working spaces and gym. Close to city amenities; mid commute to Oxford Road campus.",
    amenities: ["ensuite", "wifi", "gym", "cinema", "laundry", "study-spaces"],
    universities: {
      manchester: { distanceKm: 1.8, walkMins: 24, cycleMins: 10, uniShare: 55 }
    },
    nearby: {
      stores: [
        { name: "Tesco Express", type: "supermarket", walkMins: 4 },
        { name: "Deansgate shops", type: "retail", walkMins: 10 }
      ],
      cafes: [{ name: "Federal Café", walkMins: 6 }],
      transport: [{ name: "Deansgate-Castlefield Metrolink", walkMins: 7 }]
    },
    imageTone: "city"
  },
  {
    id: "man-victoria",
    name: "Victoria Park House",
    region: "manchester",
    city: "Manchester",
    area: "Victoria Park",
    type: "shared-house",
    lat: 53.455,
    lng: -2.221,
    rentWeekly: 135,
    deposit: 450,
    billsIncluded: false,
    rating: 3.8,
    rooms: 6,
    description:
      "Affordable shared house popular with Manchester undergrads. Walkable to campus and surrounded by student lets.",
    amenities: ["wifi", "garden", "bike-storage"],
    universities: {
      manchester: { distanceKm: 1.4, walkMins: 18, cycleMins: 8, uniShare: 81 }
    },
    nearby: {
      stores: [
        { name: "Co-op", type: "supermarket", walkMins: 5 },
        { name: "Corner shop", type: "convenience", walkMins: 2 }
      ],
      cafes: [{ name: "Fuel Café", walkMins: 9 }],
      transport: [{ name: "Oxford Road bus", walkMins: 6 }]
    },
    imageTone: "house"
  },
  {
    id: "man-studio",
    name: "Oxford Road Studio Pod",
    region: "manchester",
    city: "Manchester",
    area: "Oxford Road",
    type: "studio",
    lat: 53.4638,
    lng: -2.2325,
    rentWeekly: 210,
    deposit: 400,
    billsIncluded: true,
    rating: 4.2,
    rooms: 90,
    description:
      "Compact studio steps from campus. Ideal if your priority is commute time and you can stretch the budget.",
    amenities: ["ensuite", "wifi", "kitchenette", "laundry"],
    universities: {
      manchester: { distanceKm: 0.5, walkMins: 7, cycleMins: 3, uniShare: 70 }
    },
    nearby: {
      stores: [
        { name: "Tesco Express", type: "supermarket", walkMins: 3 },
        { name: "Campus convenience", type: "convenience", walkMins: 4 }
      ],
      cafes: [{ name: "Christie Café", walkMins: 5 }],
      transport: [{ name: "Oxford Road station", walkMins: 8 }]
    },
    imageTone: "studio"
  },
  {
    id: "bri-hiatt",
    name: "Hiatt Baker Hall",
    region: "bristol",
    city: "Bristol",
    area: "Stoke Bishop",
    type: "university-halls",
    lat: 51.4805,
    lng: -2.628,
    rentWeekly: 162,
    deposit: 250,
    billsIncluded: true,
    rating: 4.2,
    rooms: 600,
    description:
      "Leafy Bristol halls with a big first-year community. Shuttle buses connect you to the main precinct.",
    amenities: ["wifi", "laundry", "common-room", "sports"],
    universities: {
      bristol: { distanceKm: 3.5, walkMins: 45, cycleMins: 18, uniShare: 90 }
    },
    nearby: {
      stores: [{ name: "Sainsbury's Local", type: "supermarket", walkMins: 10 }],
      cafes: [{ name: "Halls café", walkMins: 2 }],
      transport: [{ name: "Uni shuttle stop", walkMins: 3 }]
    },
    imageTone: "campus"
  },
  {
    id: "bri-unite",
    name: "Unite Students Bristol",
    region: "bristol",
    city: "Bristol",
    area: "Hotwells",
    type: "private-halls",
    lat: 51.4495,
    lng: -2.615,
    rentWeekly: 215,
    deposit: 320,
    billsIncluded: true,
    rating: 4.5,
    rooms: 410,
    description:
      "Modern riverside private halls. Good shops nearby and a mix of Bristol students from different years.",
    amenities: ["ensuite", "wifi", "gym", "laundry", "study-spaces"],
    universities: {
      bristol: { distanceKm: 1.6, walkMins: 22, cycleMins: 9, uniShare: 58 }
    },
    nearby: {
      stores: [
        { name: "Asda Express", type: "supermarket", walkMins: 5 },
        { name: "Hotwells shops", type: "retail", walkMins: 7 }
      ],
      cafes: [{ name: "Watershed café", walkMins: 12 }],
      transport: [{ name: "Hotwells bus links", walkMins: 4 }]
    },
    imageTone: "city"
  },
  {
    id: "bri-clifton",
    name: "Clifton Shared House",
    region: "bristol",
    city: "Bristol",
    area: "Clifton",
    type: "shared-house",
    lat: 51.4608,
    lng: -2.6185,
    rentWeekly: 145,
    deposit: 500,
    billsIncluded: false,
    rating: 4.0,
    rooms: 4,
    description:
      "Character house in Clifton. Close to campus and cafés; many Bristol students live on this stretch.",
    amenities: ["wifi", "garden", "furnished"],
    universities: {
      bristol: { distanceKm: 0.9, walkMins: 12, cycleMins: 5, uniShare: 76 }
    },
    nearby: {
      stores: [
        { name: "Co-op Clifton", type: "supermarket", walkMins: 4 },
        { name: "Whiteladies Road", type: "retail", walkMins: 8 }
      ],
      cafes: [{ name: "Spicer and Cole", walkMins: 6 }],
      transport: [{ name: "Bus to precinct", walkMins: 3 }]
    },
    imageTone: "house"
  },
  {
    id: "bri-studio",
    name: "Park Street Studio",
    region: "bristol",
    city: "Bristol",
    area: "Park Street",
    type: "studio",
    lat: 51.4548,
    lng: -2.6025,
    rentWeekly: 235,
    deposit: 550,
    billsIncluded: false,
    rating: 4.1,
    rooms: 1,
    description:
      "City-centre studio above shops. Short walk to campus, endless stores — premium price for the convenience.",
    amenities: ["ensuite", "wifi", "kitchenette"],
    universities: {
      bristol: { distanceKm: 0.7, walkMins: 10, cycleMins: 4, uniShare: 42 }
    },
    nearby: {
      stores: [
        { name: "Park Street shops", type: "retail", walkMins: 1 },
        { name: "Tesco Metro", type: "supermarket", walkMins: 5 }
      ],
      cafes: [{ name: "Boston Tea Party", walkMins: 3 }],
      transport: [{ name: "Triangle bus hub", walkMins: 4 }]
    },
    imageTone: "studio"
  },
  {
    id: "lee-devonshire",
    name: "Devonshire Hall",
    region: "leeds",
    city: "Leeds",
    area: "Headingley",
    type: "university-halls",
    lat: 53.8215,
    lng: -1.575,
    rentWeekly: 148,
    deposit: 200,
    billsIncluded: true,
    rating: 4.1,
    rooms: 450,
    description:
      "Historic Leeds halls in Headingley. Strong uni community with buses into campus and shops along Otley Road.",
    amenities: ["wifi", "laundry", "common-room", "study-spaces"],
    universities: {
      leeds: { distanceKm: 2.8, walkMins: 35, cycleMins: 14, uniShare: 89 }
    },
    nearby: {
      stores: [
        { name: "Sainsbury's Local", type: "supermarket", walkMins: 7 },
        { name: "Otley Road shops", type: "retail", walkMins: 8 }
      ],
      cafes: [{ name: "North Bar", walkMins: 10 }],
      transport: [{ name: "Headingley bus corridor", walkMins: 4 }]
    },
    imageTone: "campus"
  },
  {
    id: "lee-iq",
    name: "iQ Leeds The Plaza",
    region: "leeds",
    city: "Leeds",
    area: "City centre",
    type: "private-halls",
    lat: 53.7975,
    lng: -1.5465,
    rentWeekly: 205,
    deposit: 300,
    billsIncluded: true,
    rating: 4.4,
    rooms: 520,
    description:
      "Central private halls near shops, stations, and nightlife. Popular across years; slightly longer walk to campus.",
    amenities: ["ensuite", "wifi", "gym", "cinema", "laundry"],
    universities: {
      leeds: { distanceKm: 1.5, walkMins: 20, cycleMins: 8, uniShare: 52 }
    },
    nearby: {
      stores: [
        { name: "Trinity Leeds", type: "retail", walkMins: 5 },
        { name: "Marks & Spencer", type: "supermarket", walkMins: 6 }
      ],
      cafes: [{ name: "Coffee House Company", walkMins: 4 }],
      transport: [{ name: "Leeds station", walkMins: 8 }]
    },
    imageTone: "city"
  },
  {
    id: "lee-hyde",
    name: "Hyde Park Terrace House",
    region: "leeds",
    city: "Leeds",
    area: "Hyde Park",
    type: "shared-house",
    lat: 53.811,
    lng: -1.5635,
    rentWeekly: 118,
    deposit: 380,
    billsIncluded: false,
    rating: 3.7,
    rooms: 5,
    description:
      "Budget-friendly student street near campus. Many Leeds students stay here — expect a lively neighbourhood.",
    amenities: ["wifi", "bike-storage"],
    universities: {
      leeds: { distanceKm: 0.8, walkMins: 11, cycleMins: 5, uniShare: 84 }
    },
    nearby: {
      stores: [
        { name: "Co-op Hyde Park", type: "supermarket", walkMins: 4 },
        { name: "Corner shop", type: "convenience", walkMins: 2 }
      ],
      cafes: [{ name: "Hyde Park Book Club", walkMins: 6 }],
      transport: [{ name: "Campus walk", walkMins: 11 }]
    },
    imageTone: "house"
  },
  {
    id: "lee-studio",
    name: "Woodhouse Lane Studio",
    region: "leeds",
    city: "Leeds",
    area: "Woodhouse",
    type: "studio",
    lat: 53.8085,
    lng: -1.552,
    rentWeekly: 198,
    deposit: 450,
    billsIncluded: true,
    rating: 4.0,
    rooms: 60,
    description:
      "Studio on the campus corridor. Great commute and decent shops; priced for students who want their own space.",
    amenities: ["ensuite", "wifi", "kitchenette", "laundry"],
    universities: {
      leeds: { distanceKm: 0.4, walkMins: 6, cycleMins: 3, uniShare: 65 }
    },
    nearby: {
      stores: [
        { name: "Tesco Express", type: "supermarket", walkMins: 4 },
        { name: "Campus shop", type: "convenience", walkMins: 5 }
      ],
      cafes: [{ name: "Refectory café", walkMins: 6 }],
      transport: [{ name: "University bus stops", walkMins: 2 }]
    },
    imageTone: "studio"
  },
  {
    id: "bir-vale",
    name: "The Vale Village",
    region: "birmingham",
    city: "Birmingham",
    area: "Edgbaston",
    type: "university-halls",
    lat: 52.4485,
    lng: -1.9285,
    rentWeekly: 158,
    deposit: 250,
    billsIncluded: true,
    rating: 4.2,
    rooms: 1800,
    description:
      "Large Birmingham campus village with shops on-site. Extremely popular with first-years from the university.",
    amenities: ["wifi", "laundry", "gym", "study-spaces", "common-room"],
    universities: {
      birmingham: { distanceKm: 0.5, walkMins: 8, cycleMins: 3, uniShare: 94 }
    },
    nearby: {
      stores: [
        { name: "Vale Village shop", type: "convenience", walkMins: 2 },
        { name: "Selly Oak Sainsbury's", type: "supermarket", walkMins: 14 }
      ],
      cafes: [{ name: "Vale café", walkMins: 3 }],
      transport: [{ name: "Campus shuttle", walkMins: 4 }]
    },
    imageTone: "campus"
  },
  {
    id: "bir-iq",
    name: "iQ Birmingham",
    region: "birmingham",
    city: "Birmingham",
    area: "City centre",
    type: "private-halls",
    lat: 52.4795,
    lng: -1.904,
    rentWeekly: 225,
    deposit: 350,
    billsIncluded: true,
    rating: 4.5,
    rooms: 380,
    description:
      "City-centre private halls next to retail and nightlife. Longer commute to Edgbaston campus but unmatched store access.",
    amenities: ["ensuite", "wifi", "gym", "cinema", "laundry"],
    universities: {
      birmingham: { distanceKm: 3.8, walkMins: 48, cycleMins: 18, uniShare: 48 }
    },
    nearby: {
      stores: [
        { name: "Bullring / Grand Central", type: "retail", walkMins: 5 },
        { name: "Tesco Metro", type: "supermarket", walkMins: 4 }
      ],
      cafes: [{ name: "1000 Trades", walkMins: 8 }],
      transport: [{ name: "New Street station", walkMins: 6 }]
    },
    imageTone: "city"
  },
  {
    id: "bir-selly",
    name: "Selly Oak House Share",
    region: "birmingham",
    city: "Birmingham",
    area: "Selly Oak",
    type: "shared-house",
    lat: 52.4415,
    lng: -1.9375,
    rentWeekly: 122,
    deposit: 400,
    billsIncluded: false,
    rating: 3.8,
    rooms: 6,
    description:
      "The classic Birmingham student area. Cheap, social, full of university housemates, with Bristol Road shops nearby.",
    amenities: ["wifi", "garden", "parking"],
    universities: {
      birmingham: { distanceKm: 1.3, walkMins: 17, cycleMins: 7, uniShare: 86 }
    },
    nearby: {
      stores: [
        { name: "Sainsbury's Selly Oak", type: "supermarket", walkMins: 6 },
        { name: "Bristol Road shops", type: "retail", walkMins: 5 }
      ],
      cafes: [{ name: "The Oak", walkMins: 7 }],
      transport: [{ name: "Selly Oak station", walkMins: 10 }]
    },
    imageTone: "house"
  },
  {
    id: "bir-studio",
    name: "Edgbaston Studio Suite",
    region: "birmingham",
    city: "Birmingham",
    area: "Edgbaston",
    type: "studio",
    lat: 52.452,
    lng: -1.922,
    rentWeekly: 208,
    deposit: 480,
    billsIncluded: true,
    rating: 4.1,
    rooms: 75,
    description:
      "Quiet studio near campus gates. Solid for focus and commute; fewer high-street stores than the city centre.",
    amenities: ["ensuite", "wifi", "kitchenette", "study-spaces"],
    universities: {
      birmingham: { distanceKm: 0.6, walkMins: 9, cycleMins: 4, uniShare: 67 }
    },
    nearby: {
      stores: [
        { name: "Campus convenience", type: "convenience", walkMins: 5 },
        { name: "Harborne Road Co-op", type: "supermarket", walkMins: 12 }
      ],
      cafes: [{ name: "Staff House café", walkMins: 8 }],
      transport: [{ name: "University station", walkMins: 11 }]
    },
    imageTone: "studio"
  }
];

const TYPE_LABELS = {
  "university-halls": "University halls",
  "private-halls": "Private halls",
  "shared-house": "Shared house",
  studio: "Studio"
};

module.exports = {
  UNIVERSITIES,
  REGIONS,
  ACCOMMODATIONS,
  TYPE_LABELS
};
