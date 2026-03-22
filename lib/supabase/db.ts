import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import type {
  InsertUser,
  InsertOrganization,
  UpdateOrganization,
  UpdateUser,
  User,
  Organization,
  Json,
} from "./types";
import type { WebsiteMetadata } from "@/lib/types";
import type { Competitor } from "@/lib/services/llm/openrouter";
import type { Question } from "@/lib/types";

export type { User, Organization, Json };

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
