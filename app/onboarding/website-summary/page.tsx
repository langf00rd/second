"use client";

import { useApp } from "@/components/app-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { goBack } from "@/lib/utils";
import { ChevronRight, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const { scrapedWebsiteData } = useApp();
  return (
    <div className="space-y-3 px-5 pb-32">
      <Avatar>
        <AvatarImage src={scrapedWebsiteData.metadata?.favicon || ""} />
        <AvatarFallback>SC</AvatarFallback>
      </Avatar>
      <h1 className="text-accent-foreground">Brand Summary</h1>
      <h3 className="text-xl font-medium">
        {scrapedWebsiteData.metadata?.title}
      </h3>
      <p className="text-accent-foreground">
        {scrapedWebsiteData.llmSummary?.goal}
      </p>
      <hr />
      <div className="max-h-150 overflow-y-scroll">
        <p>{scrapedWebsiteData.llmSummary?.full}</p>
      </div>
      {scrapedWebsiteData.competitors.length > 0 && (
        <div className="mt-6 space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground">
            Competitors
          </h4>
          <div className="space-y-2 grid grid-cols-2 md:grid-cols-3">
            {scrapedWebsiteData.competitors.map((competitor, index) => (
              <a
                key={index}
                href={competitor.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <Avatar className="size-6">
                  <AvatarImage
                    src={`https://www.google.com/s2/favicons?domain=${competitor.url}&sz=32`}
                  />
                  <AvatarFallback className="text-xs">
                    {competitor.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium truncate">
                  {competitor.name}
                </span>
                <ExternalLink className="size-3 text-muted-foreground shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}
      <div className="flex gap-2 justify-end mt-10">
        <Button onClick={goBack} variant="ghost">
          Change website
        </Button>
        <Button>
          Continue
          <ChevronRight className="opacity-50" />
        </Button>
      </div>
    </div>
  );
}
