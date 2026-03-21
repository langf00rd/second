"use client";

import { useApp } from "@/components/app-provider";
import ErrorBanner from "@/components/error-banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/lib/constants/routes";
import { fetchWebsiteMetadata } from "@/lib/services/metadata";
import { scrapeWebsite } from "@/lib/services/scraper";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
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

  const summarizeMutation = useMutation({
    mutationFn: async ({ content }: { content: string }) => {
      const response = await fetch("/api/summarize-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error("Failed to summarize");
      const { data } = await response.json();
      return data;
    },
  });

  const competitorsMutation = useMutation({
    mutationFn: async ({ industry }: { industry: string }) => {
      const response = await fetch("/api/competitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business_description: industry }),
      });
      if (!response.ok) throw new Error("Failed to fetch competitors");
      const { data } = await response.json();
      return data;
    },
  });

  const extractCompetitorsMutation = useMutation({
    mutationFn: async ({ content }: { content: string }) => {
      const response = await fetch("/api/competitors-extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error("Failed to extract competitors");
      const { data } = await response.json();
      return data;
    },
  });

  const isLoading =
    scrapeQuery.isFetching ||
    metadataQuery.isFetching ||
    summarizeMutation.isPending ||
    competitorsMutation.isPending ||
    extractCompetitorsMutation.isPending;

  const handleSubmit = async (evt: React.FormEvent) => {
    evt.preventDefault();

    try {
      const [scrapeResult, metadataResult] = await Promise.all([
        scrapeQuery.refetch(),
        metadataQuery.refetch(),
      ]);

      if (scrapeResult.error || metadataResult.error) return;

      const content = scrapeResult.data?.data || "";
      const metadata = metadataResult.data?.data || null;

      const llmSummary = await summarizeMutation.mutateAsync({ content });
      const competitors = await competitorsMutation.mutateAsync({
        industry: llmSummary.industry,
      });
      const extractedCompetitors = await extractCompetitorsMutation.mutateAsync(
        {
          content: competitors.competitor_context,
        },
      );

      setScrapedWebsiteData({
        metadata,
        data: content,
        llmSummary,
        competitorsContext: competitors.competitor_context,
        competitors: extractedCompetitors,
      });

      router.push(ROUTES.onboarding.websiteSummary);
    } catch (err) {
      console.error(err);
      toast.error("Failed to analyze website");
    }
  };

  return (
    <>
      <form className="space-y-6" onSubmit={handleSubmit}>
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
        {summarizeMutation.error && (
          <ErrorBanner error={summarizeMutation.error} />
        )}
        {competitorsMutation.error && (
          <ErrorBanner error={competitorsMutation.error} />
        )}
        {extractCompetitorsMutation.error && (
          <ErrorBanner error={extractCompetitorsMutation.error} />
        )}
        <Button type="submit" isLoading={isLoading}>
          Analyze
          <ChevronRight className="opacity-50" />
        </Button>
      </form>
    </>
  );
}
