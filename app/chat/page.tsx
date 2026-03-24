import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat",
};

export default function ChatPage() {
  return (
    <div className="h-full w-full flex items-center justify-center text-neutral-400">
      Select a chat or start a new one
    </div>
  );
}
