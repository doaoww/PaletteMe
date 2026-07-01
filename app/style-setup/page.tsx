"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StyleSetupFlow } from "@/components/style-setup/style-setup-flow";
import { loadQuizProfile } from "@/lib/quiz/quiz";
import { isSupabaseAuthConfigured } from "@/lib/auth/auth-flow";
import { createClient } from "@/lib/db/supabase";
import "./style-setup.css";
import "../quiz/quiz.css";
import "@/components/report/report.css";

const AUTH_ENV = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

export default function StyleSetupPage() {
  return (
    <Suspense fallback={null}>
      <StyleSetupContent />
    </Suspense>
  );
}

function StyleSetupContent() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const authConfigured = isSupabaseAuthConfigured(AUTH_ENV);

  useEffect(() => {
    async function check() {
      if (authConfigured) {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login?next=/style-setup");
          return;
        }
      }
      // No profile check — style-setup IS where the profile gets created
      setReady(true);
    }
    void check();
  }, [authConfigured, router]);

  if (!ready) return null;

  return <StyleSetupFlow />;
}
