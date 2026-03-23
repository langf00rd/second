"use client";

import { setWebsiteSummaryCookie } from "@/app/actions/chat";
import { useApp } from "@/components/app-provider";
import ChatInterface from "@/components/chat-view";
import ContextSideBar from "@/components/side-bars/context";
import { MainSidebar } from "@/components/side-bars/main";
import {
  addChatMessage,
  getChatMessages,
  updateChatTitle,
} from "@/lib/supabase/db";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isTextUIPart, type UIMessage } from "ai";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";

function extractTextContent(message: UIMessage): string {
  if (!message.parts || !Array.isArray(message.parts)) {
    return "";
  }
  return message.parts
    .filter((part) => isTextUIPart(part))
    .map((part) => part.text)
    .join("");
}

function ChatContent() {
  const { scrapedWebsiteData } = useApp();
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastLoadedChatRef = useRef<string | null>(null);
  const searchParams = useSearchParams();
  const activeChatId = searchParams.get("chat");

  const websiteSummary = scrapedWebsiteData.llmSummary;

  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  useEffect(() => {
    if (websiteSummary) {
      setWebsiteSummaryCookie(websiteSummary);
    }
  }, [websiteSummary]);

  useEffect(() => {
    async function loadChat() {
      if (!activeChatId) return;
      if (lastLoadedChatRef.current === activeChatId) return;

      lastLoadedChatRef.current = activeChatId;

      const chatMessages = await getChatMessages(activeChatId);

      if (chatMessages.length > 0) {
        const loadedMessages: UIMessage[] = chatMessages.map((msg) => ({
          id: msg.id,
          role: msg.role as "user" | "assistant" | "system",
          parts: [{ type: "text" as const, text: msg.content }],
          createdAt: new Date(msg.created_at),
        }));
        setMessages(loadedMessages);
      }
    }

    loadChat();
  }, [activeChatId, setMessages]);

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

      if (activeChatId) {
        await addChatMessage(activeChatId, "user", text);
      }

      await sendMessage({
        role: "user",
        parts: [{ type: "text" as const, text }],
      });
    },
    [inputValue, sendMessage, activeChatId],
  );

  useEffect(() => {
    async function saveAssistantMessage() {
      if (!activeChatId || status !== "ready") return;

      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.role === "assistant") {
        const content = extractTextContent(lastMessage);
        if (content) {
          await addChatMessage(activeChatId, "assistant", content);
        }
      }
    }

    saveAssistantMessage();
  }, [messages, status, activeChatId]);

  useEffect(() => {
    async function updateChatWithFirstMessage() {
      if (!activeChatId || messages.length !== 1) return;
      if (messages[0].role !== "user") return;

      const firstUserMessage = extractTextContent(messages[0]);
      if (firstUserMessage) {
        const title =
          firstUserMessage.length > 50
            ? firstUserMessage.slice(0, 47) + "..."
            : firstUserMessage;
        await updateChatTitle(activeChatId, title);
      }
    }

    updateChatWithFirstMessage();
  }, [activeChatId, messages]);

  return (
    <div className="h-screen w-screen flex text-start justify-between">
      <MainSidebar />

      <ChatInterface />

      {/*<div className="flex flex-col relative flex-3">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            {messages.length === 0 && (
              <div className="text-center py-12 space-y-4">
                <p className="text-muted-foreground">
                  <Balancer>
                    Ask me anything about growing your business, customer
                    acquisition, pricing, or competitive positioning.
                  </Balancer>
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
      </div>*/}

      <ContextSideBar />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
