"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  addChatMessage,
  getChatMessages,
  updateChatTitle,
} from "@/lib/supabase/db";
import { cn } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isTextUIPart, type UIMessage } from "ai";
import {
  ArrowRight,
  Copy,
  Loader2,
  MoreHorizontal,
  RotateCcw,
  Share,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

interface ChatViewProps {
  chatId?: string | null;
  chatTitle?: string;
}

function extractTextContent(message: UIMessage): string {
  if (!message.parts || !Array.isArray(message.parts)) {
    return "";
  }
  return message.parts
    .filter((part) => isTextUIPart(part))
    .map((part) => part.text)
    .join("");
}

const LLMLogo = ({
  size = 28,
  className,
}: {
  size?: number;
  className?: string;
}) => (
  <div
    className={cn(
      "rounded-full bg-black text-white flex items-center justify-center shrink-0",
      className,
    )}
    style={{ width: size, height: size }}
  >
    /
  </div>
);

const TypingDots = () => (
  <div className="flex gap-1 items-center py-1">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce"
        style={{ animationDelay: `${i * 0.15}s` }}
      />
    ))}
  </div>
);

const MessageActions = () => (
  <div className="flex gap-0.5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
    {[ThumbsUp, ThumbsDown, Copy, RotateCcw, Share, MoreHorizontal].map(
      (Icon, i) => (
        <button
          key={i}
          className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
        >
          <Icon size={14} />
        </button>
      ),
    )}
  </div>
);

function RenderContent({ text }: { text: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => (
          <p className="my-2 text-[15px] leading-7 text-neutral-800">{children}</p>
        ),
        h1: ({ children }) => (
          <h1 className="text-2xl font-bold mt-6 mb-3 text-neutral-900">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-xl font-semibold mt-5 mb-2 text-neutral-900">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-base font-semibold mt-4 mb-1.5 text-neutral-900">{children}</h3>
        ),
        h4: ({ children }) => (
          <h4 className="text-sm font-semibold mt-3 mb-1 text-neutral-900">{children}</h4>
        ),
        ul: ({ children }) => (
          <ul className="list-disc pl-5 my-2 space-y-1.5">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal pl-5 my-2 space-y-1.5">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="text-[15px] leading-7 text-neutral-800">{children}</li>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-neutral-300 pl-4 py-1 my-3 text-[15px] leading-7 text-neutral-600 italic bg-neutral-50 rounded-r-md">
            {children}
          </blockquote>
        ),
        code: ({ className, children }) => {
          const isInline = !className;
          if (isInline) {
            return (
              <code className="bg-neutral-100 text-neutral-800 rounded px-1.5 py-0.5 text-[13px] font-mono">
                {children}
              </code>
            );
          }
          return (
            <pre className="bg-neutral-900 text-neutral-100 rounded-lg p-4 my-3 text-[13px] font-mono overflow-x-auto leading-relaxed">
              <code>{children}</code>
            </pre>
          );
        },
        a: ({ href, children }) => (
          <a
            href={href}
            className="text-blue-600 hover:text-blue-700 underline underline-offset-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
        hr: () => <hr className="border-neutral-200 my-5" />,
        strong: ({ children }) => (
          <strong className="font-semibold text-neutral-900">{children}</strong>
        ),
        em: ({ children }) => <em className="italic">{children}</em>,
        table: ({ children }) => (
          <div className="overflow-x-auto my-3">
            <table className="min-w-full text-sm border-collapse border border-neutral-200 rounded-lg overflow-hidden">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => <thead className="bg-neutral-50">{children}</thead>,
        th: ({ children }) => (
          <th className="border border-neutral-200 px-3 py-2 text-left font-semibold text-neutral-900">{children}</th>
        ),
        td: ({ children }) => (
          <td className="border border-neutral-200 px-3 py-2 text-neutral-700">{children}</td>
        ),
      }}
    >
      {text}
    </ReactMarkdown>
  );
}

