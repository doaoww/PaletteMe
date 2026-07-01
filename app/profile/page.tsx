"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { AnalysisResult } from "@/lib/analysis/analysis";
import type { QuizProfile } from "@/lib/quiz/quiz";
import { getPaymentUrls, isFreeTestingMode, resolvePremiumLevel, type PremiumLevel } from "@/lib/billing/premium";
import { ProfileView } from "@/components/profile/profile-view";
import { ReportView } from "@/components/report/report-view";
import { SeasonReveal } from "@/components/report/season-reveal";
import { ColorFamilyDiagnostics } from "@/components/report/color-family-diagnostics";
import type { AnalysisResult as NewAnalysisResult } from "@/lib/report/report-schema";
import { generateSlot } from "@/lib/report/generate-slot";
import { buildImageSlots } from "@/lib/report/image-slots";
import "@/components/report/report.css";
import { isSupabaseAuthConfigured } from "@/lib/auth/auth-flow";
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
  const [newAnalysis, setNewAnalysis] = useState<NewAnalysisResult | null>(null);
  const [wardrobeType, setWardrobeType] = useState<"woman" | "man" | "other">("woman");
  const [reportSections, setReportSections] = useState<string[]>([]);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [profile, setProfile] = useState<QuizProfile | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [premiumLevel, setPremiumLevel] = useState<PremiumLevel>(freeTestingMode ? "pro" : "free");
  const [ready, setReady] = useState(false);
  const [requiresAuth, setRequiresAuth] = useState(false);
  const paymentUrls = getPaymentUrls(PROFILE_PREMIUM_ENV);

  type Phase = "reveal" | "diagnostics" | "report";
  const [phase, setPhase] = useState<Phase>(() =>
    typeof window !== "undefined" && localStorage.getItem("paletteme-diagnostics-done") === "true"
      ? "report"
      : "reveal"
  );
  const [images, setImages] = useState<Record<string, string>>({});
  const [totalSlots, setTotalSlots] = useState(0);
  const generationStarted = useRef(false);
  const IMAGE_CACHE_KEY = "paletteme-report-images";

  useEffect(() => {
    const stored = localStorage.getItem("paletteme-face-photo");
    if (stored) setPhotoDataUrl(stored);
    const wt = localStorage.getItem("paletteme-wardrobe-type");
    if (wt === "man" || wt === "other") setWardrobeType(wt);
    try {
      const rs = localStorage.getItem("paletteme-report-sections");
      if (rs) setReportSections(JSON.parse(rs) as string[]);
    } catch { /* malformed */ }
  }, []);

  useEffect(() => {
    if (!newAnalysis || generationStarted.current) return;

    const hasDiagnostics = !!newAnalysis.fullReport.colorDiagnostics;
    const diagnosticsDone = localStorage.getItem("paletteme-diagnostics-done") === "true";
    if (!hasDiagnostics) setPhase("report");
    else if (!diagnosticsDone) setPhase("reveal");

    const slots = buildImageSlots(newAnalysis.fullReport, wardrobeType, reportSections);
    setTotalSlots(slots.length);

    // Restore previously generated images from localStorage
    let cached: Record<string, string> = {};
    try {
      const raw = localStorage.getItem(IMAGE_CACHE_KEY);
      if (raw) cached = JSON.parse(raw) as Record<string, string>;
    } catch { /* malformed */ }

    const alreadyDone = slots.filter(s => cached[s.slotId]);
    if (alreadyDone.length > 0) setImages(cached);

    const pending = slots.filter(s => !cached[s.slotId]);
    if (pending.length === 0) return;

    void (async () => {
      if (!photoDataUrl) return;
      generationStarted.current = true;
      for (const slot of pending) {
        const url = await generateSlot(photoDataUrl, slot.slotId);
        if (url) {
          cached = { ...cached, [slot.slotId]: url };
          localStorage.setItem(IMAGE_CACHE_KEY, JSON.stringify(cached));
          setImages(prev => ({ ...prev, [slot.slotId]: url }));
        }
      }
    })();
  }, [newAnalysis, photoDataUrl]);

  useEffect(() => {
    let cancelled = false;
    setPremiumLevel(resolvePremiumLevel(searchParams, undefined, PROFILE_PREMIUM_ENV));

    async function restoreProfile() {
      // Check Supabase first — it is the source of truth for the new report flow.
      if (authConfigured) {
        try {
          const { createClient } = await import("@/lib/db/supabase");
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: reportRow } = await supabase
              .from("style_reports")
              .select("full_report, status")
              .eq("user_id", user.id)
              .maybeSingle();

            if (reportRow?.status === "done" && reportRow.full_report) {
              const parsed = reportRow.full_report as NewAnalysisResult;
              if (!cancelled) {
                setNewAnalysis(parsed);
                setReady(true);
              }
              try { localStorage.setItem("paletteme-analysis", JSON.stringify(parsed)); } catch { /* quota */ }
              return;
            }
          }
        } catch { /* Supabase check failed — fall through to localStorage below */ }
      }

      // Fallback: localStorage only (no session / Supabase unavailable / row not found yet).
      try {
        const raw = localStorage.getItem("paletteme-analysis");
        if (raw) {
          const parsed = JSON.parse(raw) as NewAnalysisResult;
          if (parsed?.miniResult && parsed?.fullReport) {
            if (!cancelled) {
              setNewAnalysis(parsed);
              setReady(true);
            }
            return;
          }
        }
      } catch { /* malformed — fall through */ }

      // No new-flow report yet (no session, or style_reports/localStorage not
      // populated) — send to the current onboarding rather than falling back
      // to any pre-rebrand quiz/color-analysis data that might still exist
      // for this account. The old ProfileView/quiz-profile path stays in the
      // codebase but is no longer reachable from here.
      if (!cancelled) router.replace("/style-setup");
    }

    restoreProfile();
    return () => {
      cancelled = true;
    };
  }, [router, searchParams, authConfigured]);


  useEffect(() => {
    if (requiresAuth) {
      router.replace("/login?next=/profile");
    }
  }, [requiresAuth, router]);

  if (!ready) {
    return <ProfileLoading />;
  }

  if (newAnalysis) {
    const { miniResult, fullReport } = newAnalysis;
    const cd = fullReport.colorDiagnostics;

    if (phase === "reveal") {
      return (
        <SeasonReveal
          miniResult={miniResult}
          seasonId={fullReport.colorAnalysis.topSeason.id}
          nextReady={process.env.NEXT_PUBLIC_SKIP_IMAGE_GEN === "true" || "neutral-draping" in images}
          onNext={() => setPhase("diagnostics")}
        />
      );
    }

    if (phase === "diagnostics" && cd) {
      return (
        <ColorFamilyDiagnostics
          neutralDrapingUrl={images["neutral-draping"] ?? ""}
          userPhotoUrl={photoDataUrl ?? undefined}
          colorDiagnostics={cd}
          bestColors={fullReport.colorAnalysis.bestColors}
          onComplete={() => {
            localStorage.setItem("paletteme-diagnostics-done", "true");
            setPhase("report");
          }}
        />
      );
    }

    return (
      <ReportView
        analysis={newAnalysis}
        photoDataUrl={photoDataUrl ?? ""}
        images={images}
        totalSlots={totalSlots}
        wardrobeType={wardrobeType}
        reportSections={reportSections}
      />
    );
  }

  if (!profile || requiresAuth) {
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
