#!/usr/bin/env node
// Orchestrates the whole pipeline: fetch real filings -> generate original
// articles -> merge into content/articles.json -> publish (locally and/or via
// the GitHub Contents API so Railway redeploys on push).
import fs from "fs";
import path from "path";
import { fetchInsiderTrades } from "./lib/fetch-insider-trades.mjs";
import { fetch8KFilings } from "./lib/fetch-8k-filings.mjs";
import { generateArticles } from "./lib/generate-articles.mjs";
import { isGithubConfigured, getRemoteFile, putRemoteFile } from "./lib/github-sync.mjs";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? true];
  })
);
const COUNT = Number(args.count || 13);
const MODE = args.mode || "daily";
const MAX_STORED = 1000;
const LOCAL_PATH = path.join(process.cwd(), "content", "articles.json");

function loadLocal() {
  try {
    return JSON.parse(fs.readFileSync(LOCAL_PATH, "utf-8"));
  } catch {
    return [];
  }
}

async function main() {
  console.log(`[run-daily] mode=${MODE} count=${COUNT} github=${isGithubConfigured()}`);

  const [insiderTrades, eightKFilings] = await Promise.all([
    fetchInsiderTrades({ maxPerPage: 60 }),
    fetch8KFilings({ perTopic: 10 }),
  ]);
  console.log(
    `[run-daily] fetched ${insiderTrades.length} insider trade records, ${eightKFilings.length} 8-K records`
  );

  // Load existing articles: prefer GitHub (source of truth for the deployed
  // site) when configured, otherwise fall back to the local file.
  let existing = [];
  let remoteSha = null;
  if (isGithubConfigured()) {
    const { content, sha } = await getRemoteFile("content/articles.json");
    existing = content ? JSON.parse(content) : [];
    remoteSha = sha;
  } else {
    existing = loadLocal();
  }
  const existingSlugs = new Set(existing.map((a) => a.slug));

  const newArticles = generateArticles({ insiderTrades, eightKFilings, count: COUNT * 3 }).filter(
    (a) => !existingSlugs.has(a.slug)
  );
  const toAdd = newArticles.slice(0, COUNT);

  if (toAdd.length === 0) {
    console.log("[run-daily] no new articles generated (no fresh source data or all duplicates) — exiting");
    return;
  }

  const merged = [...toAdd, ...existing].slice(0, MAX_STORED);
  const json = JSON.stringify(merged, null, 2);

  // Always write locally too, so `npm run dev` / a local build sees it.
  fs.writeFileSync(LOCAL_PATH, json);
  console.log(`[run-daily] wrote ${merged.length} total articles locally (${toAdd.length} new)`);

  if (isGithubConfigured()) {
    await putRemoteFile(
      "content/articles.json",
      json,
      remoteSha,
      `content: publish ${toAdd.length} new articles (${MODE})`
    );
    console.log(`[run-daily] pushed ${toAdd.length} new articles to GitHub — Railway will redeploy`);
  } else {
    console.log("[run-daily] GITHUB_TOKEN/GITHUB_REPO not set — skipped remote publish (local only)");
  }
}

main().catch((err) => {
  console.error("[run-daily] fatal error:", err);
  process.exit(1);
});
