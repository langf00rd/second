export async function scrapeWebsite(url: string) {
  const response = await fetch(`https://r.jina.ai/${url}`);
  const data = await response.text();
  if (!response.ok) throw new Error(data);
  return { data };
}
