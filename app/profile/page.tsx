"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadQuizProfile, LS_USER_ID, type QuizProfile } from "@/lib/quiz";
import { ProfileView } from "@/components/profile/profile-view";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<QuizProfile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const p = loadQuizProfile();
    if (!p) {
      router.replace("/quiz");
      return;
    }
    setProfile(p);
    setReady(true);

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    import("@/lib/supabase").then(({ createClient }) => {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (!user) return;

        // Link the anonymous quiz row to the auth user (handles Google OAuth redirect)
        const anonymousId = localStorage.getItem(LS_USER_ID);
        fetch("/api/auth/link", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ anonymous_id: anonymousId }),
        }).catch(() => {});

        // Also upsert into profiles table (existing behaviour)
        supabase.from("profiles").upsert({
          id: user.id,
          color_season: p.seasonId,
          undertone: p.undertoneHint,
          body_type: p.bodyType ?? null,
          style_vector: p.styleVector ?? null,
          sub_season: p.subSeason ?? null,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        });
      });
    });
  }, [router]);

  if (!ready || !profile) {
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

  return <ProfileView profile={profile} />;
}
