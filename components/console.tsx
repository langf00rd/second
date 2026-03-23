"use client";

import { PROCESS_STATUS_DESCRIPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useApp } from "./app-provider";

export default function Console(props: { className?: string }) {
  const { statusTrail } = useApp();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [statusTrail]);

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [isOpen]);

  // if (statusTrail.length < 1) return null;

  return (
    <div
      className={cn("fixed bottom-0 left-0 w-full border-t", props.className)}
    >
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -top-6 right-4 flex items-center gap-1 px-2 py-1 bg-neutral-100 rounded-t-md border text-xs font-mono text-neutral-600 hover:bg-neutral-200 transition-colors"
      >
        <motion.span
          animate={{ rotate: isOpen ? 0 : 180 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="size-4" />
        </motion.span>
        <span>Console</span>
      </motion.button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "80px", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            // className="overflow-hidden border-t h-20 bg-neutral-100"
          >
            <div className="absolute inset-x-0 top-0 h-8 bg-linear-to-b from-neutral-100 to-transparent pointer-events-none z-10" />
            <div
              ref={scrollRef}
              className="h-full overflow-y-auto flex flex-col p-5"
            >
              {statusTrail.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "tween" }}
                  className="flex font-mono text-sm items-center max-w-150 mx-auto w-full"
                  style={{
                    color:
                      s.status === "error" ? "var(--destructive)" : undefined,
                  }}
                >
                  <ChevronRight className="opacity-50" strokeWidth={1} />
                  {PROCESS_STATUS_DESCRIPTIONS[s.status]}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
