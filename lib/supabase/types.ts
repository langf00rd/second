export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          photo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          first_name?: string | null;
          last_name?: string | null;
          photo_url?: string | null;
        };
        Update: {
          email?: string;
          first_name?: string | null;
          last_name?: string | null;
          photo_url?: string | null;
        };
      };
      organizations: {
        Row: {
          id: string;
          user_id: string;
          website: string | null;
          name: string | null;
          metadata: Json | null;
          llm_summary: Json | null;
          competitors: Json | null;
          questions: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          website?: string | null;
          name?: string | null;
          metadata?: Json | null;
          llm_summary?: Json | null;
          competitors?: Json | null;
          questions?: Json | null;
        };
        Update: {
          website?: string | null;
          name?: string | null;
          metadata?: Json | null;
          llm_summary?: Json | null;
          competitors?: Json | null;
          questions?: Json | null;
        };
      };
      chats: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
        };
        Update: {
          title?: string;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          chat_id: string;
          role: "user" | "assistant" | "system";
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          chat_id: string;
          role: "user" | "assistant" | "system";
          content: string;
        };
        Update: {
          content?: string;
        };
      };
    };
  };
}

export type User = Database["public"]["Tables"]["users"]["Row"];
export type Organization = Database["public"]["Tables"]["organizations"]["Row"];
export type Chat = Database["public"]["Tables"]["chats"]["Row"];
export type ChatMessage = Database["public"]["Tables"]["chat_messages"]["Row"];

export type InsertUser = Database["public"]["Tables"]["users"]["Insert"];
export type UpdateUser = Database["public"]["Tables"]["users"]["Update"];
export type InsertOrganization = Database["public"]["Tables"]["organizations"]["Insert"];
export type UpdateOrganization = Database["public"]["Tables"]["organizations"]["Update"];
export type InsertChat = Database["public"]["Tables"]["chats"]["Insert"];
export type InsertChatMessage = Database["public"]["Tables"]["chat_messages"]["Insert"];
