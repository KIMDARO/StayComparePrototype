const express = require("express");
const cors = require("cors");
const path = require("path");
const catalog = require("./catalog");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(__dirname));

app.get("/api/meta", (_req, res) => {
  res.json(catalog.getMeta());
});

app.get("/api/search", (req, res) => {
  res.json(catalog.search(req.query));
});

app.get("/api/accommodation/:id", (req, res) => {
  const item = catalog.getAccommodation(req.params.id, req.query);
  if (!item) return res.status(404).json({ error: "Accommodation not found" });
  res.json(item);
});

app.get("/api/compare", (req, res) => {
  res.json(catalog.compare(req.query.ids, req.query));
});

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`StayCompare running at http://localhost:${PORT}`);
});
