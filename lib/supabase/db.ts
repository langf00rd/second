import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import type {
  InsertUser,
  InsertOrganization,
  UpdateOrganization,
  UpdateUser,
  User,
  Organization,
  Json,
  Chat,
  ChatMessage,
  InsertChat,
  InsertChatMessage,
} from "./types";
import type { WebsiteMetadata } from "@/lib/types";
import type { Competitor } from "@/lib/services/llm/openrouter";
import type { Question } from "@/lib/types";

export type { User, Organization, Chat, ChatMessage, Json };

export async function createUser(data: InsertUser): Promise<User | null> {
  const supabase = createSupabaseClient();
  const { data: user, error } = await supabase
    .from("users")
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error("Error creating user:", error);
    return null;
  }

  return user;
}

export async function getUser(id: string): Promise<User | null> {
  const supabase = createSupabaseClient();
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching user:", error);
    return null;
  }

  return user;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const supabase = createSupabaseClient();
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error) {
    console.error("Error fetching user by email:", error);
    return null;
  }

  return user;
}

export async function updateUser(
  id: string,
  data: UpdateUser,
): Promise<User | null> {
  const supabase = createSupabaseClient();
  const { data: user, error } = await supabase
    .from("users")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating user:", error);
    return null;
  }

  return user;
}

export async function createOrganization(
  data: InsertOrganization,
): Promise<Organization | null> {
  const supabase = createSupabaseClient();
  const { data: org, error } = await supabase
    .from("organizations")
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error("Error creating organization:", error);
    return null;
  }

  return org;
}

export async function getOrganization(
  id: string,
): Promise<Organization | null> {
  const supabase = createSupabaseClient();
  const { data: org, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching organization:", error);
    return null;
  }

  return org;
}

export async function getUserOrganizations(
  userId: string,
): Promise<Organization[]> {
  const supabase = createSupabaseClient();
  const { data: orgs, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user organizations:", error);
    return [];
  }

  return orgs || [];
}

export async function updateOrganization(
  id: string,
  data: UpdateOrganization,
): Promise<Organization | null> {
  const supabase = createSupabaseClient();
  const { data: org, error } = await supabase
    .from("organizations")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating organization:", error);
    return null;
  }

  return org;
}

export async function deleteOrganization(id: string): Promise<boolean> {
  const supabase = createSupabaseClient();
  const { error } = await supabase
    .from("organizations")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting organization:", error);
    return false;
  }

  return true;
}

export type ScrapedWebsiteData = {
  metadata: WebsiteMetadata | null;
  data: string | null;
  llmSummary: {
    goal: string;
    full: string;
    industry: string;
  } | null;
  competitorsContext: string | null;
  competitors: Competitor[];
};

export async function saveScrapedData(
  userId: string,
  orgId: string,
  scrapedData: ScrapedWebsiteData,
  questions: Question[],
): Promise<Organization | null> {
  return updateOrganization(orgId, {
    website: scrapedData.metadata?.url || null,
    name: scrapedData.metadata?.title || null,
    metadata: scrapedData.metadata as unknown as Json,
    llm_summary: scrapedData.llmSummary as unknown as Json,
    competitors: scrapedData.competitors as unknown as Json,
    questions: questions as unknown as Json,
  });
}

export async function createChat(
  userId: string,
  title: string,
): Promise<Chat | null> {
  const supabase = createSupabaseClient();
  const { data: chat, error } = await supabase
    .from("chats")
    .insert({ user_id: userId, title } as InsertChat)
    .select()
    .single();

  if (error) {
    console.error("Error creating chat:", error);
    return null;
  }

  return chat;
}

export async function getUserChats(userId: string): Promise<Chat[]> {
  const supabase = createSupabaseClient();
  const { data: chats, error } = await supabase
    .from("chats")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching user chats:", error);
    return [];
  }

  return chats || [];
}

export async function getChat(chatId: string): Promise<Chat | null> {
  const supabase = createSupabaseClient();
  const { data: chat, error } = await supabase
    .from("chats")
    .select("*")
    .eq("id", chatId)
    .single();

  if (error) {
    console.error("Error fetching chat:", error);
    return null;
  }

  return chat;
}

export async function updateChatTitle(
  chatId: string,
  title: string,
): Promise<Chat | null> {
  const supabase = createSupabaseClient();
  const { data: chat, error } = await supabase
    .from("chats")
    .update({ title })
    .eq("id", chatId)
    .select()
    .single();

  if (error) {
    console.error("Error updating chat title:", error);
    return null;
  }

  return chat;
}

export async function deleteChat(chatId: string): Promise<boolean> {
  const supabase = createSupabaseClient();
  const { error } = await supabase.from("chats").delete().eq("id", chatId);

  if (error) {
    console.error("Error deleting chat:", error);
    return false;
  }

  return true;
}

export async function addChatMessage(
  chatId: string,
  role: "user" | "assistant" | "system",
  content: string,
): Promise<ChatMessage | null> {
  const supabase = createSupabaseClient();
  const { data: message, error } = await supabase
    .from("chat_messages")
    .insert({ chat_id: chatId, role, content } as InsertChatMessage)
    .select()
    .single();

  if (error) {
    console.error("Error adding chat message:", error);
    return null;
  }

  return message;
}

export async function getChatMessages(chatId: string): Promise<ChatMessage[]> {
  const supabase = createSupabaseClient();
  const { data: messages, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching chat messages:", error);
    return [];
  }

  return messages || [];
}