export default function ChatView({ chatId }: ChatViewProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastLoadedChatRef = useRef<string | null>(null);

  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  useEffect(() => {
    async function loadChat() {
      if (!chatId) return;
      if (lastLoadedChatRef.current === chatId) return;

      lastLoadedChatRef.current = chatId;

      const chatMessages = await getChatMessages(chatId);

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
  }, [chatId, setMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
  }, [input]);

  useEffect(() => {
    async function saveAssistantMessage() {
      if (!chatId || status !== "ready") return;

      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.role === "assistant") {
        const content = extractTextContent(lastMessage);
        if (content) {
          await addChatMessage(chatId, "assistant", content);
        }
      }
    }

    saveAssistantMessage();
  }, [messages, status, chatId]);

  useEffect(() => {
    async function updateChatWithFirstMessage() {
      if (!chatId || messages.length !== 1) return;
      if (messages[0].role !== "user") return;

      const firstUserMessage = extractTextContent(messages[0]);
      if (firstUserMessage) {
        const title =
          firstUserMessage.length > 50
            ? firstUserMessage.slice(0, 47) + "..."
            : firstUserMessage;
        await updateChatTitle(chatId, title);
      }
    }

    updateChatWithFirstMessage();
  }, [chatId, messages]);

  const handleSubmit = useCallback(async () => {
    const text = input.trim();
    if (!text || status !== "ready") return;

    setInput("");

    if (chatId) {
      await addChatMessage(chatId, "user", text);
    }

    await sendMessage({
      role: "user",
      parts: [{ type: "text" as const, text }],
    });
  }, [input, status, chatId, sendMessage]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const canSubmit = input.trim().length > 0 && status === "ready";

  return (
    <div className="flex flex-col h-full w-full bg-white font-sans">
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-neutral-400">
            <span className="text-xl">How can I help you today?</span>
          </div>
        ) : (
          <div className="max-w-4xl text-[16px] mx-auto py-8 px-4 space-y-6">
            <AnimatePresence initial={false}>
              {messages.map((msg) => {
                const text = extractTextContent(msg);
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                    className={cn(
                      "flex",
                      msg.role === "user"
                        ? "justify-end"
                        : "justify-start gap-3",
                    )}
                  >
                    {msg.role === "assistant" && (
                      <LLMLogo className="relative top-2" size={28} />
                    )}

                    <div
                      className={cn(
                        msg.role === "assistant" && "group flex-1 min-w-0",
                      )}
                    >
                      {msg.role === "user" ? (
                        <div className="bg-[#f4f4f5] rounded-[18px] px-4 py-2.5 text-base leading-relaxed whitespace-pre-wrap">
                          {text}
                        </div>
                      ) : (
                        <>
                          {text ? (
                            <div className="leading-relaxed">
                              <RenderContent text={text} />
                            </div>
                          ) : (
                            <TypingDots />
                          )}
                          <MessageActions />
                        </>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {(status === "streaming" || status === "submitted") && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start gap-3"
              >
                <LLMLogo size={28} />
                <div className="bg-[#f4f4f5] rounded-[18px] px-4 py-3">
                  <Loader2 className="size-4 animate-spin text-neutral-400" />
                </div>
              </motion.div>
            )}

            {error && (
              <div className="bg-red-50 text-red-600 rounded-lg px-4 py-3 text-sm">
                {error.message}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="max-w-4xl text-[16px] w-full mx-auto px-4 md:pb-5 -mb-10 md:-mb-0 shrink-0">
        <div className="flex items-end gap-2 ring-1 ring-foreground/10 shadow-[0_0.25rem_1.25rem_hsl(0_0%_0%/3.5%),0_0_0_0.5px_hsla(30_3.3%_11.8%/15%)] rounded-[30px] px-4 py-3">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask anything"
            rows={1}
            disabled={status === "submitted"}
            style={{
              fontSize: "15px",
            }}
            className="flex-1 disabled:bg-transparent border-0 placeholder:text-[15px] relative -top-[2px] resize-none bg-transparent shadow-none p-0 leading-relaxed focus-visible:ring-0 min-h-0 max-h-[200px] placeholder:text-neutral-400"
          />
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            size="icon"
            className={cn(
              "size-8 shrink-0 rounded-full transition-colors",
              canSubmit
                ? "bg-black hover:bg-neutral-800 text-white"
                : "bg-neutral-300 text-neutral-400 cursor-not-allowed hover:bg-neutral-300",
            )}
          >
            {status === "submitted" ? (
              <Loader2 className="animate-spin size-3" />
            ) : (
              <ArrowRight size={14} />
            )}
          </Button>
        </div>
        <p className="text-center text-sm text-neutral-400 mt-2">
          LLMs can make mistakes. Check important info.
        </p>
      </div>
    </div>
  );
}
