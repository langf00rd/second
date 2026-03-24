"use client";

import { getCurrentUser } from "@/lib/auth";
import { createChat, deleteChat } from "@/lib/supabase/db";
import { cn } from "@/lib/utils";
import { Menu, MoreHorizontal, PlusIcon, Trash2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useSidebar } from "./side-bars/main";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

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
  const pathname = usePathname();
  const { setChats } = useSidebar();

  const [user, setUser] = useState<{
    id: string;
  } | null>(null);

  const activeChatId = pathname.startsWith("/chat/")
    ? pathname.split("/")[2]
    : undefined;

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleNewChat = async () => {
    const currentUser = user || (await getCurrentUser());
    if (!currentUser) return;
    setUser(currentUser as typeof user);

    const defaultTitle = `Chat ${new Date().toLocaleDateString()}`;
    const newChat = await createChat(currentUser.id, defaultTitle);
    if (newChat) {
      router.push(`/chat/${newChat.id}`);
    }
  };

  const handleDeleteChat = async () => {
    if (!activeChatId) return;

    const success = await deleteChat(activeChatId);
    if (success) {
      setChats((prev) => prev.filter((c) => c.id !== activeChatId));
      router.push("/chat");
    }
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 border-b bg-white z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
            <Menu size={20} />
          </Button>
          <LLMLogo size={28} />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleNewChat}>
            <PlusIcon className="opacity-50" size={16} />
            <span>New chat</span>
          </Button>
          {activeChatId && (
            <DropdownMenu>
              <DropdownMenuTrigger className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                <MoreHorizontal size={20} />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  className="text-destructive flex cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete chat
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>

      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => setDeleteDialogOpen(open)}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete chat</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this chat? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteChat}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
