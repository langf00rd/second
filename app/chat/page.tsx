"use client";

import ChatView from "@/components/chat-view";
import ContextSideBar from "@/components/side-bars/context";
import { MainSidebar } from "@/components/side-bars/main";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ChatContent() {
  const searchParams = useSearchParams();
  const activeChatId = searchParams.get("chat");

  return (
    <div className="h-screen w-screen flex text-start justify-between">
      <MainSidebar />
      <ChatView chatId={activeChatId} />
      <ContextSideBar />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
