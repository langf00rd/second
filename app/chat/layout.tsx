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
import { usePathname } from "next/navigation";
import { Suspense } from "react";

function ChatContent() {
  const pathname = usePathname();
  const chatId = pathname.startsWith("/chat/") ? pathname.split("/")[2] : undefined;

  return (
    <div className="h-full w-full flex">
      <MainSidebar />
      <div className="flex-1 transition-all duration-300 ease-in-out h-full">
        <ChatView chatId={chatId} />
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
      <div className="h-[calc(100vh-3.5rem)] md:h-screen pt-14 md:pt-0">
        {children}
      </div>
    </>
  );
}

export default function ChatLayout() {
  return (
    <SidebarProvider>
      <MobileLayout>
        <Suspense
          fallback={
            <div className="h-full w-full flex items-center justify-center">
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
