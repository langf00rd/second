import { getChat } from "@/lib/supabase/db";
import ChatViewWrapper from "@/components/chat-view-wrapper";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const chat = await getChat(id);

  return {
    title: chat?.title || "New Chat",
  };
}

export default async function ChatIdPage({ params }: PageProps) {
  const { id } = await params;
  return <ChatViewWrapper chatId={id} />;
}
