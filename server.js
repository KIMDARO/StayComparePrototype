const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(__dirname));

app.get("/api/search-stays", async (req, res) => {
  const query = String(req.query.q || "").trim();
  if (!query) return res.json({ results: [] });
  try {
    const response = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: {
        q: query,
        format: "jsonv2",
        addressdetails: 1,
        limit: 8
      },
      headers: {
        "User-Agent": "StayCompare/1.0 (local prototype)"
      },
      timeout: 15000
    });

    const data = Array.isArray(response.data) ? response.data : [];
    const results = data.map((item) => ({
      title: item.name || item.display_name?.split(",")[0] || "Location result",
      link: item.osm_type && item.osm_id ? `https://www.openstreetmap.org/${item.osm_type}/${item.osm_id}` : `https://www.openstreetmap.org/?mlat=${item.lat}&mlon=${item.lon}#map=16/${item.lat}/${item.lon}`,
      snippet: item.display_name || ""
    }));

    res.json({ results });
  } catch (error) {
    res.status(502).json({
      error: "Search provider unavailable right now. Please try again."
    });
  }
});

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`StayCompare running at http://localhost:${PORT}`);
});
