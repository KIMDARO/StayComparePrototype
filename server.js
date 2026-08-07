const express = require("express");
const cors = require("cors");
const path = require("path");
const {
  UNIVERSITIES,
  REGIONS,
  ACCOMMODATIONS,
  TYPE_LABELS
} = require("./data");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(__dirname));

function enrichAccommodation(place, universityId) {
  const uniMeta = universityId ? place.universities[universityId] : null;
  const primaryUniId = universityId || Object.keys(place.universities)[0];
  const primary = place.universities[primaryUniId];
  const university = UNIVERSITIES.find((u) => u.id === primaryUniId);
  const nearestStore = (place.nearby.stores || []).slice().sort((a, b) => a.walkMins - b.walkMins)[0];
  const storeWalk = nearestStore ? nearestStore.walkMins : null;

  return {
    ...place,
    typeLabel: TYPE_LABELS[place.type] || place.type,
    rentMonthly: Math.round(place.rentWeekly * 4.333),
    university: university
      ? {
          id: university.id,
          name: university.name,
          shortName: university.shortName,
          lat: university.lat,
          lng: university.lng
        }
      : null,
    commute: primary
      ? {
          distanceKm: primary.distanceKm,
          walkMins: primary.walkMins,
          cycleMins: primary.cycleMins,
          uniShare: primary.uniShare
        }
      : null,
    forSelectedUni: Boolean(uniMeta),
    nearestStore: nearestStore
      ? { name: nearestStore.name, type: nearestStore.type, walkMins: nearestStore.walkMins }
      : null,
    storeWalkMins: storeWalk,
    fitHints: buildFitHints(place, uniMeta || primary, storeWalk)
  };
}

function buildFitHints(place, commute, storeWalk) {
  const hints = [];
  if (commute) {
    if (commute.walkMins <= 15) hints.push("Short walk to campus");
    else if (commute.cycleMins <= 15) hints.push("Easy cycle to campus");
    else hints.push("Longer commute to campus");

    if (commute.uniShare >= 75) hints.push("Many students from this uni live here");
    else if (commute.uniShare >= 50) hints.push("Fairly popular with this uni");
    else hints.push("Fewer students from this uni");
  }

  if (storeWalk != null) {
    if (storeWalk <= 5) hints.push("Supermarket / shops very close");
    else if (storeWalk <= 12) hints.push("Stores within a short walk");
    else hints.push("Shops are a bit further away");
  }

  if (place.billsIncluded) hints.push("Bills included");
  return hints;
}

function budgetStatus(rentWeekly, budgetWeekly) {
  if (!budgetWeekly || budgetWeekly <= 0) return { status: "unknown", delta: 0 };
  const delta = budgetWeekly - rentWeekly;
  if (delta >= 20) return { status: "under", delta };
  if (delta >= 0) return { status: "tight", delta };
  return { status: "over", delta };
}

function matchScore(place, opts) {
  const { universityId, budgetWeekly, maxWalk, needStores } = opts;
  const commute = universityId ? place.universities[universityId] : Object.values(place.universities)[0];
  if (!commute) return 0;

  let score = 40;
  score += Math.max(0, 30 - commute.walkMins);
  score += Math.min(25, commute.uniShare / 4);

  const nearestStore = (place.nearby.stores || []).slice().sort((a, b) => a.walkMins - b.walkMins)[0];
  if (nearestStore) score += Math.max(0, 15 - nearestStore.walkMins);

  if (budgetWeekly > 0) {
    const delta = budgetWeekly - place.rentWeekly;
    if (delta >= 0) score += Math.min(20, delta / 2);
    else score -= Math.min(35, Math.abs(delta) / 1.5);
  }

  if (place.billsIncluded) score += 5;
  if (maxWalk && commute.walkMins > maxWalk) score -= 25;
  if (needStores && nearestStore && nearestStore.walkMins > 8) score -= 12;

  return Math.max(0, Math.min(100, Math.round(score)));
}

