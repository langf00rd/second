"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getCurrentUser, signOut } from "@/lib/auth";
import type { Chat } from "@/lib/supabase/db";
import { createChat, getUserChats } from "@/lib/supabase/db";
import { cn } from "@/lib/utils";
import {
  Gift,
  LogOut,
  PanelLeftClose,
  PanelRight,
  PlusIcon,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";

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

interface SidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
  setIsCollapsed: () => {},
});

export function useSidebar() {
  return useContext(SidebarContext);
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function MainSidebar() {
  const router = useRouter();
  const { isCollapsed, setIsCollapsed } = useSidebar();
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
      setUser(
        currentUser as {
          id: string;
          email?: string;
          user_metadata: {
            name?: string;
            avatar_url?: string;
            given_name?: string;
            family_name?: string;
          };
        },
      );

      if (currentUser) {
        const userChats = await getUserChats(currentUser.id);
        setChats(userChats);
        setIsLoading(false);
      }
    }
    init();
  }, []);

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

  if (isCollapsed) {
    return (
      <div className="h-full w-[60px] border-r bg-[#F9F9F9] flex flex-col items-center justify-between py-4 transition-all duration-300 ease-in-out">
        <div className="flex flex-col items-center gap-4">
          <LLMLogo size={32} />
          <Button variant="ghost" size="icon" onClick={handleNewChat}>
            <PlusIcon size={20} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsCollapsed(false)}
          >
            <PanelLeftClose size={20} />
          </Button>
        </div>
        <div className="flex flex-col pb-2 items-center gap-4">
          <Popover>
            <PopoverTrigger className="cursor-pointer">
              <Avatar>
                <AvatarImage
                  src={user?.user_metadata?.avatar_url || undefined}
                />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
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
        </div>
      </div>
    );
  }

  return (
    <div className="h-full max-w-[300px] flex-[0.8] border-r bg-[#F9F9F9] flex flex-col justify-between transition-all duration-300 ease-in-out">
      <div>
        <div className="flex items-center px-5 py-3 justify-between">
          <Button variant="outline" onClick={handleNewChat}>
            <PlusIcon className="opacity-50" />
            New chat
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(true)}
          >
            <PanelRight size={20} />
          </Button>
        </div>
        <div className="p-5 space-y-8">
          <h1 className="text-accent-foreground mb-1">Your chats</h1>
          {isLoading ? (
            <div className="text-sm py-2 text-muted-foreground">
              <Spinner className="mx-auto" />
            </div>
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
    </div>
  );
}
