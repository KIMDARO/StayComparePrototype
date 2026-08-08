/**
 * Client + server catalog API for StayCompare.
 * Browser: uses window.StayCompareData
 * Node: requires ./data
 */
(function (root, factory) {
  const data =
    typeof module !== "undefined" && module.exports
      ? require("./data")
      : root.StayCompareData;

  if (!data) {
    throw new Error("StayCompareData is missing. Load data.js before catalog.js.");
  }

  const api = factory(data);
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  root.StayCompareCatalog = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (data) {
  const { UNIVERSITIES, REGIONS, ACCOMMODATIONS, TYPE_LABELS } = data;

  // Curated Unsplash photos by accommodation type (stable, hotlink-friendly).
  const IMAGE_POOLS = {
    "university-halls": [
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5",
      "https://images.unsplash.com/photo-1626178793926-22b28830aa30",
      "https://images.unsplash.com/photo-1497366216548-37526070297c",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688"
    ],
    "private-halls": [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab",
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914",
      "https://images.unsplash.com/photo-1460317440163-593137109041",
      "https://images.unsplash.com/photo-1560448204-603b3fc33ddc"
    ],
    "shared-house": [
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994",
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
      "https://images.unsplash.com/photo-1605276374104-dee2afe26ae6",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9"
    ],
    "private-rent": [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb",
      "https://images.unsplash.com/photo-1502672023489-bb85a95f1c0d",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
      "https://images.unsplash.com/photo-1560184897-ae75f418493e",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85"
    ],
    studio: [
      "https://images.unsplash.com/photo-1536376072261-38c75010e6c9",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7"
    ]
  };

  function pickImage(place) {
    if (place.image) return place.image;
    const pool = IMAGE_POOLS[place.type] || IMAGE_POOLS["shared-house"];
    let hash = 0;
    for (let i = 0; i < place.id.length; i += 1) {
      hash = (hash + place.id.charCodeAt(i) * (i + 1)) % 997;
    }
    const base = pool[hash % pool.length];
    return `${base}?auto=format&fit=crop&w=900&h=700&q=80`;
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
    const commute = universityId
      ? place.universities[universityId]
      : Object.values(place.universities)[0];
    if (!commute) return 0;

    let score = 40;
    score += Math.max(0, 30 - commute.walkMins);
    score += Math.min(25, commute.uniShare / 4);

    const nearestStore = (place.nearby.stores || [])
      .slice()
      .sort((a, b) => a.walkMins - b.walkMins)[0];
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

  function enrichAccommodation(place, universityId) {
    const uniMeta = universityId ? place.universities[universityId] : null;
    const primaryUniId = universityId || Object.keys(place.universities)[0];
    const primary = place.universities[primaryUniId];
    const university = UNIVERSITIES.find((u) => u.id === primaryUniId);
    const nearestStore = (place.nearby.stores || [])
      .slice()
      .sort((a, b) => a.walkMins - b.walkMins)[0];
    const storeWalk = nearestStore ? nearestStore.walkMins : null;

    return {
      ...place,
      image: pickImage(place),
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
        ? {
            name: nearestStore.name,
            type: nearestStore.type,
            walkMins: nearestStore.walkMins
          }
        : null,
      storeWalkMins: storeWalk,
      fitHints: buildFitHints(place, uniMeta || primary, storeWalk)
    };
  }

  function getMeta() {
    return {
      regions: REGIONS,
      universities: UNIVERSITIES,
      types: TYPE_LABELS
    };
  }

  function search(query = {}) {
    const region = String(query.region || "").trim().toLowerCase();
    const universityId = String(query.university || "").trim().toLowerCase();
    const budgetWeekly = Number(query.budget || 0);
    const maxWalk = Number(query.maxWalk || 0);
    const needStores = query.stores === true || query.stores === "1" || query.stores === 1;
    const type = String(query.type || "").trim();
    const q = String(query.q || "").trim().toLowerCase();
    const sort = String(query.sort || "best");

    let results = ACCOMMODATIONS.slice();

    if (region) results = results.filter((a) => a.region === region);
    if (universityId) results = results.filter((a) => a.universities[universityId]);
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
        const nearest = (a.nearby.stores || [])
          .slice()
          .sort((x, y) => x.walkMins - y.walkMins)[0];
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

    return {
      region: REGIONS.find((r) => r.id === region) || null,
      university: UNIVERSITIES.find((u) => u.id === universityId) || null,
      count: enriched.length,
      results: enriched
    };
  }

  function getAccommodation(id, query = {}) {
    const place = ACCOMMODATIONS.find((a) => a.id === id);
    if (!place) return null;
    const universityId = String(query.university || "").trim().toLowerCase();
    const budgetWeekly = Number(query.budget || 0);
    const item = enrichAccommodation(place, universityId || null);
    item.matchScore = matchScore(place, {
      universityId,
      budgetWeekly,
      maxWalk: 0,
      needStores: false
    });
    item.budget = budgetStatus(place.rentWeekly, budgetWeekly);
    return item;
  }

  function compare(ids, query = {}) {
    const list = (Array.isArray(ids) ? ids : String(ids || "").split(","))
      .map((x) => String(x).trim())
      .filter(Boolean)
      .slice(0, 4);

    const universityId = String(query.university || "").trim().toLowerCase();
    const budgetWeekly = Number(query.budget || 0);

    const items = list
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

    return { items };
  }

  return {
    getMeta,
    search,
    getAccommodation,
    compare,
    UNIVERSITIES,
    REGIONS,
    TYPE_LABELS
  };
});
