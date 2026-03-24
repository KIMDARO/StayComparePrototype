const LS_KEY = "staycompare_stays_startup_v1";
const LS_BUDGET_KEY = "staycompare_budget_v1";
const LS_MODE_KEY = "staycompare_student_mode_v1";

function loadStays() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveStays(stays) {
  localStorage.setItem(LS_KEY, JSON.stringify(stays));
}

function money(n) {
  return "£" + Number(n || 0).toFixed(2);
}

function escapeHtml(str) {
  return String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function totalCost(stay) {
  return Number(stay.nightlyRate) * Number(stay.nights) + Number(stay.fees || 0);
}

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function parseTags(tagsText) {
  return String(tagsText || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 8);
}

function durationToNights(value, unit) {
  const v = Number(value || 0);
  if (unit === "week") return v * 7;
  if (unit === "month") return v * 30;
  return v;
}

function formatDuration(stay) {
  const unit = stay.durationUnit || "night";
  const value = Number(stay.durationValue || 0) || Number(stay.nights || 0);
  const label = unit === "week" ? (value === 1 ? "week" : "weeks") : unit === "month" ? (value === 1 ? "month" : "months") : (value === 1 ? "night" : "nights");
  return `${value} ${label}`;
}

function valueScore(stay, mode) {
  const total = totalCost(stay);
  if (!total) return 0;

  const feePenalty = Number(stay.fees || 0) / Math.max(total, 1);
  const durationBonus = Math.min(Number(stay.nights || 0), 14) / 14;
  const commute = Number(stay.commute || 0);
  const commuteBonus = commute ? (1 - Math.min(commute, 60) / 60) : 0.5;
  const hasNotesBonus = stay.notes ? 0.08 : 0;
  const hasLinkBonus = stay.link ? 0.05 : 0;

  let totalWeight = 0.55;
  let commuteWeight = 0.20;
  let durationWeight = 0.15;

  if (mode === "tight") {
    totalWeight = 0.72;
    commuteWeight = 0.12;
    durationWeight = 0.10;
  } else if (mode === "comfort") {
    totalWeight = 0.38;
    commuteWeight = 0.38;
    durationWeight = 0.16;
  }

  const costFactor = 1 - Math.min(total / 1200, 1);
  const score =
    costFactor * totalWeight +
    commuteBonus * commuteWeight +
    durationBonus * durationWeight +
    hasNotesBonus +
    hasLinkBonus -
    feePenalty * 0.35;

  return Math.max(0, Math.min(100, Math.round(score * 100)));
}

let stays = loadStays();
let editingId = null;
let commuteCap = null;

const form = document.getElementById("stayForm");
const listEl = document.getElementById("list");
const emptyEl = document.getElementById("empty");
const sortByEl = document.getElementById("sortBy");
const printBtn = document.getElementById("printBtn");
const clearAllBtn = document.getElementById("clearAll");
const onlyFavEl = document.getElementById("onlyFav");
const searchEl = document.getElementById("search");
const statsEl = document.getElementById("stats");
const budgetEl = document.getElementById("budget");
const budgetStatusEl = document.getElementById("budgetStatus");
const studentModeEl = document.getElementById("studentMode");
const toastEl = document.getElementById("toast");
const formTitleEl = document.getElementById("formTitle");
const saveBtnEl = document.getElementById("saveBtn");
const cancelEditBtnEl = document.getElementById("cancelEdit");
const quizPriorityEl = document.getElementById("quizPriority");
const quizCommuteEl = document.getElementById("quizCommute");
const applyQuizBtnEl = document.getElementById("applyQuiz");
const webQueryEl = document.getElementById("webQuery");
const webLinksEl = document.getElementById("webLinks");
const webResultsEl = document.getElementById("webResults");
const estimateModalEl = document.getElementById("estimateModal");
const estNightlyEl = document.getElementById("estNightly");
const estNightsEl = document.getElementById("estNights");
const durationUnitEl = document.getElementById("durationUnit");
const estDurationUnitEl = document.getElementById("estDurationUnit");
const durationHintEl = document.getElementById("durationHint");
const estDurationHintEl = document.getElementById("estDurationHint");
const totalHintEl = document.getElementById("totalHint");
const estTotalHintEl = document.getElementById("estTotalHint");
const estFeesEl = document.getElementById("estFees");
const estCommuteEl = document.getElementById("estCommute");
const saveEstimateEl = document.getElementById("saveEstimate");
const closeEstimateEl = document.getElementById("closeEstimate");

let pendingImport = null;

budgetEl.value = localStorage.getItem(LS_BUDGET_KEY) || "";
studentModeEl.value = localStorage.getItem(LS_MODE_KEY) || "balanced";

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("show");
  clearTimeout(showToast.tid);
  showToast.tid = setTimeout(() => toastEl.classList.remove("show"), 1400);
}

