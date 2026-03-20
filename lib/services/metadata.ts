import { WebsiteMetadata } from "../types";

export async function fetchWebsiteMetadata(
  url: string,
): Promise<{ data: WebsiteMetadata }> {
  const response = await fetch(`/api/metadata?url=${encodeURIComponent(url)}`);
  if (!response.ok)
    throw new Error(`Failed to fetch metadata: ${response.status}`);
  return response.json();
}
