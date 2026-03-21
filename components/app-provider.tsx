"use client";

import { Competitor } from "@/lib/services/llm/openrouter";
import { ProcessStatus, Question, WebsiteMetadata } from "@/lib/types";
import { createContext, useContext, useState, type ReactNode } from "react";

export type StatusEntry = {
  status: ProcessStatus;
  timestamp: number;
};

interface AppState {
  websiteURL: string;
  setWebsiteURL: React.Dispatch<React.SetStateAction<string>>;
  statusTrail: StatusEntry[];
  addStatus: (status: ProcessStatus) => void;
  clearTrail: () => void;
  questions: Question[];
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  scrapedWebsiteData: {
    metadata: WebsiteMetadata | null;
    data: string | null;
    llmSummary: { goal: string; full: string; industry: string } | null;
    competitorsContext: string | null;
    competitors: Competitor[];
  };
  setScrapedWebsiteData: React.Dispatch<
    React.SetStateAction<{
      metadata: WebsiteMetadata | null;
      data: string | null;
      llmSummary: { goal: string; full: string; industry: string } | null;
      competitorsContext: string | null;
      competitors: Competitor[];
    }>
  >;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [websiteURL, setWebsiteURL] = useState("");
  const [statusTrail, setStatusTrail] = useState<StatusEntry[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);

  const addStatus = (status: ProcessStatus) => {
    setStatusTrail((prev) => [...prev, { status, timestamp: Date.now() }]);
  };

  const clearTrail = () => {
    setStatusTrail([]);
  };

  const [scrapedWebsiteData, setScrapedWebsiteData] = useState<{
    metadata: WebsiteMetadata | null;
    data: string | null;
    llmSummary: { goal: string; full: string; industry: string } | null;
    competitorsContext: string | null;
    competitors: Competitor[];
  }>({
    metadata: null,
    data: null,
    llmSummary: null,
    competitorsContext: null,
    competitors: [],
  });

  return (
    <AppContext.Provider
      value={{
        websiteURL,
        setWebsiteURL,
        statusTrail,
        addStatus,
        clearTrail,
        questions,
        setQuestions,
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
