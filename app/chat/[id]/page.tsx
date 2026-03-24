"use client";

import { useParams } from "next/navigation";
import ChatView from "@/components/chat-view";

export default function ChatIdPage() {
  const params = useParams();
  const chatId = params.id as string | undefined;

  return <ChatView chatId={chatId} />;
}
