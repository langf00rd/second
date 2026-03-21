"use client";

import { setWebsiteSummaryCookie } from "@/app/actions/chat";
import { useApp } from "@/components/app-provider";
import Console from "@/components/console";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isTextUIPart, type UIMessage } from "ai";
import { ChevronLeft, ExternalLink, Loader2, Send } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

function extractTextContent(message: UIMessage): string {
  if (!message.parts || !Array.isArray(message.parts)) {
    return "";
  }
  return message.parts
    .filter((part) => isTextUIPart(part))
    .map((part) => part.text)
    .join("");
}

export default function Page() {
  const { scrapedWebsiteData } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const websiteSummary = scrapedWebsiteData.llmSummary;

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  useEffect(() => {
    if (websiteSummary) {
      setWebsiteSummaryCookie(websiteSummary);
    }
  }, [websiteSummary]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, status, scrollToBottom]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const text = inputValue.trim();
      if (!text) return;

      setInputValue("");

      await sendMessage({
        role: "user",
        parts: [{ type: "text" as const, text }],
      });
    },
    [inputValue, sendMessage],
  );

  return (
    <div className="h-screen w-screen flex text-start justify-between">
      <div className="flex-3 flex flex-col relative flex-1">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute top-4 right-0 z-10 flex items-center gap-1 px-2 py-1 bg-neutral-100 rounded-l-md border-r-0 border text-xs font-mono text-neutral-600 hover:bg-neutral-200 transition-colors"
        >
          <motion.span
            animate={{ rotate: !isSidebarOpen ? 0 : 180 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronLeft className="size-4" />
          </motion.span>
          <span>Summary</span>
        </button>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            {messages.length === 0 && (
              <div className="text-center py-12 space-y-4">
                <h2 className="text-2xl font-semibold">
                  Business Growth Advisor
                </h2>
                <p className="text-muted-foreground">
                  Ask me anything about growing your business, customer
                  acquisition, pricing, or competitive positioning.
                </p>
              </div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((message: UIMessage) => {
                const text = extractTextContent(message);
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <Avatar className="size-8 shrink-0">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          AI
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{text}</p>
                    </div>
                    {message.role === "user" && (
                      <Avatar className="size-8 shrink-0">
                        <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                          U
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {(status === "streaming" || status === "submitted") && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 justify-start"
              >
                <Avatar className="size-8 shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    AI
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-2xl px-4 py-3">
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                </div>
              </motion.div>
            )}

            {error && (
              <div className="bg-destructive/10 text-destructive rounded-lg px-4 py-3 text-sm">
                {error.message}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex border-t p-5 h-20 gap-2 bg-neutral-100"
        >
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about growing your business..."
            className="p-5 bg-white rounded-full"
            disabled={status === "submitted"}
          />
          <Button
            type="submit"
            size="icon-lg"
            className="rounded-full"
            disabled={status === "submitted" || !inputValue.trim()}
          >
            {status === "submitted" ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Send />
            )}
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
      <Console />
    </motion.div>
  );
}
