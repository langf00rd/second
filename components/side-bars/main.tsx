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
import { usePathname, useRouter } from "next/navigation";
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
  isMobileOpen: boolean;
  setIsMobileOpen: (value: boolean) => void;
  chats: Chat[];
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  user: {
    id: string;
    email?: string;
    user_metadata: {
      name?: string;
      avatar_url?: string;
      given_name?: string;
      family_name?: string;
    };
  } | null;
  setUser: React.Dispatch<
    React.SetStateAction<{
      id: string;
      email?: string;
      user_metadata: {
        name?: string;
        avatar_url?: string;
        given_name?: string;
        family_name?: string;
      };
    } | null>
  >;
  isLoadingChats: boolean;
}

const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
  setIsCollapsed: () => {},
  isMobileOpen: false,
  setIsMobileOpen: () => {},
  chats: [],
  setChats: () => {},
  user: null,
  setUser: () => {},
  isLoadingChats: true,
});

export function useSidebar() {
  return useContext(SidebarContext);
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
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

  useEffect(() => {
    async function init() {
      const currentUser = await getCurrentUser();
      setUser(currentUser as typeof user);

      if (currentUser) {
        const userChats = await getUserChats(currentUser.id);
        setChats(userChats);
        setIsLoadingChats(false);
      }
    }
    init();
  }, []);

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        setIsCollapsed,
        isMobileOpen,
        setIsMobileOpen,
        chats,
        setChats,
        user,
        setUser,
        isLoadingChats,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function MainSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    isCollapsed,
    setIsCollapsed,
    isMobileOpen,
    setIsMobileOpen,
    chats,
    setChats,
    user,
    isLoadingChats,
  } = useSidebar();

  const activeChatId = pathname.startsWith("/chat/")
    ? pathname.split("/")[2]
    : undefined;

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
      setIsMobileOpen(false);
      router.push(`/chat/${newChat.id}`);
    }
  }

  function handleChatClick(chatId: string) {
    setIsMobileOpen(false);
    router.push(`/chat/${chatId}`);
  }

  const sidebarContent = (
    <div className="h-full w-[300px] bg-[#F9F9F9] flex flex-col">
      <div className="flex items-center px-5 py-3 justify-between shrink-0">
        <Button variant="outline" onClick={handleNewChat}>
          <PlusIcon className="opacity-50" />
          New chat
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(true)}
          className="hidden md:flex"
        >
          <PanelRight size={20} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden"
        >
          <PanelLeftClose size={20} />
        </Button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col px-5">
        <h1 className="text-accent-foreground mb-2 shrink-0">Your chats</h1>
        <div className="flex-1 overflow-y-auto">
          {isLoadingChats ? (
            <div className="text-sm py-2 text-muted-foreground">
              <Spinner className="mx-auto" />
            </div>
          ) : chats.length === 0 ? (
            <p className="text-sm text-muted-foreground">No chats yet</p>
          ) : (
            <ul className="space-y-1">
              {chats.map((chat) => (
                <li
                  role="button"
                  key={chat.id}
                  onClick={() => handleChatClick(chat.id)}
                  className={`p-2 cursor-pointer hover:text-primary transition-colors rounded-lg ${
                    activeChatId === chat.id
                      ? "bg-neutral-200/40 font-medium text-foreground"
                      : "text-neutral-600"
                  }`}
                >
                  <p className="text-ellipsis line-clamp-1">{chat.title}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="flex items-center border-t px-5 py-3 shrink-0">
        <Popover>
          <PopoverTrigger className="flex items-center gap-3 cursor-pointer">
            <Avatar>
              <AvatarImage src={user?.user_metadata?.avatar_url || undefined} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col justify-start items-start">
              <p className="text-sm">{displayName}</p>
              <p className="text-xs text-accent-foreground">Free</p>
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
        <Button variant="outline" className="rounded-full text-primary ml-auto">
          <Gift />
          Go Pro
        </Button>
      </div>
    </div>
  );

  if (isCollapsed) {
    return (
      <div className="hidden md:flex h-full w-[60px] border-r bg-[#F9F9F9] flex flex-col items-center justify-between py-4 transition-all duration-300 ease-in-out">
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
    <>
      <div className="hidden md:block h-full md:border-r transition-all duration-300 ease-in-out">
        {sidebarContent}
      </div>

      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative z-10 border-r shadow-xl animate-in slide-in-from-left duration-300">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
