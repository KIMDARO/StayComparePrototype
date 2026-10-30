const express = require("express");
const cors = require("cors");
const path = require("path");
const catalog = require("./catalog");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(__dirname));

function decodeEntities(str) {
  return String(str || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function metaContent(html, property) {
  const patterns = [
    new RegExp(
      `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["'][^>]*>`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["'][^>]*>`,
      "i"
    )
  ];
  for (const re of patterns) {
    const match = html.match(re);
    if (match?.[1]) return decodeEntities(match[1]);
  }
  return "";
}

function extractTitle(html) {
  return (
    metaContent(html, "og:title") ||
    metaContent(html, "twitter:title") ||
    decodeEntities((html.match(/<title[^>]*>([^<]+)<\/title>/i) || [])[1] || "")
  );
}

function extractImage(html, pageUrl) {
  const raw =
    metaContent(html, "og:image") ||
    metaContent(html, "twitter:image") ||
    metaContent(html, "twitter:image:src");
  if (!raw) return "";
  try {
    return new URL(raw, pageUrl).toString();
  } catch {
    return raw;
  }
}

function extractDescription(html) {
  return (
    metaContent(html, "og:description") ||
    metaContent(html, "description") ||
    metaContent(html, "twitter:description")
  );
}

function guessWeeklyRent(text) {
  const sample = String(text || "");
  const patterns = [
    /£\s*(\d{2,4}(?:\.\d{1,2})?)\s*(?:\/|\s*per\s*)?\s*(?:pw|p\/w|a week|per week|weekly)/i,
    /(\d{2,4}(?:\.\d{1,2})?)\s*(?:gbp|pounds?)\s*(?:\/|\s*per\s*)?\s*(?:pw|p\/w|a week|per week|weekly)/i,
    /from\s*£\s*(\d{2,4}(?:\.\d{1,2})?)/i
  ];
  for (const re of patterns) {
    const match = sample.match(re);
    if (match?.[1]) {
      const value = Number(match[1]);
      if (value >= 40 && value <= 900) return value;
    }
  }
  return null;
}

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

/**
 * Lightweight public link preview (Open Graph / title / image only).
 * Students still confirm or enter weekly rent themselves — this is not a
 * commercial listings scrape and may fail when sites block bots or CORS.
 */
app.get("/api/link-preview", async (req, res) => {
  const rawUrl = String(req.query.url || "").trim();
  if (!rawUrl) return res.status(400).json({ error: "Pass a listing URL as ?url=" });

  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return res.status(400).json({ error: "That does not look like a valid URL." });
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return res.status(400).json({ error: "Only http(s) links are supported." });
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(parsed.toString(), {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "StayCompareLinkPreview/1.0 (student prototype; Open Graph only)",
        Accept: "text/html,application/xhtml+xml"
      }
    });
    clearTimeout(timer);

    if (!response.ok) {
      return res.status(502).json({
        error: "Could not open that link right now. You can still add the place manually."
      });
    }

    const contentType = String(response.headers.get("content-type") || "");
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
      return res.json({
        url: parsed.toString(),
        title: "",
        image: "",
        description: "",
        rentWeekly: null,
        note: "No HTML preview available — enter details manually."
      });
    }

    const html = (await response.text()).slice(0, 350000);
    const title = extractTitle(html).slice(0, 160);
    const image = extractImage(html, parsed.toString());
    const description = extractDescription(html).slice(0, 400);
    const rentWeekly = guessWeeklyRent(`${title} ${description} ${html.slice(0, 8000)}`);

    res.json({
      url: parsed.toString(),
      title,
      image,
      description,
      rentWeekly,
      note: rentWeekly
        ? "We guessed a weekly rent from the page text — check it before saving."
        : "Add the weekly rent yourself so comparisons stay accurate."
    });
  } catch {
    res.status(502).json({
      error: "Preview unavailable (site blocked the request or timed out). Enter details manually."
    });
  }
});

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`StayCompare running at http://localhost:${PORT}`);
});