app.get("/api/meta", (_req, res) => {
  res.json({
    regions: REGIONS,
    universities: UNIVERSITIES,
    types: TYPE_LABELS
  });
});

app.get("/api/search", (req, res) => {
  const region = String(req.query.region || "").trim().toLowerCase();
  const universityId = String(req.query.university || "").trim().toLowerCase();
  const budgetWeekly = Number(req.query.budget || 0);
  const maxWalk = Number(req.query.maxWalk || 0);
  const needStores = String(req.query.stores || "") === "1";
  const type = String(req.query.type || "").trim();
  const q = String(req.query.q || "").trim().toLowerCase();
  const sort = String(req.query.sort || "best");

  let results = ACCOMMODATIONS.slice();

  if (region) results = results.filter((a) => a.region === region);
  if (universityId) {
    results = results.filter((a) => a.universities[universityId]);
  }
  if (type) results = results.filter((a) => a.type === type);
  if (q) {
    results = results.filter((a) =>
      `${a.name} ${a.area} ${a.city} ${a.description} ${a.type}`
        .toLowerCase()
        .includes(q)
    );
  }
  if (maxWalk > 0 && universityId) {
    results = results.filter((a) => a.universities[universityId]?.walkMins <= maxWalk);
  }
  if (needStores) {
    results = results.filter((a) => {
      const nearest = (a.nearby.stores || []).slice().sort((x, y) => x.walkMins - y.walkMins)[0];
      return nearest && nearest.walkMins <= 8;
    });
  }

  const enriched = results.map((place) => {
    const item = enrichAccommodation(place, universityId || null);
    const score = matchScore(place, { universityId, budgetWeekly, maxWalk, needStores });
    const budget = budgetStatus(place.rentWeekly, budgetWeekly);
    return { ...item, matchScore: score, budget };
  });

  enriched.sort((a, b) => {
    if (sort === "cheap") return a.rentWeekly - b.rentWeekly;
    if (sort === "expensive") return b.rentWeekly - a.rentWeekly;
    if (sort === "closest") {
      return (a.commute?.walkMins || 999) - (b.commute?.walkMins || 999);
    }
    if (sort === "uni") {
      return (b.commute?.uniShare || 0) - (a.commute?.uniShare || 0);
    }
    if (sort === "stores") {
      return (a.storeWalkMins || 999) - (b.storeWalkMins || 999);
    }
    return b.matchScore - a.matchScore;
  });

  const regionMeta = REGIONS.find((r) => r.id === region) || null;
  const university = UNIVERSITIES.find((u) => u.id === universityId) || null;

  res.json({
    region: regionMeta,
    university,
    count: enriched.length,
    results: enriched
  });
});

app.get("/api/accommodation/:id", (req, res) => {
  const place = ACCOMMODATIONS.find((a) => a.id === req.params.id);
  if (!place) return res.status(404).json({ error: "Accommodation not found" });
  const universityId = String(req.query.university || "").trim().toLowerCase();
  const budgetWeekly = Number(req.query.budget || 0);
  const item = enrichAccommodation(place, universityId || null);
  item.matchScore = matchScore(place, {
    universityId,
    budgetWeekly,
    maxWalk: 0,
    needStores: false
  });
  item.budget = budgetStatus(place.rentWeekly, budgetWeekly);
  res.json(item);
});

app.get("/api/compare", (req, res) => {
  const ids = String(req.query.ids || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 4);
  const universityId = String(req.query.university || "").trim().toLowerCase();
  const budgetWeekly = Number(req.query.budget || 0);

  const items = ids
    .map((id) => ACCOMMODATIONS.find((a) => a.id === id))
    .filter(Boolean)
    .map((place) => {
      const item = enrichAccommodation(place, universityId || null);
      item.matchScore = matchScore(place, {
        universityId,
        budgetWeekly,
        maxWalk: 0,
        needStores: false
      });
      item.budget = budgetStatus(place.rentWeekly, budgetWeekly);
      return item;
    });

  res.json({ items });
});

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`StayCompare running at http://localhost:${PORT}`);
});
