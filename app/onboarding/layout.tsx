"use client";

import { useApp } from "@/components/app-provider";
import { PROCESS_STATUS_DESCRIPTIONS } from "@/lib/constants";
import { ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const { statusTrail } = useApp();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [statusTrail]);

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 10 }}
        transition={{ type: "tween" }}
        className="w-100"
      >
        {children}
      </motion.div>
      {statusTrail.length >= 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "tween" }}
          className="fixed bottom-0 left-0 w-full h-40 border-t bg-neutral-100"
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
                className="flex font-mono text-sm items-center max-w-100 mx-auto w-full"
              >
                <ChevronRight className="opacity-50" strokeWidth={1} />
                {PROCESS_STATUS_DESCRIPTIONS[s.status]}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
