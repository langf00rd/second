"use client";

import { WebsiteMetadata } from "@/lib/types";
import { createContext, useContext, useState, type ReactNode } from "react";

interface AppState {
  websiteURL: string;
  setWebsiteURL: React.Dispatch<React.SetStateAction<string>>;
  scrapedWebsiteData: {
    metadata: WebsiteMetadata | null;
    data: string | null;
    llmSummary: { goal: string; full: string } | null;
  };
  setScrapedWebsiteData: React.Dispatch<
    React.SetStateAction<{
      metadata: WebsiteMetadata | null;
      data: string | null;
      llmSummary: { goal: string; full: string } | null;
    }>
  >;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [websiteURL, setWebsiteURL] = useState("");
  const [scrapedWebsiteData, setScrapedWebsiteData] = useState<{
    metadata: WebsiteMetadata | null;
    data: string | null;
    llmSummary: { goal: string; full: string } | null;
  }>({
    metadata: null,
    data: null,
    llmSummary: null,
  });

  return (
    <AppContext.Provider
      value={{
        websiteURL,
        setWebsiteURL,
        scrapedWebsiteData,
        setScrapedWebsiteData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
