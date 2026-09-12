// Turns raw, real filing facts into original article text. No source article is
// ever read or rewritten here — the only inputs are structured facts pulled
// straight from SEC filings / disclosure tables.

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function pick(list, seed) {
  return list[seed % list.length];
}

function parseMoney(v) {
  if (!v) return null;
  const n = Number(String(v).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function fmtMoney(n) {
  if (n === null) return null;
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(abs >= 10_000_000 ? 1 : 2)} million`;
  if (abs >= 1_000) return `$${Math.round(n).toLocaleString("en-US")}`;
  return `$${n.toFixed(2)}`;
}

function isBuy(tradeType) {
  return /\bP\b|purchase/i.test(tradeType || "");
}

const ENTITY_HINTS = /\b(LLC|L\.L\.C\.|Inc|Incorporated|Corp|Corporation|L\.P\.|LP|Partners|Capital|Holdings|Group|Trust|Ltd|Fund|Management|Advisors|Ventures)\b/i;

// openinsider lists individuals as "Last First[ Middle]"; flip to natural
// "First [Middle] Last" order for readability, but leave entity/LLC names
// (10% holders that are firms, not people) untouched.
function formatPersonName(raw) {
  const name = (raw || "").trim();
  if (!name || ENTITY_HINTS.test(name)) return name;
  const parts = name.split(/\s+/);
  if (parts.length === 2) return `${parts[1]} ${parts[0]}`;
  if (parts.length === 3 && /^[A-Z]\.?$|^(Jr|Sr|II|III|IV)\.?$/i.test(parts[2])) {
    return `${parts[1]} ${parts[0]} ${parts[2]}`;
  }
  if (parts.length === 3) return `${parts[1]} ${parts[2]} ${parts[0]}`;
  return name;
}

// ---------------------------------------------------------------------------
// Insider trading articles
// ---------------------------------------------------------------------------
function insiderTradeToArticle(rawRecord, publishedAt) {
  const r = { ...rawRecord, insiderName: formatPersonName(rawRecord.insiderName) };
  const value = parseMoney(r.value);
  const qty = parseMoney(r.qty);
  const price = parseMoney(r.price);
  const buy = isBuy(r.tradeType);
  const verb = buy ? "purchased" : "sold";
  const verbPast = buy ? "buying" : "selling";
  const seed = hashStr(`${r.ticker}${r.insiderName}${r.tradeDate}${r.qty}`);

  const titleTemplates = [
    `${r.insiderTitle || "Insider"} at ${r.company} ${buy ? "Buys" : "Sells"} ${
      value ? fmtMoney(Math.abs(value)) : "Shares"
    } in Stock`,
    `${r.company} ${buy ? "Insider Buying" : "Insider Selling"}: ${r.insiderName} ${
      buy ? "Adds" : "Trims"
    } Stake`,
    `${r.insiderName}, ${r.insiderTitle || "an insider"} at ${r.company}, ${
      buy ? "Buys" : "Sells"
    } Shares Worth ${value ? fmtMoney(Math.abs(value)) : "Undisclosed Amount"}`,
  ];

  const openers = [
    `${r.insiderName}, who serves as ${r.insiderTitle || "an insider"} at ${r.company} (${r.ticker}), ${verb} ${
      qty ? Math.abs(qty).toLocaleString("en-US") + " shares" : "shares"
    } of the company's stock, according to a disclosure filed with the U.S. Securities and Exchange Commission.`,
    `A Form 4 filed with the SEC shows ${r.insiderName}, ${r.insiderTitle || "an insider"} at ${r.company} (${r.ticker}), ${verb} ${
      qty ? Math.abs(qty).toLocaleString("en-US") + " shares" : "shares"
    } of company stock${r.tradeDate ? ` on ${r.tradeDate}` : ""}.`,
    `${r.company} (${r.ticker}) disclosed that ${r.insiderName}, who holds the position of ${
      r.insiderTitle || "insider"
    } at the company, was involved in ${verbPast} ${
      qty ? Math.abs(qty).toLocaleString("en-US") + " shares" : "a block of shares"
    }, per a Form 4 filing with the SEC.`,
  ];

  const detailSentences = [];
  if (price) {
    detailSentences.push(
      `The transaction was executed at a price of $${price.toFixed(2)} per share${
        value ? `, for a total value of approximately ${fmtMoney(Math.abs(value))}` : ""
      }.`
    );
  } else if (value) {
    detailSentences.push(`The total value of the transaction was approximately ${fmtMoney(Math.abs(value))}.`);
  }

  const contextSentences = [
    `Under SEC rules, corporate insiders — officers, directors, and holders of more than 10% of a company's shares — are required to report changes in their ownership within two business days of the transaction via Form 4.`,
    `Company insiders are required to disclose changes in their stock ownership to the SEC on Form 4, typically within two business days of the trade.`,
    `Insider transactions of this kind are publicly disclosed through Form 4 filings with the SEC, which must generally be submitted within two business days of the trade date.`,
  ];

  const closers = buy
    ? [
        `Insider buying is sometimes viewed by investors as a signal of confidence in a company's prospects, though a single transaction does not necessarily indicate a broader trend.`,
        `Purchases by company insiders are one of several signals investors monitor, alongside earnings results and broader sector trends.`,
      ]
    : [
        `Insider sales are common and can occur for reasons unrelated to a company's outlook, including scheduled trading plans, diversification, or personal financial planning.`,
        `Sales by insiders often reflect routine portfolio management or pre-scheduled trading plans rather than a view on the company's prospects.`,
      ];

  const body = [
    pick(openers, seed),
    pick(detailSentences.length ? detailSentences : contextSentences, seed + 1),
    pick(contextSentences, seed + 2),
    pick(closers, seed + 3),
  ];

  const dek = `${r.insiderName} (${r.insiderTitle || "insider"}) ${verb} ${
    qty ? Math.abs(qty).toLocaleString("en-US") + " shares" : "shares"
  } of ${r.company}${value ? `, valued at approximately ${fmtMoney(Math.abs(value))}` : ""}.`;

  const dateStr = r.filingDate || r.tradeDate || new Date().toISOString().slice(0, 10);
  const slug = `${slugify(r.ticker)}-insider-${buy ? "buy" : "sale"}-${slugify(r.insiderName)}-${slugify(
    dateStr
  )}-${seed.toString(36).slice(0, 5)}`;

  return {
    slug,
    title: pick(titleTemplates, seed),
    dek,
    category: "insider-trading",
    ticker: r.ticker,
    companyName: r.company,
    publishedAt,
    byline: "Max I.",
    body,
    sourceLabel: `OpenInsider — ${r.ticker} Form 4 disclosure data`,
    sourceUrl: r.sourcePage || "http://openinsider.com/latest-insider-trading",
    tags: [r.ticker, r.company, "insider trading", "Form 4"],
  };
}

