"use client";

import { getUserOrganizations, handleSignIn } from "@/app/actions/user";
import { ROUTES } from "@/lib/constants/routes";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (user && !error) {
        console.log("User metadata from Google:", user.user_metadata);

        const fullName = user.user_metadata?.name || "";
        const nameParts = fullName.split(" ");
        const givenName =
          user.user_metadata?.given_name || nameParts[0] || null;
        const familyName =
          user.user_metadata?.family_name ||
          nameParts.slice(1).join(" ") ||
          null;

        const { isNewUser } = await handleSignIn(user.id, {
          email: user.email,
          first_name: givenName,
          last_name: familyName,
          photo_url: user.user_metadata?.picture,
        });

        // Check if user has any organizations
        const orgs = await getUserOrganizations(user.id);
        const hasOrgs = orgs && orgs.length > 0;

        setStatus("success");
        const returnUrl =
          isNewUser || !hasOrgs ? ROUTES.setup.root : ROUTES.chat;
        setTimeout(() => {
          router.push(returnUrl);
        }, 1000);
      } else {
        setStatus("error");
        setTimeout(() => {
          router.push("/sign-in");
        }, 2000);
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        {status === "loading" && (
          <>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p>Signing you in...</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="text-green-500 text-4xl mb-4">✓</div>
            <p>Signed in successfully!</p>
            <p className="text-muted-foreground text-sm">Redirecting...</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="text-red-500 text-4xl mb-4">✗</div>
            <p>Failed to sign in</p>
            <p className="text-muted-foreground text-sm">Redirecting...</p>
          </>
        )}
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
        <p>Loading...</p>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CallbackContent />
    </Suspense>
  );
}
