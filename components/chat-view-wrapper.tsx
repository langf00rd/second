"use client";

import ChatView from "@/components/chat-view";

interface ChatViewWrapperProps {
  chatId: string;
}

export default function ChatViewWrapper({ chatId }: ChatViewWrapperProps) {
  return <ChatView chatId={chatId} />;
}
