"use client";

import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "@/lib/auth";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Page() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("Failed to sign in with Google");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center h-screen px-5 flex-col gap-4 justify-center">
      <h1 className="text-xl font-semibold">Get started with Second</h1>
      <p className="text-muted-foreground text-center max-w-sm">
        Analyze your website, get insights, and grow your business with AI-powered
        advice.
      </p>
      <Button onClick={handleSignIn} disabled={isLoading} size="lg">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Redirecting...
          </>
        ) : (
          "Continue with Google"
        )}
      </Button>
    </div>
  );
}
