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
    };
  };
}

export type User = Database["public"]["Tables"]["users"]["Row"];
export type Organization = Database["public"]["Tables"]["organizations"]["Row"];

export type InsertUser = Database["public"]["Tables"]["users"]["Insert"];
export type UpdateUser = Database["public"]["Tables"]["users"]["Update"];
export type InsertOrganization = Database["public"]["Tables"]["organizations"]["Insert"];
export type UpdateOrganization = Database["public"]["Tables"]["organizations"]["Update"];
