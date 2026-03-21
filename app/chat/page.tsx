"use client";

import { useApp } from "@/components/app-provider";
import Console from "@/components/console";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, ChevronLeft, ExternalLink } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

export default function Page() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="h-screen w-screen flex text-start justify-between">
      <div className="flex-3 flex flex-col relative">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute top-4 right-0 z-10 flex items-center gap-1 px-2 py-1 bg-neutral-100 rounded-l-md border-r-0 rounded-r-0 border text-xs font-mono text-neutral-600 hover:bg-neutral-200 transition-colors"
        >
          <motion.span
            animate={{ rotate: !isSidebarOpen ? 0 : 180 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronLeft className="size-4" />
          </motion.span>
          <span>Summary</span>
        </button>

        <div className="flex-1 flex items-center justify-center">
          <p className="text-accent-foreground">Coming soon...</p>
        </div>
        <form
          onSubmit={(evt) => evt.preventDefault()}
          className="flex border-t p-5 h-20.25 gap-2 bg-neutral-100"
        >
          <Input
            placeholder="Ask a question..."
            className="p-5 bg-white rounded-full"
          />
          <Button size="icon-lg" className="rounded-full">
            <ArrowRight />
          </Button>
        </form>
      </div>

      <AnimatePresence initial={false}>
        {isSidebarOpen && <RightSideBar />}
      </AnimatePresence>
    </div>
  );
}

function RightSideBar() {
  const { scrapedWebsiteData } = useApp();
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ type: "tween", duration: 0.2 }}
      className="flex-1 border-l p-5 relative"
    >
      <div className="space-y-3">
        <Avatar>
          <AvatarImage src={scrapedWebsiteData.metadata?.favicon || ""} />
          <AvatarFallback>SC</AvatarFallback>
        </Avatar>
        <h3 className="text-xl font-medium">
          {scrapedWebsiteData.metadata?.title}
        </h3>
        <p className="text-accent-foreground">
          {scrapedWebsiteData.llmSummary?.goal}
        </p>
        <div className="max-h-150 overflow-y-scroll">
          <p>{scrapedWebsiteData.llmSummary?.full}</p>
        </div>
        {scrapedWebsiteData.competitors.length > 0 && (
          <div className="mt-6 space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">
              Competitors
            </h4>
            <div className="space-y-2 grid md:grid-cols-2">
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
      </div>
      <Console className="absolute bottom-0" />
    </motion.div>
  );
}
