"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { AnalysisResult } from "@/lib/analysis";
import { loadQuizProfile, type QuizProfile } from "@/lib/quiz";
import { saveCompleteQuizResultToSupabase } from "@/lib/post-quiz-supabase";
import {
  loadLocalAnalysisResultForProfile,
  loadSupabaseQuizProfile,
  saveRestoredQuizProfileToBrowserStorage,
} from "@/lib/profile-restore";
import { getPaymentUrls, isFreeTestingMode, resolvePremiumLevel, type PremiumLevel } from "@/lib/premium";
import { ProfileView } from "@/components/profile/profile-view";
import { isSupabaseAuthConfigured } from "@/lib/auth-flow";
import { syncLocalWardrobeAfterAuth } from "@/lib/wardrobe-store";
import "./profile.css";
import "./color-insights-report.css";
import "../app-shell.css";

const PROFILE_PREMIUM_ENV = {
  NEXT_PUBLIC_FREE_TESTING_MODE: process.env.NEXT_PUBLIC_FREE_TESTING_MODE,
  NEXT_PUBLIC_PAID_REPORT_URL: process.env.NEXT_PUBLIC_PAID_REPORT_URL,
  NEXT_PUBLIC_SUBSCRIPTION_URL: process.env.NEXT_PUBLIC_SUBSCRIPTION_URL,
};

const AUTH_ENV = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileLoading />}>
      <ProfileContent />
    </Suspense>
  );
}

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authConfigured = isSupabaseAuthConfigured(AUTH_ENV);
  const freeTestingMode = isFreeTestingMode(PROFILE_PREMIUM_ENV);
  const [profile, setProfile] = useState<QuizProfile | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [premiumLevel, setPremiumLevel] = useState<PremiumLevel>(freeTestingMode ? "pro" : "free");
  const [ready, setReady] = useState(false);
  const [requiresAuth, setRequiresAuth] = useState(false);
  const paymentUrls = getPaymentUrls(PROFILE_PREMIUM_ENV);

  useEffect(() => {
    let cancelled = false;
    setPremiumLevel(resolvePremiumLevel(searchParams, undefined, PROFILE_PREMIUM_ENV));

    async function restoreProfile() {
      let signedInUser: { id: string; email?: string | null } | null = null;
      let supabaseClient: Awaited<ReturnType<typeof import("@/lib/supabase")["createClient"]>> | null = null;

      if (authConfigured) {
        try {
          const { createClient } = await import("@/lib/supabase");
          supabaseClient = createClient();
          const {
            data: { user },
          } = await supabaseClient.auth.getUser();
          signedInUser = user;

          if (user) {
            void syncLocalWardrobeAfterAuth(user.id).catch(() => {});
            const restored = await loadSupabaseQuizProfile(supabaseClient, user.id);
            if (restored) {
              saveRestoredQuizProfileToBrowserStorage(restored);
              if (cancelled) return;
              setProfile(restored.profile);
              setAnalysisResult(restored.analysisResult as AnalysisResult | null);
              setReady(true);
              return;
            }
          }
        } catch {
          signedInUser = null;
          supabaseClient = null;
        }
      }

      const localProfile = loadQuizProfile();
      const localAnalysisResult = loadLocalAnalysisResultForProfile<AnalysisResult>();

      if (localProfile) {
        if (cancelled) return;
        setProfile(localProfile);
        setAnalysisResult(localAnalysisResult);
        setReady(true);

        if (signedInUser && supabaseClient) {
          saveCompleteQuizResultToSupabase({
            supabase: supabaseClient,
            user: signedInUser,
            profile: localProfile,
            analysisResult: localAnalysisResult,
          }).catch(() => {});
        } else if (authConfigured) {
          setRequiresAuth(true);
        }
        return;
      }

      if (!cancelled) router.replace("/quiz");
    }

    restoreProfile();
    return () => {
      cancelled = true;
    };
  }, [router, searchParams, authConfigured]);

  if (!ready || !profile) {
    return <ProfileLoading />;
  }

  if (requiresAuth) {
    router.replace("/login?next=/profile");
    return <ProfileLoading />;
  }

  return (
    <ProfileView
      profile={profile}
      analysisResult={analysisResult}
      premiumLevel={premiumLevel}
      paymentUrls={paymentUrls}
      freeTestingMode={freeTestingMode}
    />
  );
}

function ProfileLoading() {
  return (
    <div
      style={{
        minHeight: "100svh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--sans)",
        color: "var(--ink-soft)",
      }}
    >
      Loading your profile…
    </div>
  );
}
