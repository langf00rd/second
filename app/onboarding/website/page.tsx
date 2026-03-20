"use client";

import { useApp } from "@/components/app-provider";
import ErrorBanner from "@/components/error-banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/lib/constants/routes";
import { fetchWebsiteMetadata } from "@/lib/services/metadata";
import { scrapeWebsite } from "@/lib/services/scraper";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Page() {
  const router = useRouter();
  const [url, setURL] = useState("");
  const { setWebsiteURL, websiteURL, setScrapedWebsiteData } = useApp();

  const scrapeQuery = useQuery({
    queryKey: ["scrape-website", url],
    queryFn: () => scrapeWebsite(url),
    enabled: false,
  });

  const metadataQuery = useQuery({
    queryKey: ["fetch-metadata", url],
    queryFn: () => fetchWebsiteMetadata(url),
    enabled: false,
  });

  useEffect(() => {
    async function handleScrapeComplete() {
      const scrapeQueryData = scrapeQuery.data;
      const metadataQueryData = metadataQuery.data;
      if (scrapeQueryData && metadataQueryData) {
        try {
          const response = await fetch("/api/summarize-website", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: scrapeQueryData.data }),
          });
          if (!response.ok) throw new Error("Failed to summarize");
          const { data: llmSummary } = await response.json();
          setScrapedWebsiteData((prev) => ({
            ...prev,
            metadata: metadataQueryData.data,
            data: scrapeQueryData.data,
            llmSummary,
          }));
          router.push(ROUTES.onboarding.websiteSummary);
        } catch (err) {
          console.error(err);
          toast.error("Failed to summarize website content");
        }
      }
    }

    handleScrapeComplete();
  }, [router, scrapeQuery.data, metadataQuery.data, setScrapedWebsiteData]);

  return (
    <>
      <form
        className="space-y-6"
        onSubmit={(evt) => {
          evt.preventDefault();
          metadataQuery.refetch();
          scrapeQuery.refetch();
        }}
      >
        <div>
          <Label className="text-xl">Paste your website or profile</Label>
          <small className="text-accent-foreground">
            This will be used to analyze your website and generate a profile.
          </small>
        </div>
        <Input
          type="url"
          name="url"
          required
          className="bg-accent/60"
          placeholder="https://site.com"
          defaultValue={websiteURL}
          onChange={(evt) => {
            const _url = evt.target.value;
            setURL(_url);
            setWebsiteURL(_url);
          }}
        />
        {scrapeQuery.error && <ErrorBanner error={scrapeQuery.error} />}
        {metadataQuery.error && <ErrorBanner error={metadataQuery.error} />}
        <Button isLoading={scrapeQuery.isFetching} type="submit">
          Analyze
        </Button>
      </form>
    </>
  );
}