// ---------------------------------------------------------------------------
// 8-K material event articles
// ---------------------------------------------------------------------------
function eightKToArticle(r, publishedAt) {
  const seed = hashStr(`${r.companyName}${r.filingDate}${r.topicLabel}`);
  const titleTemplates = [
    `${r.companyName} Discloses ${capitalize(r.topicLabel)} in New SEC Filing`,
    `${r.companyName} Files 8-K Regarding ${capitalize(r.topicLabel)}`,
    `SEC Filing: ${r.companyName} Reports ${capitalize(r.topicLabel)}`,
  ];
  const openers = [
    `${r.companyName} filed a Form 8-K with the U.S. Securities and Exchange Commission disclosing ${r.topicLabel}${
      r.filingDate ? `, according to the filing dated ${r.filingDate}` : ""
    }.`,
    `A Form 8-K filed by ${r.companyName} with the SEC${
      r.filingDate ? ` on ${r.filingDate}` : ""
    } discloses ${r.topicLabel}.`,
  ];
  const context = [
    `Public companies are required to file a Form 8-K with the SEC within four business days of a material corporate event, covering matters ranging from leadership changes to major agreements and financial results.`,
    `The 8-K is the form the SEC requires public companies to use to announce major events that shareholders should know about on a current basis, rather than waiting for the next quarterly or annual report.`,
  ];
  const closers = [
    `The filing is publicly available through the SEC's EDGAR system, which maintains disclosure records for all reporting companies.`,
    `Investors can review the full filing directly through the SEC's EDGAR database for additional detail beyond what is summarized here.`,
  ];

  const body = [pick(openers, seed), pick(context, seed + 1), pick(closers, seed + 2)];
  const dek = `${r.companyName} disclosed ${r.topicLabel} in a Form 8-K filed with the SEC${
    r.filingDate ? ` on ${r.filingDate}` : ""
  }.`;
  const dateStr = r.filingDate || new Date().toISOString().slice(0, 10);
  const slug = `${slugify(r.companyName)}-8k-${slugify(r.topicLabel).slice(0, 40)}-${slugify(
    dateStr
  )}-${seed.toString(36).slice(0, 5)}`;

  return {
    slug,
    title: pick(titleTemplates, seed),
    dek,
    category: "corporate-filings",
    ticker: undefined,
    companyName: r.companyName,
    publishedAt,
    byline: "Max I.",
    body,
    sourceLabel: `SEC EDGAR — ${r.companyName} Form 8-K`,
    sourceUrl: r.sourceUrl,
    tags: [r.companyName, "8-K", "material event"],
  };
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

export function generateArticles({ insiderTrades = [], eightKFilings = [], count, baseDate = new Date() }) {
  const articles = [];
  // Interleave so a batch isn't all one category.
  const maxLen = Math.max(insiderTrades.length, eightKFilings.length);
  for (let i = 0; i < maxLen && articles.length < count; i++) {
    if (insiderTrades[i]) {
      const publishedAt = new Date(baseDate.getTime() - articles.length * 11 * 60 * 1000).toISOString();
      articles.push(insiderTradeToArticle(insiderTrades[i], publishedAt));
    }
    if (eightKFilings[i] && articles.length < count) {
      const publishedAt = new Date(baseDate.getTime() - articles.length * 11 * 60 * 1000).toISOString();
      articles.push(eightKToArticle(eightKFilings[i], publishedAt));
    }
  }
  return articles.slice(0, count);
}
