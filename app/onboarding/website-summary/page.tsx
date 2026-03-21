"use client";

import { useApp } from "@/components/app-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants/routes";
import { goBack } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const { scrapedWebsiteData } = useApp();
  return (
    <div className="space-y-3">
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
      <div className="flex gap-2 justify-end mt-10">
        <Button onClick={goBack} variant="ghost">
          Change website
        </Button>
        <Button onClick={() => router.push(ROUTES.onboarding.questions)}>
          Continue
          <ChevronRight className="opacity-50" />
        </Button>
      </div>
    </div>
  );
}
