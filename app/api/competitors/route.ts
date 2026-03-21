import { scrapeWebsite } from "@/lib/services/scraper";
import * as cheerio from "cheerio";
import { NextRequest, NextResponse } from "next/server";

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
  "Mozilla/5.0 (X11; Linux x86_64; rv:123.0) Gecko/20100101 Firefox/123.0",
];

const randomUA = () =>
  USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(request: NextRequest) {
  try {
    const { business_description } = await request.json();

    if (!business_description) {
      return NextResponse.json(
        { error: "business_description is required" },
        { status: 400 },
      );
    }

    const searchQuery = `${business_description} competitors`;
    const searchResults = await ddgSearch(searchQuery, { maxResults: 8 });

    const skipDomains = ["youtube.com"];

    const competitorUrls = searchResults
      .filter((r) => !skipDomains.some((d) => r.url.includes(d)))
      .slice(0, 5)
      .map((r) => r.url);

    const scraped = await batchFetch(competitorUrls, { concurrency: 3 });

    return NextResponse.json({
      data: {
        search_results: searchResults,
        competitor_urls: competitorUrls,
        websites: scraped.map((s) => ({
          url: s.url,
          content: s.text,
        })),
        competitor_context: scraped
          .map((s) => `--- ${s.url} ---\n${s.text}`)
          .join("\n\n"),
      },
    });
  } catch (err) {
    console.error("[COMPETITORS]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}

async function batchFetch(
  urls: string[],
  {
    concurrency = 3,
    delayMs = 800,
  }: { concurrency?: number; delayMs?: number } = {},
) {
  const results: Array<{ url: string; text: string }> = [];
  const chunks: string[][] = [];

  for (let i = 0; i < urls.length; i += concurrency) {
    chunks.push(urls.slice(i, i + concurrency));
  }

  for (const chunk of chunks) {
    const settled = await Promise.allSettled(
      chunk.map(async (url) => {
        const result = await scrapeWebsite(url);
        return { url, text: result.data };
      }),
    );

    for (const s of settled) {
      if (s.status === "fulfilled") results.push(s.value);
    }

    if (chunks.indexOf(chunk) < chunks.length - 1) await sleep(delayMs);
  }

  return results;
}

async function ddgSearch(
  query: string,
  { maxResults = 8 }: { maxResults?: number } = {},
) {
  const params = new URLSearchParams({ q: query, kl: "us-en" });
  const res = await fetch(`https://html.duckduckgo.com/html/?${params}`, {
    headers: {
      "User-Agent": randomUA(),
      Accept: "text/html",
    },
    signal: AbortSignal.timeout(12000),
  });

  if (!res.ok) throw new Error(`DDG search failed: ${res.status}`);

  const html = await res.text();
  const $ = cheerio.load(html);
  const results: Array<{ title: string; url: string; snippet: string }> = [];

  $(".result").each((_: number, el: cheerio.Element) => {
    if (results.length >= maxResults) return false;

    const title = $(el).find(".result__title").text().trim();
    const snippet = $(el).find(".result__snippet").text().trim();
    const href = $(el).find("a.result__a").attr("href") ?? "";

    // DDG wraps all links as //duckduckgo.com/l/?uddg=<encoded-url>&...
    // must prepend https: before parsing, then decode the uddg param.
    let url = "";
    try {
      const absolute = href.startsWith("//") ? `https:${href}` : href;
      const uddg = new URL(absolute).searchParams.get("uddg");
      url = uddg ? decodeURIComponent(uddg) : absolute;
    } catch {
      url = href;
    }

    if (title && url && !url.includes("duckduckgo.com")) {
      results.push({ title, url, snippet });
    }
  });

  return results;
}
