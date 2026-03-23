"use client";

import { getCurrentUser } from "@/lib/auth";
import { createChat } from "@/lib/supabase/db";
import { Menu, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

function LLMLogo({
  size = 28,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
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
}

interface AppHeaderProps {
  onToggleSidebar: () => void;
}

export function AppHeader({ onToggleSidebar }: AppHeaderProps) {
  const router = useRouter();
  const [user, setUser] = useState<{
    id: string;
  } | null>(null);

  useEffect(() => {
    async function init() {
      const currentUser = await getCurrentUser();
      setUser(currentUser as { id: string } | null);
    }
    init();
  }, []);

  async function handleNewChat() {
    if (!user) return;
    const defaultTitle = `Chat ${new Date().toLocaleDateString()}`;
    const newChat = await createChat(user.id, defaultTitle);
    if (newChat) {
      router.push(`/chat?chat=${newChat.id}`);
    }
  }

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 h-14 border-b bg-white z-50 flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
          <Menu size={20} />
        </Button>
        <LLMLogo size={28} />
      </div>
      <Button variant="outline" size="sm" onClick={handleNewChat}>
        <PlusIcon className="opacity-50" size={16} />
        <span>New chat</span>
      </Button>
    </header>
  );
}
