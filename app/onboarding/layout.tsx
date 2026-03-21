"use client";

import { motion } from "motion/react";
import { usePathname } from "next/navigation";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
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
    </div>
  );
}