function getTopRecommendations(items, mode) {
  return items
    .map((stay) => ({ id: stay.id, score: valueScore(stay, mode) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.id);
}

function renderStats(items, mode) {
  if (!items.length) {
    statsEl.innerHTML = "";
    budgetStatusEl.textContent = "";
    return;
  }

  const totals = items.map(totalCost);
  const min = Math.min(...totals);
  const max = Math.max(...totals);
  const avg = totals.reduce((a, b) => a + b, 0) / totals.length;

  const avgScore = Math.round(items.reduce((sum, s) => sum + valueScore(s, mode), 0) / items.length);

  statsEl.innerHTML = `
    <div class="stat"><p class="label">Options</p><p class="value">${items.length}</p></div>
    <div class="stat"><p class="label">Cheapest</p><p class="value">${money(min)}</p></div>
    <div class="stat"><p class="label">Average</p><p class="value">${money(avg)}</p></div>
    <div class="stat"><p class="label">Top range</p><p class="value">${money(max - min)}</p></div>
    <div class="stat"><p class="label">Avg value score</p><p class="value">${avgScore}</p></div>
    <div class="stat"><p class="label">Mode</p><p class="value">${escapeHtml(studentModeEl.options[studentModeEl.selectedIndex].text)}</p></div>
  `;

  const budget = Number(budgetEl.value);
  if (!budget) {
    budgetStatusEl.textContent = "Tip: set a budget to instantly check if your best options fit.";
    return;
  }
  if (min <= budget) {
    budgetStatusEl.textContent = `Good news: your cheapest stay is ${money(budget - min)} under budget.`;
  } else {
    budgetStatusEl.textContent = `Heads up: your cheapest stay is ${money(min - budget)} over budget.`;
  }
}

function resetFormMode() {
  editingId = null;
  formTitleEl.textContent = "Add a stay";
  saveBtnEl.textContent = "Add stay";
  cancelEditBtnEl.style.display = "none";
}

function startEdit(stay) {
  editingId = stay.id;
  formTitleEl.textContent = "Edit stay";
  saveBtnEl.textContent = "Save changes";
  cancelEditBtnEl.style.display = "inline-block";

  document.getElementById("name").value = stay.name || "";
  document.getElementById("location").value = stay.location || "";
  document.getElementById("nightlyRate").value = stay.nightlyRate || "";
  document.getElementById("nights").value = stay.durationValue || stay.nights || "";
  durationUnitEl.value = stay.durationUnit || "night";
  renderDurationHint(document.getElementById("nights").value, durationUnitEl.value, durationHintEl);
  document.getElementById("fees").value = stay.fees || 0;
  renderTotalHint(
    document.getElementById("nightlyRate").value,
    document.getElementById("nights").value,
    durationUnitEl.value,
    document.getElementById("fees").value,
    totalHintEl
  );
  document.getElementById("commute").value = stay.commute || "";
  document.getElementById("tags").value = (stay.tags || []).join(", ");
  document.getElementById("link").value = stay.link || "";
  document.getElementById("notes").value = stay.notes || "";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function render() {
  listEl.innerHTML = "";

  const sortBy = sortByEl.value;
  const mode = studentModeEl.value;
  let items = stays.slice();

  if (onlyFavEl.checked) items = items.filter((s) => s.favourite);

  const q = searchEl.value.trim().toLowerCase();
  if (q) {
    items = items.filter((s) =>
      `${s.name || ""} ${s.location || ""} ${(s.tags || []).join(" ")} ${s.notes || ""}`
        .toLowerCase()
        .includes(q)
    );
  }
  if (Number.isFinite(commuteCap)) {
    items = items.filter((s) => !s.commute || Number(s.commute) <= commuteCap);
  }

  if (sortBy === "cheap") items.sort((a, b) => totalCost(a) - totalCost(b));
  if (sortBy === "expensive") items.sort((a, b) => totalCost(b) - totalCost(a));
  if (sortBy === "name") items.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  if (sortBy === "score") items.sort((a, b) => valueScore(b, mode) - valueScore(a, mode));

  emptyEl.style.display = items.length === 0 ? "block" : "none";
  renderStats(items, mode);

  const recommended = new Set(getTopRecommendations(items, mode));

  items.forEach((stay) => {
    const div = document.createElement("div");
    const score = valueScore(stay, mode);
    const isRecommended = recommended.has(stay.id);
    div.className = `stay ${isRecommended ? "recommended" : ""}`;

    const imageQuery = encodeURIComponent(`${stay.name} ${stay.location}`);
    const tagsHtml = (stay.tags || []).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("");

    div.innerHTML = `
      <div>
        <h3>
          ${escapeHtml(stay.name)}
          ${stay.favourite ? '<span class="pill">Shortlisted</span>' : ""}
          ${isRecommended ? '<span class="pill reco">Top pick</span>' : ""}
        </h3>

        <div class="muted">
          ${stay.location ? `${escapeHtml(stay.location)} • ` : ""}
          ${money(stay.nightlyRate)} / night • ${formatDuration(stay)} (${stay.nights} nights) • Fees ${money(stay.fees || 0)}
          ${stay.commute ? ` • ${stay.commute} mins to campus` : ""}
        </div>

        <div class="price">
          ${money(totalCost(stay))}
          <span class="muted" style="font-weight:normal;"> total</span>
        </div>

        ${tagsHtml ? `<div class="tags">${tagsHtml}</div>` : ""}

        <div class="links">
          ${stay.link ? `<a href="${stay.link}" target="_blank" rel="noopener">Open link</a>` : ""}
          <a href="https://www.google.com/search?tbm=isch&q=${imageQuery}" target="_blank" rel="noopener">Search images</a>
        </div>

        <div class="score">
          Value score
          <div class="score-meter"><span style="width:${score}%;"></span></div>
          <strong>${score}</strong>
        </div>

        ${stay.notes ? `<div class="muted">${escapeHtml(stay.notes)}</div>` : ""}
      </div>

      <div class="right no-print">
        <button class="secondary" data-action="fav" data-id="${stay.id}">${stay.favourite ? "Unshortlist" : "Shortlist"}</button>
        <button class="secondary" data-action="edit" data-id="${stay.id}">Edit</button>
        <button class="danger" data-action="del" data-id="${stay.id}">Delete</button>
      </div>
    `;
    listEl.appendChild(div);
  });
}

function buildWebLinks(query) {
  if (!query) {
    webLinksEl.innerHTML = "";
    webResultsEl.innerHTML = "";
    return;
  }
  const q = encodeURIComponent(query);
  const links = [
    { label: "Google Maps", url: `https://www.google.com/maps/search/${q}` },
    { label: "Booking.com", url: `https://www.booking.com/searchresults.html?ss=${q}` },
    { label: "Airbnb", url: `https://www.airbnb.com/s/${q}/homes` },
    { label: "SpareRoom", url: `https://www.spareroom.co.uk/flatshare/?search=${q}` },
    { label: "Rightmove", url: `https://www.rightmove.co.uk/property-to-rent/find.html?searchLocation=${q}` }
  ];
  webLinksEl.innerHTML = links
    .map((item) => `<a href="${item.url}" target="_blank" rel="noopener">${item.label}</a>`)
    .join("");
}

function inferLocationFromSnippet(snippet) {
  return String(snippet || "").split(",").slice(-3).join(",").trim().slice(0, 90);
}

function renderDurationHint(value, unit, targetEl) {
  const raw = Number(value || 0);
  const safe = raw > 0 ? raw : 0;
  const nights = durationToNights(safe, unit);
  const unitLabel =
    unit === "week"
      ? safe === 1 ? "week" : "weeks"
      : unit === "month"
        ? safe === 1 ? "month" : "months"
        : safe === 1 ? "night" : "nights";
  targetEl.textContent = `${safe || 0} ${unitLabel} = ${nights} nights`;
}

function renderTotalHint(rateValue, durationValue, unit, feesValue, targetEl) {
  const rate = Number(rateValue || 0);
  const duration = Number(durationValue || 0);
  const fees = Number(feesValue || 0);
  const nights = durationToNights(duration, unit);
  const total = rate * nights + fees;
  const budget = Number(budgetEl.value || 0);
  targetEl.classList.remove("hint-good", "hint-bad");

  if (budget > 0) {
    if (total <= budget) targetEl.classList.add("hint-good");
    else targetEl.classList.add("hint-bad");
  }

  const budgetText =
    budget > 0
      ? total <= budget
        ? ` (${money(budget - total)} under budget)`
        : ` (${money(total - budget)} over budget)`
      : "";
  targetEl.textContent = `Estimated total: ${money(total)}${budgetText}`;
}

function fillFormFromImport(data) {
  const nameEl = document.getElementById("name");
  const locationEl = document.getElementById("location");
  const notesEl = document.getElementById("notes");
  const linkEl = document.getElementById("link");
  const tagsEl = document.getElementById("tags");

  nameEl.value = data.title || "";
  if (!locationEl.value && data.snippet) locationEl.value = inferLocationFromSnippet(data.snippet);
  if (!notesEl.value && data.snippet) notesEl.value = `Imported from live search:\n${data.snippet}`;
  if (!linkEl.value) linkEl.value = data.link || "";
  if (!tagsEl.value) tagsEl.value = "imported, web result";
}

function saveImportedStayWithEstimate(data, estimate) {
  stays.push({
    id: uid(),
    name: data.title || "Imported stay",
    location: inferLocationFromSnippet(data.snippet),
    nightlyRate: Number(estimate.nightlyRate),
    durationValue: Number(estimate.durationValue || estimate.nights || 1),
    durationUnit: estimate.durationUnit || "night",
    nights: Number(estimate.nights),
    fees: Number(estimate.fees || 0),
    commute: Number(estimate.commute || 0),
    tags: parseTags("imported, web result"),
    link: data.link || "",
    notes: data.snippet ? `Imported from live search:\n${data.snippet}` : "",
    favourite: false
  });
  saveStays(stays);
}

function renderWebResults(results) {
  if (!results.length) {
    webResultsEl.innerHTML = '<div class="web-muted">No live results found for this query yet.</div>';
    return;
  }
  webResultsEl.innerHTML = results
    .map(
      (item) => `
      <div class="web-result">
        <a href="${item.link}" target="_blank" rel="noopener">${escapeHtml(item.title)}</a>
        ${item.snippet ? `<p>${escapeHtml(item.snippet)}</p>` : ""}
        <div class="result-actions">
          <button
            type="button"
            class="secondary"
            data-action="import-web"
            data-title="${escapeHtml(item.title)}"
            data-snippet="${escapeHtml(item.snippet || "")}"
            data-link="${escapeHtml(item.link)}"
          >
            Import to form
          </button>
          <button
            type="button"
            data-action="import-web-estimate"
            data-title="${escapeHtml(item.title)}"
            data-snippet="${escapeHtml(item.snippet || "")}"
            data-link="${escapeHtml(item.link)}"
          >
            Import + estimate price
          </button>
        </div>
      </div>
    `
    )
    .join("");
}

async function fetchWebResults(query) {
  if (!query) return;
  webResultsEl.innerHTML = '<div class="web-muted">Fetching live results...</div>';
  try {
    const res = await fetch(`/api/search-stays?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error("Search request failed");
    const data = await res.json();
    renderWebResults(Array.isArray(data.results) ? data.results : []);
  } catch {
    webResultsEl.innerHTML =
      '<div class="web-muted">Live fetch unavailable right now. You can still use the quick links above.</div>';
  }
}

listEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const action = btn.getAttribute("data-action");
  const id = btn.getAttribute("data-id");
  const idx = stays.findIndex((s) => s.id === id);
  if (idx === -1) return;

  if (action === "del") {
    stays.splice(idx, 1);
    showToast("Stay removed");
  } else if (action === "fav") {
    stays[idx].favourite = !stays[idx].favourite;
    showToast(stays[idx].favourite ? "Added to shortlist" : "Removed from shortlist");
  } else if (action === "edit") {
    startEdit(stays[idx]);
    return;
  }
  saveStays(stays);
  render();
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const location = document.getElementById("location").value.trim();
  const nightlyRate = Number(document.getElementById("nightlyRate").value);
  const durationValue = Number(document.getElementById("nights").value);
  const durationUnit = durationUnitEl.value || "night";
  const nights = durationToNights(durationValue, durationUnit);
  const fees = Number(document.getElementById("fees").value || 0);
  const commute = Number(document.getElementById("commute").value || 0);
  const tags = parseTags(document.getElementById("tags").value);
  const link = document.getElementById("link").value.trim();
  const notes = document.getElementById("notes").value.trim();

  if (!name) return alert("Please enter a stay name.");
  if (!nightlyRate || !durationValue) return alert("Please enter nightly rate and a duration.");

  const payload = { name, location, nightlyRate, durationValue, durationUnit, nights, fees, commute, tags, link, notes, favourite: false };

  if (editingId) {
    const idx = stays.findIndex((s) => s.id === editingId);
    if (idx !== -1) {
      payload.id = stays[idx].id;
      payload.favourite = stays[idx].favourite;
      stays[idx] = payload;
      showToast("Stay updated");
    }
  } else {
    stays.push({ id: uid(), ...payload });
    showToast("Stay added");
  }

  saveStays(stays);
  form.reset();
  document.getElementById("fees").value = 0;
  durationUnitEl.value = "night";
  renderDurationHint(document.getElementById("nights").value || 3, durationUnitEl.value, durationHintEl);
  renderTotalHint(
    document.getElementById("nightlyRate").value,
    document.getElementById("nights").value || 3,
    durationUnitEl.value,
    document.getElementById("fees").value,
    totalHintEl
  );
  resetFormMode();
  render();
});

cancelEditBtnEl.addEventListener("click", () => {
  form.reset();
  document.getElementById("fees").value = 0;
  durationUnitEl.value = "night";
  renderDurationHint(document.getElementById("nights").value || 3, durationUnitEl.value, durationHintEl);
  renderTotalHint(
    document.getElementById("nightlyRate").value,
    document.getElementById("nights").value || 3,
    durationUnitEl.value,
    document.getElementById("fees").value,
    totalHintEl
  );
  resetFormMode();
  showToast("Edit canceled");
});

clearAllBtn.addEventListener("click", () => {
  if (!confirm("Clear all saved stays?")) return;
  stays = [];
  saveStays(stays);
  resetFormMode();
  showToast("All stays cleared");
  render();
});

sortByEl.addEventListener("change", render);
onlyFavEl.addEventListener("change", render);
searchEl.addEventListener("input", render);
printBtn.addEventListener("click", () => window.print());
budgetEl.addEventListener("input", () => {
  localStorage.setItem(LS_BUDGET_KEY, budgetEl.value.trim());
  renderTotalHint(
    document.getElementById("nightlyRate").value,
    document.getElementById("nights").value,
    durationUnitEl.value,
    document.getElementById("fees").value,
    totalHintEl
  );
  renderTotalHint(estNightlyEl.value, estNightsEl.value, estDurationUnitEl.value, estFeesEl.value, estTotalHintEl);
  render();
});
studentModeEl.addEventListener("change", () => {
  localStorage.setItem(LS_MODE_KEY, studentModeEl.value);
  render();
});
applyQuizBtnEl.addEventListener("click", () => {
  const pr = quizPriorityEl.value;
  studentModeEl.value = pr === "cheap" ? "tight" : pr === "comfort" ? "comfort" : "balanced";
  localStorage.setItem(LS_MODE_KEY, studentModeEl.value);

  const maxCommute = Number(quizCommuteEl.value || 0);
  if (maxCommute) {
    commuteCap = maxCommute;
    showToast(`Mode applied with max commute ${maxCommute} mins`);
  } else {
    commuteCap = null;
    showToast("Preferences applied");
  }
  render();
});
const debouncedFetchWebResults = (() => {
  let tid;
  return (query) => {
    clearTimeout(tid);
    tid = setTimeout(() => fetchWebResults(query), 350);
  };
})();
webQueryEl.addEventListener("input", () => {
  const q = webQueryEl.value.trim();
  buildWebLinks(q);
  debouncedFetchWebResults(q);
});
document.getElementById("nights").addEventListener("input", (e) => {
  renderDurationHint(e.target.value, durationUnitEl.value, durationHintEl);
  renderTotalHint(
    document.getElementById("nightlyRate").value,
    e.target.value,
    durationUnitEl.value,
    document.getElementById("fees").value,
    totalHintEl
  );
});
durationUnitEl.addEventListener("change", () => {
  renderDurationHint(document.getElementById("nights").value, durationUnitEl.value, durationHintEl);
  renderTotalHint(
    document.getElementById("nightlyRate").value,
    document.getElementById("nights").value,
    durationUnitEl.value,
    document.getElementById("fees").value,
    totalHintEl
  );
});
estNightsEl.addEventListener("input", (e) => {
  renderDurationHint(e.target.value, estDurationUnitEl.value, estDurationHintEl);
  renderTotalHint(estNightlyEl.value, e.target.value, estDurationUnitEl.value, estFeesEl.value, estTotalHintEl);
});
estDurationUnitEl.addEventListener("change", () => {
  renderDurationHint(estNightsEl.value, estDurationUnitEl.value, estDurationHintEl);
  renderTotalHint(estNightlyEl.value, estNightsEl.value, estDurationUnitEl.value, estFeesEl.value, estTotalHintEl);
});
document.getElementById("nightlyRate").addEventListener("input", (e) => {
  renderTotalHint(
    e.target.value,
    document.getElementById("nights").value,
    durationUnitEl.value,
    document.getElementById("fees").value,
    totalHintEl
  );
});
document.getElementById("fees").addEventListener("input", (e) => {
  renderTotalHint(
    document.getElementById("nightlyRate").value,
    document.getElementById("nights").value,
    durationUnitEl.value,
    e.target.value,
    totalHintEl
  );
});
estNightlyEl.addEventListener("input", (e) => {
  renderTotalHint(e.target.value, estNightsEl.value, estDurationUnitEl.value, estFeesEl.value, estTotalHintEl);
});
estFeesEl.addEventListener("input", (e) => {
  renderTotalHint(estNightlyEl.value, estNightsEl.value, estDurationUnitEl.value, e.target.value, estTotalHintEl);
});
webResultsEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const action = btn.getAttribute("data-action");

  const title = btn.getAttribute("data-title") || "";
  const snippet = btn.getAttribute("data-snippet") || "";
  const link = btn.getAttribute("data-link") || "";
  const data = { title, snippet, link };

  if (action === "import-web") {
    fillFormFromImport(data);
    window.scrollTo({ top: 0, behavior: "smooth" });
    showToast("Imported into form. Add pricing and save.");
    return;
  }
  if (action === "import-web-estimate") {
    pendingImport = data;
    estNightlyEl.value = "";
    estNightsEl.value = 3;
    estDurationUnitEl.value = "night";
    renderDurationHint(estNightsEl.value, estDurationUnitEl.value, estDurationHintEl);
    estFeesEl.value = 0;
    renderTotalHint(estNightlyEl.value, estNightsEl.value, estDurationUnitEl.value, estFeesEl.value, estTotalHintEl);
    estCommuteEl.value = "";
    estimateModalEl.style.display = "flex";
  }
});
closeEstimateEl.addEventListener("click", () => {
  estimateModalEl.style.display = "none";
  pendingImport = null;
});
estimateModalEl.addEventListener("click", (e) => {
  if (e.target === estimateModalEl) {
    estimateModalEl.style.display = "none";
    pendingImport = null;
  }
});
saveEstimateEl.addEventListener("click", () => {
  if (!pendingImport) return;
  const nightlyRate = Number(estNightlyEl.value);
  const durationValue = Number(estNightsEl.value);
  const durationUnit = estDurationUnitEl.value || "night";
  const nights = durationToNights(durationValue, durationUnit);
  const fees = Number(estFeesEl.value || 0);
  const commute = Number(estCommuteEl.value || 0);

  if (!nightlyRate || !durationValue) {
    alert("Please enter nightly rate and duration to save.");
    return;
  }

  saveImportedStayWithEstimate(pendingImport, { nightlyRate, nights, durationValue, durationUnit, fees, commute });
  estimateModalEl.style.display = "none";
  pendingImport = null;
  render();
  showToast("Imported and saved to your list.");
});

resetFormMode();
render();
buildWebLinks("");
renderDurationHint(document.getElementById("nights").value || 3, durationUnitEl.value, durationHintEl);
renderDurationHint(estNightsEl.value || 3, estDurationUnitEl.value, estDurationHintEl);
renderTotalHint(
  document.getElementById("nightlyRate").value,
  document.getElementById("nights").value || 3,
  durationUnitEl.value,
  document.getElementById("fees").value,
  totalHintEl
);
renderTotalHint(estNightlyEl.value, estNightsEl.value || 3, estDurationUnitEl.value, estFeesEl.value, estTotalHintEl);
