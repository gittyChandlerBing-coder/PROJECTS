"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/ui/Logo";
import { Card } from "@/components/ui/Card";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  if (loading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoaderCircle className="h-5 w-5 animate-spin text-ink-faint" aria-label="Loading" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3">
          <Logo className="h-8 w-8 text-ink" strokeWidth={8} />
          <div className="text-center">
            <h1 className="font-mono text-lg font-semibold uppercase tracking-[0.1em] text-ink">
              Tally
            </h1>
            <p className="mt-1 text-sm text-ink-muted">
              Track habits, manage tasks, stay focused.
            </p>
          </div>
        </div>

        <Card className="w-full px-6 py-6">
          <GoogleSignInButton />
          <p className="mt-4 text-center text-xs text-ink-faint">
            Your daily ticks are stored on this device. Signing in only adds an
            optional email reminder.
          </p>
        </Card>
      </div>
    </div>
  );
}
