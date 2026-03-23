"use client";

import { setWebsiteSummaryCookie } from "@/app/actions/chat";
import {
  createOrganizationWithScrapedData,
  updateOrganization,
} from "@/app/actions/user";
import { useApp } from "@/components/app-provider";
import ErrorBanner from "@/components/error-banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Json } from "@/lib/supabase/types";
import { ROUTES } from "@/lib/constants/routes";
import { getCurrentUser } from "@/lib/auth";
import type { WebsiteMetadata } from "@/lib/types";
import type { Competitor } from "@/lib/services/llm/openrouter";
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
  const {
    setWebsiteURL,
    websiteURL,
    setScrapedWebsiteData,
    addStatus,
    clearTrail,
  } = useApp();

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
    mutationFn: async ({
      websites,
    }: {
      websites: Array<{ url: string; content: string }>;
    }) => {
      const response = await fetch("/api/competitors-extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ websites }),
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

    clearTrail();

    try {
      const user = await getCurrentUser();
      if (!user) {
        toast.error("Please sign in first");
        router.push(ROUTES.signIn);
        return;
      }

      let orgId: string = "";
      let content = "";
      let metadata: WebsiteMetadata | null = null;
      let llmSummary: { goal: string; full: string; industry: string; competitor_keywords?: string[] } | null = null;
      let competitors: { websites: Array<{ url: string; content: string }>; competitor_context?: string } | null = null;
      let extractedCompetitors: Competitor[] = [];

      // Step 1: Scrape website
      addStatus("scraping");
      const [scrapeResult, metadataResult] = await Promise.all([
        scrapeQuery.refetch(),
        metadataQuery.refetch(),
      ]);

      if (scrapeResult.error || metadataResult.error) {
        addStatus("error");
        return;
      }

      content = scrapeResult.data?.data || "";
      metadata = metadataResult.data?.data || null;

      // Create organization with initial data
      const initialOrg = await createOrganizationWithScrapedData(
        user.id,
        {
          metadata,
          llmSummary: null,
          competitors: [],
          competitorsContext: null,
        },
        url,
        metadata?.title || null,
        [],
      );

      if (!initialOrg) {
        toast.error("Failed to create organization");
        addStatus("error");
        return;
      }

      orgId = initialOrg.id;

      // Step 2: Generate summary
      addStatus("generating_summary");
      llmSummary = await summarizeMutation.mutateAsync({ content });

      // Update org with summary
      await updateOrganization(orgId, {
        llm_summary: llmSummary as unknown as Json,
      });

      // Step 3: Fetch competitors
      addStatus("fetching_competitors");
      competitors = await competitorsMutation.mutateAsync({
        industry: llmSummary!.industry,
      });

      // Step 4: Extract competitors
      addStatus("extracting_competitors");
      extractedCompetitors = await extractCompetitorsMutation.mutateAsync({
        websites: competitors!.websites,
      });

      // Update org with competitors
      await updateOrganization(orgId, {
        competitors: extractedCompetitors as unknown as Json,
      });

      setScrapedWebsiteData({
        metadata,
        data: content,
        llmSummary,
        competitorsContext: competitors!.competitor_context || null,
        competitors: extractedCompetitors,
      });

      await setWebsiteSummaryCookie(
        {
          goal: llmSummary!.goal,
          full: llmSummary!.full,
          industry: llmSummary!.industry,
          competitorKeywords: llmSummary!.competitor_keywords,
        },
        {
          metadata,
          url,
          llmSummary,
          competitors: extractedCompetitors,
        },
      );

      addStatus("complete");
      router.push(ROUTES.setup.summary);
    } catch (err) {
      console.error(err);
      addStatus("error");
      toast.error("Failed to analyze website");
    }
  };

  return (
    <div className="px-5">
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
    </div>
  );
}
