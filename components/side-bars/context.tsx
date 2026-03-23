import Console from "@/components/console";
import { getCurrentUser } from "@/lib/auth";
import { getUserOrganizations } from "@/lib/supabase/db";
import { ExternalLink } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useApp } from "../app-provider";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export default function ContextSideBar() {
  const { scrapedWebsiteData } = useApp();

  const [org, setOrg] = useState<{
    name: string | null;
    website: string | null;
    metadata: Record<string, unknown> | null;
    llm_summary: Record<string, unknown> | null;
    competitors: Array<{ name: string; url: string }> | null;
  } | null>(null);

  useEffect(() => {
    async function fetchOrg() {
      const user = await getCurrentUser();
      if (!user) return;

      const orgs = await getUserOrganizations(user.id);
      if (orgs && orgs.length > 0) {
        setOrg(
          orgs[0] as {
            name: string | null;
            website: string | null;
            metadata: Record<string, unknown> | null;
            llm_summary: Record<string, unknown> | null;
            competitors: Array<{ name: string; url: string }> | null;
          },
        );
      }
    }
    fetchOrg();
  }, []);

  const metadata = org?.metadata || scrapedWebsiteData.metadata;
  const llmSummary = org?.llm_summary || scrapedWebsiteData.llmSummary;
  const competitors = org?.competitors || scrapedWebsiteData.competitors;

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ type: "tween", duration: 0.2 }}
      className="flex-1 border-l p-5 relative max-w-[400px]"
    >
      <div className="space-y-3">
        <Avatar>
          <AvatarImage
            src={(metadata as { favicon?: string })?.favicon || ""}
          />
          <AvatarFallback>SC</AvatarFallback>
        </Avatar>
        <h3 className="text-xl font-medium">
          {org?.name || (metadata as { title?: string })?.title}
        </h3>
        <p className="text-accent-foreground">
          {(llmSummary as { goal?: string })?.goal}
        </p>
        <div className="max-h-150 overflow-y-scroll">
          <p>{(llmSummary as { full?: string })?.full}</p>
        </div>
        {competitors && competitors.length > 0 && (
          <div className="mt-6 space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">
              Competitors
            </h4>
            <div className="space-y-2 grid md:grid-cols-2">
              {competitors.map((competitor, index) => (
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
      </div>
      <Console className="absolute bottom-0" />
    </motion.div>
  );
}
