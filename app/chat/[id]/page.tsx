"use client";

import ChatView from "@/components/chat-view";
import { useParams } from "next/navigation";

export default function ChatIdPage() {
  const params = useParams();
  const chatId = params.id as string | undefined;
  return <ChatView chatId={chatId} />;
}
