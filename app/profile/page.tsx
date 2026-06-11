"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadQuizProfile, type QuizProfile } from "@/lib/quiz";
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

    // Persist to Supabase if user is signed in
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    import("@/lib/supabase").then(({ createClient }) => {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (!user) return;
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
