// Deterministic client for SEC EDGAR's full-text search API (efts.sec.gov).
// This is SEC's own public API, documented at https://www.sec.gov/edgar/search/ -
// we call it directly and parse the JSON; no LLM in the loop.
const UA = process.env.SEC_USER_AGENT || "FilingDeskBot/1.0 (contact: editors@example.com)";

// A rotating set of common 8-K item topics gives us variety without needing a
// single "everything" feed (EDGAR full-text search requires a query term).
const TOPICS = [
  { q: "material definitive agreement", label: "entry into a material definitive agreement" },
  { q: "departure of directors", label: "an executive or director departure" },
  { q: "completion of acquisition", label: "the completion of an acquisition or disposition of assets" },
  { q: "results of operations and financial condition", label: "preliminary results of operations" },
  { q: "unregistered sales of equity securities", label: "an unregistered sale of equity securities" },
  { q: "amendments to articles of incorporation", label: "an amendment to its governing corporate documents" },
];

function todayMinus(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export async function fetch8KFilings({ perTopic = 8, lookbackDays = 4 } = {}) {
  const startdt = todayMinus(lookbackDays);
  const enddt = todayMinus(0);
  const out = [];

  for (const topic of TOPICS) {
    const url = `https://efts.sec.gov/LATEST/search-index?q=${encodeURIComponent(
      `"${topic.q}"`
    )}&forms=8-K&startdt=${startdt}&enddt=${enddt}`;
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
      if (!res.ok) continue;
      const data = await res.json();
      const hits = data?.hits?.hits ?? [];
      for (const hit of hits.slice(0, perTopic)) {
        const src = hit._source || {};
        const displayName = (src.display_names && src.display_names[0]) || "";
        const companyMatch = displayName.match(/^(.*?)\s*\(CIK\s*0*(\d+)\)/i);
        const companyName = companyMatch ? companyMatch[1].trim() : displayName || "A public company";
        const cik = companyMatch ? companyMatch[2] : src.cik;
        const accession = src.adsh || hit._id?.split(":")[0];
        out.push({
          companyName,
          cik,
          accession,
          filingDate: src.file_date,
          formType: src.root_form || src.file_type || "8-K",
          topicLabel: topic.label,
          sourceUrl: accession && cik
            ? `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${cik}&type=8-K`
            : "https://www.sec.gov/edgar/search/",
        });
      }
    } catch (err) {
      console.error(`[fetch-8k-filings] failed for topic "${topic.q}":`, err.message);
    }
  }

  const seen = new Set();
  return out.filter((r) => {
    const key = `${r.companyName}|${r.filingDate}|${r.topicLabel}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
