const LS_SAVED = "staycompare_saved_v2";
const LS_COMPARE = "staycompare_compare_v2";
const LS_PREFS = "staycompare_prefs_v2";

const state = {
  meta: { regions: [], universities: [], types: {} },
  results: [],
  region: null,
  university: null,
  savedIds: loadJson(LS_SAVED, []),
  compareIds: loadJson(LS_COMPARE, []),
  prefs: loadJson(LS_PREFS, {}),
  activeId: null,
  map: null,
  savedMap: null,
  markers: [],
  savedMarkers: []
};

const els = {
  region: document.getElementById("region"),
  university: document.getElementById("university"),
  budget: document.getElementById("budget"),
  maxWalk: document.getElementById("maxWalk"),
  needStores: document.getElementById("needStores"),
  typeFilter: document.getElementById("typeFilter"),
  keyword: document.getElementById("keyword"),
  sortBy: document.getElementById("sortBy"),
  searchForm: document.getElementById("searchForm"),
  resultsList: document.getElementById("resultsList"),
  resultsEmpty: document.getElementById("resultsEmpty"),
  resultsTitle: document.getElementById("resultsTitle"),
  resultsSub: document.getElementById("resultsSub"),
  savedList: document.getElementById("savedList"),
  savedEmpty: document.getElementById("savedEmpty"),
  savedCount: document.getElementById("savedCount"),
  compareCount: document.getElementById("compareCount"),
  compareGrid: document.getElementById("compareGrid"),
  compareEmpty: document.getElementById("compareEmpty"),
  profileDrawer: document.getElementById("profileDrawer"),
  profileContent: document.getElementById("profileContent"),
  toast: document.getElementById("toast"),
  map: document.getElementById("map"),
  savedMap: document.getElementById("savedMap")
};

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

function money(n) {
  return "£" + Number(n || 0).toFixed(0);
}

function escapeHtml(str) {
  return String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  clearTimeout(showToast.tid);
  showToast.tid = setTimeout(() => els.toast.classList.remove("show"), 1600);
}

function isSaved(id) {
  return state.savedIds.includes(id);
}

function inCompare(id) {
  return state.compareIds.includes(id);
}

function toggleSaved(id) {
  if (isSaved(id)) {
    state.savedIds = state.savedIds.filter((x) => x !== id);
    showToast("Removed from saved");
  } else {
    state.savedIds = [id, ...state.savedIds];
    showToast("Saved — view it on the map");
  }
  saveJson(LS_SAVED, state.savedIds);
  updateCounts();
  renderResults();
  renderSaved();
  updateMaps();
}

function toggleCompare(id) {
  if (inCompare(id)) {
    state.compareIds = state.compareIds.filter((x) => x !== id);
    showToast("Removed from compare");
  } else if (state.compareIds.length >= 4) {
    showToast("Compare is limited to 4 places");
    return;
  } else {
    state.compareIds = [...state.compareIds, id];
    showToast("Added to compare");
  }
  saveJson(LS_COMPARE, state.compareIds);
  updateCounts();
  renderResults();
  renderSaved();
  renderCompare();
}

function updateCounts() {
  els.savedCount.textContent = String(state.savedIds.length);
  els.compareCount.textContent = String(state.compareIds.length);
}

function budgetChip(budget) {
  if (!budget || budget.status === "unknown") return "";
  if (budget.status === "under") {
    return `<span class="chip good">${money(budget.delta)}/wk under budget</span>`;
  }
  if (budget.status === "tight") {
    return `<span class="chip warn">Fits budget tightly</span>`;
  }
  return `<span class="chip bad">${money(Math.abs(budget.delta))}/wk over budget</span>`;
}

function uniShareLabel(share) {
  if (share >= 75) return `${share}% from your uni — common stay area`;
  if (share >= 50) return `${share}% from your uni — fairly common`;
  return `${share}% from your uni — less common`;
}

