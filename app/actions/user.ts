"use server";

import type { ScrapedWebsiteData } from "@/lib/supabase/db";
import { createServerClient } from "@/lib/supabase/server";
import type {
  InsertOrganization,
  Json,
  UpdateOrganization,
  UpdateUser,
} from "@/lib/supabase/types";
import type { Question } from "@/lib/types";

export async function getSession() {
  const supabase = await createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

export async function getCurrentUser() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function signOut() {
  const supabase = await createServerClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function updateUserProfile(userId: string, data: UpdateUser) {
  const supabase = await createServerClient();
  const { data: user, error } = await supabase
    .from("users")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error updating user profile:", error);
    return null;
  }

  return user;
}

export async function getUserProfile(userId: string) {
  const supabase = await createServerClient();
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }

  return user;
}

export async function createOrganization(data: InsertOrganization) {
  const supabase = await createServerClient();
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

export async function getUserOrganizations(userId: string) {
  const supabase = await createServerClient();
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

export async function updateOrganization(id: string, data: UpdateOrganization) {
  const supabase = await createServerClient();
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

export async function deleteOrganization(id: string) {
  const supabase = await createServerClient();
  const { error } = await supabase.from("organizations").delete().eq("id", id);

  if (error) {
    console.error("Error deleting organization:", error);
    return false;
  }

  return true;
}

export async function createOrganizationWithScrapedData(
  userId: string,
  scrapedData: {
    metadata: unknown;
    llmSummary: unknown;
    competitors: unknown;
    competitorsContext: string | null;
  },
  website: string,
  name: string | null,
  questions: unknown[],
) {
  const supabase = await createServerClient();
  const { data: org, error } = await supabase
    .from("organizations")
    .insert({
      user_id: userId,
      website,
      name,
      metadata: scrapedData.metadata as Json,
      llm_summary: scrapedData.llmSummary as Json,
      competitors: scrapedData.competitors as Json,
      questions: questions as Json,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating organization:", error);
    return null;
  }

  return org;
}

export async function saveScrapedDataToOrganization(
  userId: string,
  orgId: string,
  scrapedData: ScrapedWebsiteData,
  questions: Question[],
) {
  const supabase = await createServerClient();
  const { data: org, error } = await supabase
    .from("organizations")
    .update({
      website: scrapedData.metadata?.url || null,
      name: scrapedData.metadata?.title || null,
      metadata: scrapedData.metadata as unknown as Json,
      llm_summary: scrapedData.llmSummary as unknown as Json,
      competitors: scrapedData.competitors as unknown as Json,
      questions: questions as unknown as Json,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orgId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error saving scraped data:", error);
    return null;
  }

  return org;
}

export async function handleSignIn(
  userId: string,
  userData: {
    email?: string;
    first_name?: string;
    last_name?: string;
    photo_url?: string;
  },
) {
  const supabase = await createServerClient();

  const { data: existingUser, error: fetchError } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    console.error("Error checking user:", fetchError);
    return { isNewUser: false, user: null };
  }

  if (existingUser) {
    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update({
        email: userData.email || existingUser.email,
        first_name: userData.first_name || existingUser.first_name,
        last_name: userData.last_name || existingUser.last_name,
        photo_url: userData.photo_url || existingUser.photo_url,
      })
      .eq("id", userId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating user:", updateError);
      return { isNewUser: false, user: existingUser };
    }

    return { isNewUser: false, user: updatedUser };
  }

  const { data: newUser, error: insertError } = await supabase
    .from("users")
    .insert({
      id: userId,
      email: userData.email || null,
      first_name: userData.first_name || null,
      last_name: userData.last_name || null,
      photo_url: userData.photo_url || null,
    })
    .select()
    .single();

  if (insertError) {
    console.error("Error creating user:", insertError);
    return { isNewUser: false, user: null };
  }

  return { isNewUser: true, user: newUser };
}
