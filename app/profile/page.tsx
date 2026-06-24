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
import { StyleReportView, type StyleAnalysisResult } from "@/components/profile/style-report-view";
import { isSupabaseAuthConfigured } from "@/lib/auth-flow";
import { syncLocalWardrobeAfterAuth } from "@/lib/wardrobe-store";
import "./profile.css";
import "./color-insights-report.css";
import "../app-shell.css";

const STYLE_ANALYSIS_KEY = "paletteme-style-analysis";

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
  const [styleAnalysisResult, setStyleAnalysisResult] = useState<StyleAnalysisResult | null>(null);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [profile, setProfile] = useState<QuizProfile | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [premiumLevel, setPremiumLevel] = useState<PremiumLevel>(freeTestingMode ? "pro" : "free");
  const [ready, setReady] = useState(false);
  const [requiresAuth, setRequiresAuth] = useState(false);
  const paymentUrls = getPaymentUrls(PROFILE_PREMIUM_ENV);

  useEffect(() => {
    const stored = localStorage.getItem("paletteme-face-photo");
    if (stored) setPhotoDataUrl(stored);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setPremiumLevel(resolvePremiumLevel(searchParams, undefined, PROFILE_PREMIUM_ENV));

    async function restoreProfile() {
      // Check for new AI stylist analysis first
      try {
        const raw = localStorage.getItem(STYLE_ANALYSIS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as StyleAnalysisResult;
          if (parsed?.miniResult) {
            if (!cancelled) {
              setStyleAnalysisResult(parsed);
              setReady(true);
            }
            return;
          }
        }
      } catch {
        // malformed storage — fall through to legacy profile
      }

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

      if (!cancelled) router.replace("/style-setup");
    }

    restoreProfile();
    return () => {
      cancelled = true;
    };
  }, [router, searchParams, authConfigured]);

  // When mini-result is present but fullReport is missing, call /api/style-analysis/full
  useEffect(() => {
    if (!styleAnalysisResult?.miniResult) return;
    // Guard: fullReport is null until fetched, non-null after. Prevents re-fetch loop.
    if (styleAnalysisResult.fullReport !== null) return;
    if (!styleAnalysisResult.profileData) return;

    let cancelled = false;

    async function loadFullReport() {
      if (!styleAnalysisResult?.profileData) return;
      try {
        const res = await fetch("/api/style-analysis/full", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profileData: styleAnalysisResult.profileData,
            quiz: styleAnalysisResult.quizData ?? {},
            meta: {
              skinType: styleAnalysisResult.meta.skinType,
              skinConcerns: styleAnalysisResult.meta.skinConcerns,
              location: styleAnalysisResult.meta.location,
            },
          }),
        });
        if (!res.ok || cancelled) return;
        const data = await res.json() as { fullReport?: unknown };
        if (cancelled || !data.fullReport) return;

        const updated: StyleAnalysisResult = {
          ...styleAnalysisResult,
          fullReport: data.fullReport as StyleAnalysisResult["fullReport"],
        };

        try {
          localStorage.setItem(STYLE_ANALYSIS_KEY, JSON.stringify(updated));
        } catch { /* quota — non-fatal */ }

        setStyleAnalysisResult(updated);
      } catch {
        // Full report failed — mini-result stays visible, user can try refreshing
      }
    }

    void loadFullReport();
    return () => { cancelled = true; };
  }, [styleAnalysisResult?.miniResult, styleAnalysisResult?.fullReport, styleAnalysisResult?.profileData]);

  if (!ready) {
    return <ProfileLoading />;
  }

  if (styleAnalysisResult) {
    return (
      <StyleReportView
        result={styleAnalysisResult}
        lookLab={styleAnalysisResult?.fullReport?.lookLab ?? null}
        photoDataUrl={photoDataUrl}
        unlocked={premiumLevel !== "free"}
      />
    );
  }

  if (!profile) {
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
    <div className="profile-skel">
      <div className="profile-skel__topbar">
        <div className="skel profile-skel__wordmark" />
        <div className="skel profile-skel__chip" />
      </div>
      <div className="skel profile-skel__eyebrow" />
      <div className="skel profile-skel__season" />
      <div className="skel profile-skel__sub" />
      <div className="profile-skel__palette">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skel profile-skel__swatch" />
        ))}
      </div>
      <div className="skel profile-skel__line profile-skel__line--full" />
      <div className="skel profile-skel__line profile-skel__line--long" />
      <div className="skel profile-skel__line profile-skel__line--mid" />
      <div className="skel profile-skel__line profile-skel__line--short" style={{ marginTop: 24 }} />
      <div className="skel profile-skel__line profile-skel__line--full" />
      <div className="skel profile-skel__line profile-skel__line--long" />
    </div>
  );
}