function placeCardHtml(place, { index = 0 } = {}) {
  const saved = isSaved(place.id);
  const comparing = inCompare(place.id);
  const walk = place.commute?.walkMins;
  const uniShare = place.commute?.uniShare;
  const store = place.nearestStore;

  return `
    <article class="place-card ${saved ? "is-saved" : ""} ${state.activeId === place.id ? "is-active" : ""}"
      data-id="${place.id}" style="animation-delay:${Math.min(index * 0.04, 0.28)}s">
      <div class="thumb ${escapeHtml(place.imageTone || "campus")}" aria-hidden="true"></div>
      <div class="place-body">
        <h3>${escapeHtml(place.name)}</h3>
        <div class="muted">${escapeHtml(place.typeLabel)} · ${escapeHtml(place.area)}, ${escapeHtml(place.city)}</div>
        <div class="meta-row">
          <span class="chip">Match ${place.matchScore ?? "—"}</span>
          ${budgetChip(place.budget)}
          ${saved ? '<span class="chip accent">Saved</span>' : ""}
          ${uniShare >= 75 ? '<span class="chip good">Popular with your uni</span>' : ""}
        </div>
        <div class="place-stats">
          <div class="stat">
            <span class="label">Rent</span>
            <span class="value">${money(place.rentWeekly)}/wk</span>
          </div>
          <div class="stat">
            <span class="label">To campus</span>
            <span class="value">${walk != null ? walk + " min walk" : "—"}</span>
          </div>
          <div class="stat">
            <span class="label">Stores</span>
            <span class="value">${store ? store.walkMins + " min" : "—"}</span>
          </div>
        </div>
        <div class="card-actions">
          <button type="button" class="btn secondary" data-action="profile" data-id="${place.id}">Open profile</button>
          <button type="button" class="btn ${saved ? "accent" : "ghost"}" data-action="save" data-id="${place.id}">
            ${saved ? "Saved" : "Save"}
          </button>
          <button type="button" class="btn ${comparing ? "secondary" : "ghost"}" data-action="compare" data-id="${place.id}">
            ${comparing ? "In compare" : "Compare"}
          </button>
        </div>
      </div>
    </article>
  `;
}

function renderResults() {
  const items = state.results;
  els.resultsEmpty.style.display = items.length ? "none" : "block";
  els.resultsList.innerHTML = items.map((p, i) => placeCardHtml(p, { index: i })).join("");

  if (state.region && state.university) {
    els.resultsTitle.textContent = `${items.length} place${items.length === 1 ? "" : "s"} in ${state.region.name}`;
    els.resultsSub.textContent = `Compared for ${state.university.name} · budget, campus distance, nearby stores, and uni popularity.`;
  }
}

async function fetchSavedPlaces() {
  if (!state.savedIds.length) return [];
  const university = els.university.value || state.prefs.university || "";
  const budget = els.budget.value || state.prefs.budget || "";
  const places = await Promise.all(
    state.savedIds.map(async (id) => {
      const params = new URLSearchParams();
      if (university) params.set("university", university);
      if (budget) params.set("budget", budget);
      const res = await fetch(`/api/accommodation/${id}?${params}`);
      if (!res.ok) return null;
      return res.json();
    })
  );
  return places.filter(Boolean);
}

async function renderSaved() {
  const places = await fetchSavedPlaces();
  els.savedEmpty.style.display = places.length ? "none" : "block";
  els.savedList.innerHTML = places.map((p, i) => placeCardHtml(p, { index: i })).join("");
  return places;
}

