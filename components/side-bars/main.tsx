"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getCurrentUser, signOut } from "@/lib/auth";
import type { Chat } from "@/lib/supabase/db";
import { createChat, getUserChats } from "@/lib/supabase/db";
import { Gift, LogOut, PlusIcon } from "lucide-react";
import { motion } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";

export function MainSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeChatId = searchParams.get("chat");

  const [user, setUser] = useState<{
    id: string;
    email?: string;
    user_metadata: {
      name?: string;
      avatar_url?: string;
      given_name?: string;
      family_name?: string;
    };
  } | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const currentUser = await getCurrentUser();
      setUser(currentUser as typeof user);

      if (currentUser) {
        const userChats = await getUserChats(currentUser.id);
        setChats(userChats);
        setIsLoading(false);
      }
    }
    init();
  }, []);

  console.log("user?.user_metadata", user?.user_metadata);

  const displayName =
    user?.user_metadata?.name ||
    [user?.user_metadata?.given_name, user?.user_metadata?.family_name]
      .filter(Boolean)
      .join(" ") ||
    user?.email?.split("@")[0] ||
    "User";

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  async function handleLogout() {
    await signOut();
    window.location.href = "/sign-in";
  }

  async function handleNewChat() {
    if (!user) return;

    const defaultTitle = `Chat ${new Date().toLocaleDateString()}`;
    const newChat = await createChat(user.id, defaultTitle);

    if (newChat) {
      setChats((prev) => [newChat, ...prev]);
      router.push(`/chat?chat=${newChat.id}`);
    }
  }

  function handleChatClick(chatId: string) {
    router.push(`/chat?chat=${chatId}`);
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ type: "tween", duration: 0.2 }}
      className="flex-[0.8] border-r relative flex flex-col justify-between bg-[#F9F9F9]"
    >
      <div>
        {/*<div className="flex items-center px-5 py-3 justify-between">
          <Button variant="outline" onClick={handleNewChat}>
            <PlusIcon className="opacity-50" />
            New chat
          </Button>
        </div>*/}
        <div className="p-5 space-y-8">
          <Button variant="outline" onClick={handleNewChat}>
            <PlusIcon className="opacity-50" />
            New chat
          </Button>
          <h1 className="text-accent-foreground mb-1">Your chats</h1>
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : chats.length === 0 ? (
            <p className="text-sm text-muted-foreground">No chats yet</p>
          ) : (
            <ul>
              {chats.map((chat) => (
                <li
                  role="button"
                  key={chat.id}
                  onClick={() => handleChatClick(chat.id)}
                  className={`p-2 cursor-pointer hover:text-primary ${
                    activeChatId === chat.id
                      ? "bg-neutral-200/40 rounded-xl"
                      : ""
                  }`}
                >
                  <p className="text-ellipsis line-clamp-1">{chat.title}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="flex items-center border-t px-5 h-20 justify-between">
        <Popover>
          <PopoverTrigger className="flex items-center gap-5 cursor-pointer">
            <Avatar>
              <AvatarImage src={user?.user_metadata?.avatar_url || undefined} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col justify-start items-start">
              <p>{displayName}</p>
              <p className="text-accent-foreground -mt-1">Free</p>
            </div>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-56">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              Log out
            </Button>
          </PopoverContent>
        </Popover>
        <Button variant="outline" className="rounded-full text-primary">
          <Gift />
          Go Pro
        </Button>
      </div>
    </motion.div>
  );
}
