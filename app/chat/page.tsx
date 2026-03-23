"use client";

import ChatView from "@/components/chat-view";
import ContextSideBar from "@/components/side-bars/context";
import {
  MainSidebar,
  SidebarProvider,
  useSidebar,
} from "@/components/side-bars/main";
import { AppHeader } from "@/components/app-header";
import { Spinner } from "@/components/ui/spinner";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ChatContent() {
  const searchParams = useSearchParams();
  const activeChatId = searchParams.get("chat");

  return (
    <div className="h-screen w-screen flex">
      <MainSidebar />
      <div className="flex-1 transition-all duration-300 ease-in-out">
        <ChatView chatId={activeChatId} />
      </div>
      <div className="hidden lg:block h-full">
        <ContextSideBar />
      </div>
    </div>
  );
}

function MobileLayout({ children }: { children: React.ReactNode }) {
  const { setIsMobileOpen } = useSidebar();

  return (
    <>
      <AppHeader onToggleSidebar={() => setIsMobileOpen(true)} />
      <div className="pt-14 md:pt-0">{children}</div>
    </>
  );
}

export default function Page() {
  return (
    <SidebarProvider>
      <MobileLayout>
        <Suspense
          fallback={
            <div className="h-screen w-screen flex items-center justify-center">
              <Spinner />
            </div>
          }
        >
          <ChatContent />
        </Suspense>
      </MobileLayout>
    </SidebarProvider>
  );
}