async function renderCompare() {
  if (!state.compareIds.length) {
    els.compareEmpty.style.display = "block";
    els.compareGrid.innerHTML = "";
    return;
  }

  const university = els.university.value || state.prefs.university || "";
  const budget = els.budget.value || state.prefs.budget || "";
  const params = new URLSearchParams({
    ids: state.compareIds.join(","),
    university,
    budget
  });
  const res = await fetch(`/api/compare?${params}`);
  const data = await res.json();
  const items = data.items || [];

  els.compareEmpty.style.display = items.length ? "none" : "block";
  if (!items.length) {
    els.compareGrid.innerHTML = "";
    return;
  }

  const bestRent = Math.min(...items.map((i) => i.rentWeekly));
  const bestWalk = Math.min(...items.map((i) => i.commute?.walkMins ?? 999));
  const bestStore = Math.min(...items.map((i) => i.storeWalkMins ?? 999));
  const bestUni = Math.max(...items.map((i) => i.commute?.uniShare ?? 0));
  const bestScore = Math.max(...items.map((i) => i.matchScore ?? 0));

  els.compareGrid.innerHTML = items
    .map((place) => {
      const walk = place.commute?.walkMins;
      const uniShare = place.commute?.uniShare;
      return `
        <article class="compare-card">
          <h3>${escapeHtml(place.name)}</h3>
          <div class="muted">${escapeHtml(place.typeLabel)} · ${escapeHtml(place.area)}</div>
          <div class="meta-row" style="margin-top:10px;">
            ${budgetChip(place.budget)}
            ${place.billsIncluded ? '<span class="chip good">Bills included</span>' : '<span class="chip">Bills extra</span>'}
          </div>
          <div class="compare-metric"><span class="k">Match score</span><span class="v ${place.matchScore === bestScore ? "win" : ""}">${place.matchScore}</span></div>
          <div class="compare-metric"><span class="k">Weekly rent</span><span class="v ${place.rentWeekly === bestRent ? "win" : ""}">${money(place.rentWeekly)}</span></div>
          <div class="compare-metric"><span class="k">Walk to campus</span><span class="v ${walk === bestWalk ? "win" : ""}">${walk != null ? walk + " min" : "—"}</span></div>
          <div class="compare-metric"><span class="k">Cycle to campus</span><span class="v">${place.commute?.cycleMins != null ? place.commute.cycleMins + " min" : "—"}</span></div>
          <div class="compare-metric"><span class="k">Distance</span><span class="v">${place.commute?.distanceKm != null ? place.commute.distanceKm + " km" : "—"}</span></div>
          <div class="compare-metric"><span class="k">Nearest store</span><span class="v ${place.storeWalkMins === bestStore ? "win" : ""}">${place.nearestStore ? place.nearestStore.walkMins + " min · " + escapeHtml(place.nearestStore.name) : "—"}</span></div>
          <div class="compare-metric"><span class="k">Students from your uni</span><span class="v ${uniShare === bestUni ? "win" : ""}">${uniShare != null ? uniShare + "%" : "—"}</span></div>
          <div class="card-actions">
            <button type="button" class="btn secondary" data-action="profile" data-id="${place.id}">Profile</button>
            <button type="button" class="btn danger-soft" data-action="compare" data-id="${place.id}">Remove</button>
          </div>
        </article>
      `;
    })
    .join("");
}

