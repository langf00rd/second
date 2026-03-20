"use client";

import { useApp } from "@/components/app-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { goBack } from "@/lib/utils";

export default function Page() {
  const { scrapedWebsiteData } = useApp();
  return (
    <div className="space-y-3">
      <Avatar>
        <AvatarImage src={scrapedWebsiteData.metadata?.favicon || ""} />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <h1 className="text-xl font-medium">Brand summary</h1>
      <h3>{scrapedWebsiteData.metadata?.title}</h3>
      <p className="text-accent-foreground">
        {scrapedWebsiteData.llmSummary?.goal}
      </p>
      <div className="max-h-150 p-2 border bg-neutral-100 rounded overflow-y-scroll">
        <p>{scrapedWebsiteData.llmSummary?.full}</p>
      </div>
      <div className="flex gap-2 justify-end mt-10">
        <Button onClick={goBack} variant="ghost">
          Change website
        </Button>
        <Button>Continue</Button>
      </div>
    </div>
  );
}
