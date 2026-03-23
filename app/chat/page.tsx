"use client";

import ChatView from "@/components/chat-view";
import ContextSideBar from "@/components/side-bars/context";
import {
  MainSidebar,
  SidebarProvider,
  useSidebar,
} from "@/components/side-bars/main";
import { Spinner } from "@/components/ui/spinner";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ChatContent() {
  const { isCollapsed } = useSidebar();
  const searchParams = useSearchParams();
  const activeChatId = searchParams.get("chat");

  return (
    <div className="h-screen w-screen flex">
      <MainSidebar />
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isCollapsed ? "max-w-full" : ""
        }`}
      >
        <ChatView chatId={activeChatId} />
      </div>
      <ContextSideBar />
    </div>
  );
}

export default function Page() {
  return (
    <SidebarProvider>
      <Suspense
        fallback={
          <div className="h-screen w-screen flex items-center justify-center">
            <Spinner />
          </div>
        }
      >
        <ChatContent />
      </Suspense>
    </SidebarProvider>
  );
}