function makeIcon(label, className = "") {
  return L.divIcon({
    className: "",
    html: `<div class="marker-pin ${className}">${label}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
}

function ensureMaps() {
  if (!state.map) {
    state.map = L.map(els.map, { zoomControl: true, scrollWheelZoom: false });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap"
    }).addTo(state.map);
    state.map.setView([54.0, -2.5], 6);
  }
  if (!state.savedMap) {
    state.savedMap = L.map(els.savedMap, { zoomControl: true, scrollWheelZoom: false });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap"
    }).addTo(state.savedMap);
    state.savedMap.setView([54.0, -2.5], 6);
  }
}

function clearMarkers(mapKey) {
  const list = mapKey === "saved" ? state.savedMarkers : state.markers;
  const map = mapKey === "saved" ? state.savedMap : state.map;
  list.forEach((m) => map.removeLayer(m));
  if (mapKey === "saved") state.savedMarkers = [];
  else state.markers = [];
}

function plotPlaces(map, places, markerStore, { includeUni = true, includeSavedExtra = true } = {}) {
  const bounds = [];

  if (includeUni && state.university) {
    const uniMarker = L.marker([state.university.lat, state.university.lng], {
      icon: makeIcon("UNI", "uni")
    })
      .addTo(map)
      .bindPopup(`<strong>${escapeHtml(state.university.name)}</strong><br>Campus`);
    markerStore.push(uniMarker);
    bounds.push([state.university.lat, state.university.lng]);
  }

  places.forEach((place, index) => {
    const saved = isSaved(place.id);
    const marker = L.marker([place.lat, place.lng], {
      icon: makeIcon(String(index + 1), saved ? "saved" : "")
    })
      .addTo(map)
      .bindPopup(
        `<strong>${escapeHtml(place.name)}</strong><br>${money(place.rentWeekly)}/wk` +
          (place.commute ? `<br>${place.commute.walkMins} min walk to campus` : "") +
          `<br><button type="button" data-action="profile" data-id="${place.id}">Open profile</button>`
      );
    marker.on("click", () => {
      state.activeId = place.id;
      renderResults();
    });
    markerStore.push(marker);
    bounds.push([place.lat, place.lng]);
  });

  if (includeSavedExtra) {
    // saved places not in current results still show on search map
  }

  if (bounds.length) {
    map.fitBounds(bounds, { padding: [36, 36], maxZoom: 14 });
  }
}

async function updateMaps() {
  ensureMaps();
  clearMarkers("search");
  clearMarkers("saved");

  const savedPlaces = await fetchSavedPlaces();

  // Search map: results + highlight saved
  const searchPlaces = state.results.length ? state.results : savedPlaces;
  plotPlaces(state.map, searchPlaces, state.markers, { includeUni: true });

  // Also pin saved that aren't in results
  if (state.results.length) {
    const resultIds = new Set(state.results.map((r) => r.id));
    savedPlaces
      .filter((p) => !resultIds.has(p.id) && (!state.region || p.region === state.region.id))
      .forEach((place) => {
        const marker = L.marker([place.lat, place.lng], { icon: makeIcon("♥", "saved") })
          .addTo(state.map)
          .bindPopup(`<strong>${escapeHtml(place.name)}</strong><br>Saved place`);
        state.markers.push(marker);
      });
  }

  plotPlaces(state.savedMap, savedPlaces, state.savedMarkers, { includeUni: true });

  setTimeout(() => {
    state.map.invalidateSize();
    state.savedMap.invalidateSize();
  }, 80);
}

function openProfile(place) {
  state.activeId = place.id;
  const walk = place.commute?.walkMins;
  const uniShare = place.commute?.uniShare;
  const storeGroups = [
    { title: "Stores & shops", items: place.nearby?.stores || [] },
    { title: "Cafés", items: place.nearby?.cafes || [] },
    { title: "Transport", items: place.nearby?.transport || [] }
  ];

  els.profileContent.innerHTML = `
    <div class="profile-hero thumb ${escapeHtml(place.imageTone || "campus")}">
      <div>
        <h2 id="profileName">${escapeHtml(place.name)}</h2>
        <p>${escapeHtml(place.typeLabel)} · ${escapeHtml(place.area)}, ${escapeHtml(place.city)}</p>
      </div>
    </div>

    <div class="meta-row">
      <span class="chip">Match ${place.matchScore ?? "—"}</span>
      ${budgetChip(place.budget)}
      ${place.billsIncluded ? '<span class="chip good">Bills included</span>' : '<span class="chip warn">Bills not included</span>'}
      ${isSaved(place.id) ? '<span class="chip accent">Saved</span>' : ""}
    </div>

    <div class="place-stats" style="margin-top:14px;">
      <div class="stat"><span class="label">Weekly</span><span class="value">${money(place.rentWeekly)}</span></div>
      <div class="stat"><span class="label">Monthly est.</span><span class="value">${money(place.rentMonthly)}</span></div>
      <div class="stat"><span class="label">Deposit</span><span class="value">${money(place.deposit)}</span></div>
    </div>

    <p style="margin-top:14px;color:var(--ink-soft);">${escapeHtml(place.description)}</p>

    <div class="profile-section">
      <h3>Vs your university</h3>
      ${
        place.commute
          ? `<p class="muted" style="margin:0 0 8px;">${escapeHtml(place.university?.name || "Campus")}</p>
             <div class="place-stats">
               <div class="stat"><span class="label">Walk</span><span class="value">${walk} min</span></div>
               <div class="stat"><span class="label">Cycle</span><span class="value">${place.commute.cycleMins} min</span></div>
               <div class="stat"><span class="label">Distance</span><span class="value">${place.commute.distanceKm} km</span></div>
             </div>
             <p style="margin-top:10px;"><strong>${uniShareLabel(uniShare)}</strong></p>`
          : '<p class="muted">Select your university in search to see commute and popularity.</p>'
      }
    </div>

    <div class="profile-section">
      <h3>Why it might suit you</h3>
      <ul class="hint-list">
        ${(place.fitHints || []).map((h) => `<li>${escapeHtml(h)}</li>`).join("") || "<li>Open search with your uni and budget for tailored hints.</li>"}
      </ul>
    </div>

    <div class="profile-section">
      <h3>Nearby benefits</h3>
      ${storeGroups
        .map(
          (group) => `
        <p style="margin:10px 0 6px;font-weight:700;">${escapeHtml(group.title)}</p>
        <div class="nearby-list">
          ${
            group.items.length
              ? group.items
                  .map(
                    (item) => `
              <div class="nearby-item">
                <span>${escapeHtml(item.name)}${item.type ? ` · ${escapeHtml(item.type)}` : ""}</span>
                <strong>${item.walkMins} min</strong>
              </div>`
                  )
                  .join("")
              : '<div class="nearby-item"><span>None listed</span></div>'
          }
        </div>`
        )
        .join("")}
    </div>

    <div class="profile-section">
      <h3>Amenities</h3>
      <div class="meta-row">
        ${(place.amenities || []).map((a) => `<span class="chip">${escapeHtml(a)}</span>`).join("")}
      </div>
    </div>

    <div class="card-actions" style="margin-top:18px;">
      <button type="button" class="btn ${isSaved(place.id) ? "accent" : "primary"}" data-action="save" data-id="${place.id}">
        ${isSaved(place.id) ? "Saved on map" : "Save place"}
      </button>
      <button type="button" class="btn secondary" data-action="compare" data-id="${place.id}">
        ${inCompare(place.id) ? "In compare" : "Add to compare"}
      </button>
    </div>
  `;

  els.profileDrawer.classList.add("is-open");
  els.profileDrawer.setAttribute("aria-hidden", "false");
  renderResults();
}

async function loadProfile(id) {
  const university = els.university.value || state.prefs.university || "";
  const budget = els.budget.value || state.prefs.budget || "";
  const params = new URLSearchParams();
  if (university) params.set("university", university);
  if (budget) params.set("budget", budget);
  const res = await fetch(`/api/accommodation/${id}?${params}`);
  if (!res.ok) {
    showToast("Could not open profile");
    return;
  }
  const place = await res.json();
  openProfile(place);
}

function closeDrawer() {
  els.profileDrawer.classList.remove("is-open");
  els.profileDrawer.setAttribute("aria-hidden", "true");
}

function setView(name) {
  document.querySelectorAll(".view").forEach((v) => v.classList.remove("is-active"));
  document.querySelectorAll(".nav-btn").forEach((b) => {
    b.classList.toggle("is-active", b.dataset.view === name);
  });
  const view = document.getElementById(`view-${name}`);
  if (view) view.classList.add("is-active");

  if (name === "saved") {
    renderSaved().then(() => updateMaps());
  }
  if (name === "compare") renderCompare();
  if (name === "search") {
    setTimeout(() => state.map && state.map.invalidateSize(), 100);
  }
}

function syncUniversityOptions() {
  const regionId = els.region.value;
  const unis = state.meta.universities.filter((u) => !regionId || u.region === regionId);
  const current = els.university.value || state.prefs.university || "";
  els.university.innerHTML = unis
    .map((u) => `<option value="${u.id}">${escapeHtml(u.name)}</option>`)
    .join("");
  if (unis.some((u) => u.id === current)) els.university.value = current;
}

function persistPrefs() {
  state.prefs = {
    region: els.region.value,
    university: els.university.value,
    budget: els.budget.value,
    maxWalk: els.maxWalk.value,
    needStores: els.needStores.checked,
    type: els.typeFilter.value,
    sort: els.sortBy.value
  };
  saveJson(LS_PREFS, state.prefs);
}

async function runSearch(event) {
  if (event) event.preventDefault();
  persistPrefs();

  const params = new URLSearchParams({
    region: els.region.value,
    university: els.university.value,
    budget: els.budget.value || "",
    maxWalk: els.maxWalk.value || "",
    stores: els.needStores.checked ? "1" : "0",
    type: els.typeFilter.value || "",
    q: els.keyword.value || "",
    sort: els.sortBy.value || "best"
  });

  els.resultsEmpty.style.display = "block";
  els.resultsEmpty.textContent = "Searching region…";
  els.resultsList.innerHTML = "";

  const res = await fetch(`/api/search?${params}`);
  const data = await res.json();
  state.results = data.results || [];
  state.region = data.region;
  state.university = data.university;

  if (!state.results.length) {
    els.resultsEmpty.textContent = "No accommodations matched those filters. Try widening budget or walk time.";
  }

  renderResults();
  await updateMaps();
  setView("search");
}

function handleActionClick(event) {
  const btn = event.target.closest("[data-action]");
  if (!btn) {
    const card = event.target.closest(".place-card");
    if (card?.dataset.id) {
      state.activeId = card.dataset.id;
      const place = state.results.find((p) => p.id === card.dataset.id);
      if (place) {
        if (state.map) state.map.panTo([place.lat, place.lng]);
        renderResults();
      }
    }
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  const id = btn.dataset.id;
  const action = btn.dataset.action;

  if (action === "save") toggleSaved(id);
  if (action === "compare") toggleCompare(id);
  if (action === "profile") loadProfile(id);

  if (els.profileDrawer.classList.contains("is-open") && (action === "save" || action === "compare")) {
    loadProfile(id);
  }
}

async function init() {
  const res = await fetch("/api/meta");
  state.meta = await res.json();

  els.region.innerHTML = state.meta.regions
    .map((r) => `<option value="${r.id}">${escapeHtml(r.label || r.name)}</option>`)
    .join("");

  if (state.prefs.region) els.region.value = state.prefs.region;
  syncUniversityOptions();
  if (state.prefs.university) els.university.value = state.prefs.university;
  if (state.prefs.budget) els.budget.value = state.prefs.budget;
  if (state.prefs.maxWalk) els.maxWalk.value = state.prefs.maxWalk;
  if (state.prefs.needStores) els.needStores.checked = true;
  if (state.prefs.type) els.typeFilter.value = state.prefs.type;
  if (state.prefs.sort) els.sortBy.value = state.prefs.sort;

  updateCounts();
  ensureMaps();
  await renderSaved();
  await renderCompare();
  await updateMaps();

  // Auto-run first search so the map isn't empty
  await runSearch();
}

els.searchForm.addEventListener("submit", runSearch);
els.sortBy.addEventListener("change", () => {
  if (state.region) runSearch();
});
els.region.addEventListener("change", () => {
  syncUniversityOptions();
  persistPrefs();
});
els.university.addEventListener("change", persistPrefs);

document.querySelectorAll(".nav-btn").forEach((btn) => {
  btn.addEventListener("click", () => setView(btn.dataset.view));
});

document.getElementById("logoHome").addEventListener("click", (e) => {
  e.preventDefault();
  setView("search");
});

document.body.addEventListener("click", handleActionClick);

document.querySelectorAll("[data-close-drawer]").forEach((el) => {
  el.addEventListener("click", closeDrawer);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeDrawer();
});

// Popup buttons inside Leaflet use DOM inside map panes
document.addEventListener("click", (e) => {
  const popupBtn = e.target.closest(".leaflet-popup-content [data-action]");
  if (popupBtn) handleActionClick(e);
});

init().catch((err) => {
  console.error(err);
  els.resultsEmpty.textContent = "Could not load StayCompare. Is the server running?";
});
