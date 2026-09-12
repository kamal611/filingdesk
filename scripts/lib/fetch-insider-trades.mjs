// Deterministic parser for openinsider.com's public transaction tables.
// No LLM in the loop: we fetch the raw HTML and parse the table cells directly,
// so every figure that ends up in an article is exactly what the page shows.
import * as cheerio from "cheerio";

const PAGES = [
  "http://openinsider.com/latest-insider-trading",
  "http://openinsider.com/latest-cluster-buys",
  "http://openinsider.com/top-officer-purchases-of-the-week",
];

const UA = process.env.SCRAPE_USER_AGENT || "FilingDeskBot/1.0 (contact: editors@example.com)";

function cleanText(s) {
  return (s || "").replace(/\s+/g, " ").trim();
}

function parseTable(html) {
  const $ = cheerio.load(html);
  const rows = [];
  // openinsider renders one primary results table; find the one with the most rows.
  let bestTable = null;
  let bestCount = 0;
  $("table").each((_, table) => {
    const count = $(table).find("tr").length;
    if (count > bestCount) {
      bestCount = count;
      bestTable = table;
    }
  });
  if (!bestTable) return rows;

  const headerCells = $(bestTable)
    .find("tr")
    .first()
    .find("th, td")
    .map((_, el) => cleanText($(el).text()).toLowerCase())
    .get();

  const idx = (names) => headerCells.findIndex((h) => names.some((n) => h.includes(n)));
  const col = {
    filingDate: idx(["filing date", "x filing"]),
    tradeDate: idx(["trade date"]),
    ticker: idx(["ticker"]),
    company: idx(["company"]),
    insider: idx(["insider name"]),
    title: idx(["title"]),
    tradeType: idx(["trade type"]),
    price: idx(["price"]),
    qty: idx(["qty"]),
    value: idx(["value"]),
  };

  $(bestTable)
    .find("tr")
    .slice(1)
    .each((_, tr) => {
      const cells = $(tr)
        .find("td")
        .map((_, el) => cleanText($(el).text()))
        .get();
      if (cells.length < 8) return;
      const get = (i) => (i >= 0 && i < cells.length ? cells[i] : "");
      const ticker = get(col.ticker);
      const company = get(col.company);
      if (!ticker || !company) return;
      rows.push({
        filingDate: get(col.filingDate),
        tradeDate: get(col.tradeDate),
        ticker,
        company,
        insiderName: get(col.insider),
        insiderTitle: get(col.title),
        tradeType: get(col.tradeType),
        price: get(col.price),
        qty: get(col.qty),
        value: get(col.value),
      });
    });

  return rows;
}

export async function fetchInsiderTrades({ maxPerPage = 40 } = {}) {
  const all = [];
  for (const url of PAGES) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA } });
      if (!res.ok) continue;
      const html = await res.text();
      const rows = parseTable(html).slice(0, maxPerPage);
      for (const r of rows) all.push({ ...r, sourcePage: url });
    } catch (err) {
      console.error(`[fetch-insider-trades] failed for ${url}:`, err.message);
    }
  }

  // De-duplicate on ticker + insider + tradeDate + qty (same disclosure can appear on multiple pages)
  const seen = new Set();
  const deduped = [];
  for (const r of all) {
    const key = `${r.ticker}|${r.insiderName}|${r.tradeDate}|${r.qty}|${r.value}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(r);
  }
  return deduped;
}
