"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

type SessionState = "checking" | "signed-in" | "signed-out";

export function SessionAction({ next = "/profile" }: { next?: string }) {
  const router = useRouter();
  const [sessionState, setSessionState] = useState<SessionState>("checking");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      setSessionState("signed-out");
      return;
    }

    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      setSessionState(user ? "signed-in" : "signed-out");
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionState(session?.user ? "signed-in" : "signed-out");
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    setPending(true);
    try {
      await fetch("/api/auth/sign-out", { method: "POST" });
      setSessionState("signed-out");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  if (sessionState === "checking") return null;

  if (sessionState === "signed-in") {
    return (
      <button type="button" onClick={handleSignOut} disabled={pending} style={actionStyle}>
        {pending ? "signing out" : "sign out"}
      </button>
    );
  }

  return (
    <Link href={`/login?next=${encodeURIComponent(next)}`} style={actionStyle}>
      sign in
    </Link>
  );
}

const actionStyle: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "var(--ink-soft)",
  cursor: "pointer",
  fontFamily: "var(--sans)",
  fontSize: "0.82rem",
  letterSpacing: 0,
  padding: 0,
  textDecoration: "none",
  textTransform: "lowercase",
};
