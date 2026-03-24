"use client";

import ContextSideBar from "@/components/side-bars/context";
import {
  MainSidebar,
  SidebarProvider,
  useSidebar,
} from "@/components/side-bars/main";
import { AppHeader } from "@/components/app-header";
import { Spinner } from "@/components/ui/spinner";
import { Suspense } from "react";

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

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full w-full flex">
      <MainSidebar />
      <div className="flex-1 h-full">{children}</div>
      <div className="hidden lg:block h-full">
        <ContextSideBar />
      </div>
    </div>
  );
}

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <MobileLayout>
        <Suspense
          fallback={
            <Shell>
              <div className="h-full w-full flex items-center justify-center">
                <Spinner />
              </div>
            </Shell>
          }
        >
          <Shell>{children}</Shell>
        </Suspense>
      </MobileLayout>
    </SidebarProvider>
  );
}
