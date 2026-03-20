import { WebsiteMetadata } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

function extractMeta(content: string, pattern: RegExp): string | undefined {
  const match = content.match(pattern);
  return match ? match[1] : undefined;
}

async function fetchFavicon(url: string): Promise<string | undefined> {
  try {
    const urlObj = new URL(url);
    const faviconResponse = await fetch(`${urlObj.origin}/favicon.ico`, {
      next: { revalidate: 3600 },
    });
    if (faviconResponse.ok) {
      return `${urlObj.origin}/favicon.ico`;
    }
  } catch {
    // ignore
  }
  return undefined;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; MetadataFetcher/1.0)",
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: ${response.status}` },
        { status: response.status },
      );
    }

    const html = await response.text();

    const title =
      extractMeta(html, /<title[^>]*>([^<]+)<\/title>/i) ||
      extractMeta(
        html,
        /<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i,
      ) ||
      extractMeta(html, /<meta[^>]+content="([^"]+)"[^>]+property="og:title"/i);

    const description =
      extractMeta(
        html,
        /<meta[^>]+name="description"[^>]+content="([^"]+)"/i,
      ) ||
      extractMeta(
        html,
        /<meta[^>]+content="([^"]+)"[^>]+name="description"/i,
      ) ||
      extractMeta(
        html,
        /<meta[^>]+property="og:description"[^>]+content="([^"]+)"/i,
      ) ||
      extractMeta(
        html,
        /<meta[^>]+content="([^"]+)"[^>]+property="og:description"/i,
      );

    const ogImage =
      extractMeta(
        html,
        /<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i,
      ) ||
      extractMeta(html, /<meta[^>]+content="([^"]+)"[^>]+property="og:image"/i);

    const ogTitle =
      extractMeta(
        html,
        /<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i,
      ) ||
      extractMeta(html, /<meta[^>]+content="([^"]+)"[^>]+property="og:title"/i);

    const ogDescription =
      extractMeta(
        html,
        /<meta[^>]+property="og:description"[^>]+content="([^"]+)"/i,
      ) ||
      extractMeta(
        html,
        /<meta[^>]+content="([^"]+)"[^>]+property="og:description"/i,
      );

    const favicon = await fetchFavicon(url);

    const metadata: WebsiteMetadata = {
      url,
      title,
      description,
      og_image: ogImage,
      og_title: ogTitle,
      og_description: ogDescription,
      favicon,
    };

    return NextResponse.json({ data: metadata });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
