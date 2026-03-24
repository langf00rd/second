"use client";

import { ArrowRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";

type Message = {
  id: number;
  role: "user" | "ai";
  content: string;
};

const prompts = [
  {
    user: "How can a startup grow quickly in a competitive market?",
    ai: `Rapid growth in a competitive market requires leverage, not just effort. Focus on distribution first, not product perfection. Identify one high-conversion channel (e.g. paid ads, partnerships, or content) and go deep rather than wide.

Second, build a feedback loop: ship fast, collect data, iterate faster than competitors. Speed is your unfair advantage early on.

Third, narrow your ICP (ideal customer profile). Trying to serve everyone kills growth. Dominate a niche, then expand.

Finally, design for retention early. Growth without retention is a leaky bucket. If users don’t stick, acquisition becomes exponentially expensive.`,
  },
  {
    user: "What are the biggest mistakes founders make when scaling?",
    ai: `The biggest mistake is premature scaling—adding headcount, processes, and complexity before product-market fit is solid.

Another is founder bottlenecking. If every decision routes through you, growth stalls. You need systems, not heroics.

Many also ignore unit economics. Growth that loses money per customer is not growth—it’s delayed failure.

Finally, culture erosion. Early hires define trajectory. One wrong senior hire can slow execution dramatically.`,
  },
  {
    user: "How do you build a sustainable competitive advantage?",
    ai: `Sustainable advantage comes from compounding systems, not one-time tactics.

Data is a strong moat. The more users interact with your system, the better it becomes (think recommendation engines, personalization).

Brand is another—if users trust you, acquisition cost drops and retention increases.

Switching costs matter too. If leaving your product is painful (due to integrations, workflows, or data lock-in), competitors struggle to displace you.

Finally, network effects—where each additional user increases value for others—are the strongest defensible advantage, but also the hardest to build.`,
  },
];

const TYPING_SPEED = 18; // ms per char
const AI_TYPING_SPEED = 12;
const THINKING_DELAY = 800;
const BETWEEN_MESSAGES_DELAY = 1200;

export default function ChatSimulation() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");

  const messageIdRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  const typeText = useCallback(
    async (text: string, role: "user" | "ai", speed: number) => {
      let current = "";
      const id = messageIdRef.current++;

      setMessages((prev) => [...prev, { id, role, content: "" }]);

      for (let i = 0; i < text.length; i++) {
        current += text[i];

        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, content: current } : m)),
        );

        await sleep(speed);
      }
    },
    [],
  );

  useEffect(() => {
    let running = true;

    const runSimulation = async () => {
      while (running) {
        for (const pair of prompts) {
          if (!running) break;

          setInputValue("");
          for (let i = 0; i < pair.user.length; i++) {
            if (!running) break;
            setInputValue(pair.user.slice(0, i + 1));
            await sleep(TYPING_SPEED);
          }

          if (!running) break;
          await sleep(300);

          await typeText(pair.user, "user", 0);
          setInputValue("");

          if (!running) break;
          await sleep(THINKING_DELAY);

          await typeText(pair.ai, "ai", AI_TYPING_SPEED);

          if (!running) break;
          await sleep(BETWEEN_MESSAGES_DELAY);
          scrollToBottom();
        }

        if (!running) break;
        await sleep(1500);
        setMessages([]);
      }
    };

    runSimulation();

    return () => {
      running = false;
    };
  }, [typeText]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div
      className="w-full px-5 md:px-32 pb-4 mt-10 border bg-primary rounded-md"
      style={{
        background: "url(/noise.png)",
        backgroundSize: "441px",
      }}
    >
      <div className="w-full max-w-[700px] mx-auto">
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto hide-scroll p-4 space-y-4 h-[50vh] md:h-[600px]"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-white border text-gray-800"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="">
          <div className="flex gap-2 items-center">
            <input
              className="ring-1 ring-foreground/10 shadow-[0_0.25rem_1.25rem_hsl(0_0%_0%/3.5%),0_0_0_0.5px_hsla(30_3.3%_11.8%/15%)] rounded-[30px] px-4 py-3 flex-1 bg-white"
              // className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none"
              value={inputValue}
              readOnly
              placeholder="Type a message..."
            />
            <Button
              className="bg-black rounded-full hover:bg-neutral-800 text-white"
              size="icon-lg"
            >
              <ArrowRight size={14} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
