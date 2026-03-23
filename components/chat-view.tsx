"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Copy,
  MoreHorizontal,
  RotateCcw,
  Share,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

type Status = "idle" | "submitted" | "streaming";

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

function InlineFormat({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**"))
          return (
            <strong key={i} className="font-semibold">
              {part.slice(2, -2)}
            </strong>
          );
        if (part.startsWith("`") && part.endsWith("`"))
          return (
            <code
              key={i}
              className="bg-neutral-100 rounded px-1 py-0.5 text-[0.85em] font-mono"
            >
              {part.slice(1, -1)}
            </code>
          );
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function RenderContent({ text }: { text: string }) {
  const lines = text.split("\n");
  const elements: JSX.Element[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    const headingMatch = line.match(/^(#{1,3})\s+(.+)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const cls =
        level === 1
          ? "text-lg font-semibold mt-4 mb-1"
          : level === 2
            ? "text-base font-semibold mt-4 mb-1"
            : "text-sm font-semibold mt-3 mb-1";
      elements.push(
        <p key={i} className={cls}>
          {headingMatch[2]}
        </p>,
      );
      i++;
      continue;
    }

    if (line.match(/^[-•]\s/)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^[-•]\s/)) {
        items.push(lines[i].replace(/^[-•]\s/, ""));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="list-disc pl-5 my-1.5 space-y-1">
          {items.map((item, j) => (
            <li key={j} className="leading-relaxed">
              <InlineFormat text={item} />
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    if (line.match(/^---+$/)) {
      elements.push(<hr key={i} className="border-neutral-200 my-4" />);
      i++;
      continue;
    }

    if (line.trim() === "") {
      i++;
      continue;
    }

    elements.push(
      <p key={i} className="leading-relaxed my-1">
        <InlineFormat text={line} />
      </p>,
    );
    i++;
  }

  return <>{elements}</>;
}

const MOCK_RESPONSE = `Yes—50,000 characters can be an issue, but not in the way most people think. The real constraints are:

## 1. Context window limits (hard constraint)

50k chars ≈ 12k–20k tokens depending on content density.

So:

- **Claude 3 Haiku** → usually fine (but tight depending on full prompt + output)
- **GPT-4o-mini** → fine
- Smaller/cheaper models → may truncate internally or degrade quality

Risk:

- silent truncation of important sections
- competitors buried in middle get missed

---

## 2. Signal dilution (actual bigger problem)

Even if it fits, performance drops because:

- nav bars
- cookie banners
- repeated footer links
- unrelated blog content

LLM attention becomes: "search noise instead of extraction"

You'll need both.`;

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
  }, [input]);

  const handleSubmit = async () => {
    if (!input.trim() || status !== "idle") return;

    const userMsg: Message = {
      id: `${Date.now()}`,
      role: "user",
      content: input.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setStatus("submitted");

    await new Promise((r) => setTimeout(r, 500));
    setStatus("streaming");

    const assistantId = `${Date.now() + 1}`;
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "" },
    ]);

    let acc = "";
    for (const char of MOCK_RESPONSE) {
      acc += char;
      const snapshot = acc;
      await new Promise((r) => setTimeout(r, 10));
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, content: snapshot } : m,
        ),
      );
    }

    setStatus("idle");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const canSubmit = input.trim().length > 0 && status === "idle";

  return (
    <div className="flex flex-col h-screen w-full flex-3 bg-white font-sans">
      {/* messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-neutral-400">
            <span>How can I help you today?</span>
          </div>
        ) : (
          <div className="max-w-4xl text-[16px] mx-auto py-8 px-4 space-y-6">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                  className={cn(
                    "flex",
                    msg.role === "user" ? "justify-end" : "justify-start gap-3",
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
                      <div className="bg-[#f4f4f4] rounded-[18px] px-4 py-2.5 max-w-[80%] leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </div>
                    ) : (
                      <>
                        {msg.content ? (
                          <div className="leading-relaxed">
                            <RenderContent text={msg.content} />
                          </div>
                        ) : (
                          <TypingDots />
                        )}
                        <MessageActions />
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {status === "submitted" && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start gap-3"
              >
                <LLMLogo size={28} />
                <TypingDots />
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="max-w-4xl text-[16px] w-full mx-auto px-4 pb-5">
        <div className="flex items-end gap-2 border shadow-sm rounded-xl px-4 py-3">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask anything"
            rows={1}
            disabled={status === "submitted"}
            className="flex-1 placeholder:text-base relative -top-1 border-0 resize-none bg-transparent shadow-none p-0 leading-relaxed focus-visible:ring-0 min-h-0 max-h-[200px] placeholder:text-neutral-400"
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
              <span className="size-2.5 rounded-sm bg-current" />
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
