/**
 * Student-added accommodations (links + details) stored in the browser.
 */
(function (root) {
  const GUEST_KEY = "staycompare_custom_places_v1";
  const auth = () => root.StayCompareAuth;

  function loadJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function saveJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function uid() {
    return "custom-" + Math.random().toString(16).slice(2) + Date.now().toString(16);
  }

  function readGuest() {
    return loadJson(GUEST_KEY, []);
  }

  function writeGuest(places) {
    saveJson(GUEST_KEY, places);
  }

  function readUserPlaces() {
    const sessionUser = auth()?.getSessionUser?.();
    if (!sessionUser) return null;
    const users = loadJson("staycompare_users_v1", []);
    const full = users.find((u) => u.id === sessionUser.id);
    return Array.isArray(full?.customPlaces) ? full.customPlaces : [];
  }

  function writeUserPlaces(places) {
    const sessionUser = auth()?.getSessionUser?.();
    if (!sessionUser) return false;
    const users = loadJson("staycompare_users_v1", []);
    const idx = users.findIndex((u) => u.id === sessionUser.id);
    if (idx === -1) return false;
    users[idx] = { ...users[idx], customPlaces: places };
    saveJson("staycompare_users_v1", users);
    return true;
  }

  function list() {
    const userPlaces = readUserPlaces();
    if (userPlaces) return userPlaces.slice();
    return readGuest();
  }

  function saveAll(places) {
    if (auth()?.getSessionUser?.()) writeUserPlaces(places);
    else writeGuest(places);
  }

  function get(id) {
    return list().find((p) => p.id === id) || null;
  }

  function add(input) {
    const place = {
      id: uid(),
      source: "student",
      origin: "student-link",
      name: String(input.name || "Untitled stay").trim().slice(0, 120),
      link: String(input.link || "").trim(),
      region: String(input.region || "").trim(),
      city: String(input.city || "").trim(),
      area: String(input.area || "Linked listing").trim(),
      type: String(input.type || "private-rent"),
      rentWeekly: Number(input.rentWeekly || 0),
      deposit: Number(input.deposit || 0),
      billsIncluded: Boolean(input.billsIncluded),
      rating: Number(input.rating || 0),
      rooms: Number(input.rooms || 1),
      description: String(input.description || "").trim().slice(0, 600),
      image: String(input.image || "").trim(),
      imageTone: "city",
      amenities: Array.isArray(input.amenities) ? input.amenities.slice(0, 10) : ["wifi"],
      nearby: input.nearby || { stores: [], cafes: [], transport: [] },
      universities: input.universities || {},
      lat: Number(input.lat || 0) || null,
      lng: Number(input.lng || 0) || null,
      createdAt: new Date().toISOString()
    };

    if (!place.name) return { ok: false, error: "Add a name for this place." };
    if (!place.rentWeekly || place.rentWeekly < 1) {
      return { ok: false, error: "Add the weekly rent so you can compare it." };
    }

    const places = list();
    places.unshift(place);
    saveAll(places);
    return { ok: true, place };
  }

  function remove(id) {
    const next = list().filter((p) => p.id !== id);
    saveAll(next);
    return { ok: true };
  }

  function mergeGuestIntoUser() {
    const sessionUser = auth()?.getSessionUser?.();
    if (!sessionUser) return;
    const guest = readGuest();
    if (!guest.length) return;
    const existing = readUserPlaces() || [];
    const byId = new Map(existing.map((p) => [p.id, p]));
    guest.forEach((p) => {
      if (!byId.has(p.id)) byId.set(p.id, p);
    });
    writeUserPlaces([...byId.values()]);
    writeGuest([]);
  }

  root.StayCompareLibrary = {
    list,
    get,
    add,
    remove,
    mergeGuestIntoUser
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
