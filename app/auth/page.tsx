"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { createClient as CreateClientType } from "@/lib/supabase";

type Mode = "signin" | "signup";
type SupabaseClient = Awaited<ReturnType<typeof CreateClientType>>;

function AuthForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [mode, setMode] = useState<Mode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const supabase = useRef<SupabaseClient | null>(null);

  useEffect(() => {
    import("@/lib/supabase").then(({ createClient }) => {
      supabase.current = createClient();
    });
    if (params.get("mode") === "signin") setMode("signin");
    if (params.get("error") === "auth_failed") {
      setStatus("error");
      setMessage("Sign in failed. Please try again.");
    }
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    const client = supabase.current;
    if (!client) return;

    if (mode === "signup") {
      const { error } = await client.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/profile` },
      });
      if (error) {
        setStatus("error");
        setMessage(error.message);
      } else {
        setStatus("done");
        setMessage("Check your email — we sent you a confirmation link.");
      }
    } else {
      const { error } = await client.auth.signInWithPassword({ email, password });
      if (error) {
        setStatus("error");
        setMessage(error.message);
      } else {
        router.push(params.get("next") ?? "/profile");
      }
    }
  };

  const handleGoogle = async () => {
    const client = supabase.current;
    if (!client) return;
    await client.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/profile`,
      },
    });
  };

  return (
    <>
      <div style={{ display: "flex", gap: 4, background: "var(--cream)", borderRadius: 10, padding: 4, marginBottom: 28 }}>
        {(["signup", "signin"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            style={{
              flex: 1,
              fontFamily: "var(--sans)",
              fontSize: "0.88rem",
              fontWeight: 700,
              border: "none",
              borderRadius: 7,
              padding: "9px 0",
              cursor: "pointer",
              transition: "all 0.2s",
              background: mode === m ? "#fff" : "transparent",
              color: mode === m ? "var(--ink)" : "var(--ink-soft)",
              boxShadow: mode === m ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
            }}
          >
            {m === "signup" ? "create account" : "sign in"}
          </button>
        ))}
      </div>

      <p className="font-serif" style={{ fontSize: "clamp(1.4rem,3vw,1.8rem)", lineHeight: 1.15, marginBottom: 24 }}>
        {mode === "signup" ? (
          <>Save your <span className="scr" style={{ color: "var(--pink)" }}>palette</span></>
        ) : (
          <>Welcome <span className="scr" style={{ color: "var(--pink)" }}>back</span></>
        )}
      </p>

      {status === "done" ? (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <p style={{ fontFamily: "var(--sans)", fontSize: "0.95rem", color: "var(--ink-soft)", lineHeight: 1.6 }}>
            {message}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            required
            style={inputStyle}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            minLength={6}
            style={inputStyle}
          />

          {status === "error" && message && (
            <p style={{ fontFamily: "var(--sans)", fontSize: "0.82rem", color: "var(--pink)" }}>{message}</p>
          )}

          <button type="submit" className="btn" style={{ width: "100%", marginTop: 4 }} disabled={status === "loading"}>
            {status === "loading" ? "please wait…" : mode === "signup" ? "create account" : "sign in"}
          </button>

          <div style={{ position: "relative", textAlign: "center", margin: "4px 0" }}>
            <div style={{ position: "absolute", inset: "50% 0 auto", height: 1, background: "var(--hair)" }} />
            <span style={{ position: "relative", fontFamily: "var(--sans)", fontSize: "0.75rem", color: "var(--ink-soft)", background: "#fff", padding: "0 12px" }}>
              or
            </span>
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              width: "100%",
              fontFamily: "var(--sans)",
              fontSize: "0.9rem",
              fontWeight: 600,
              border: "1px solid var(--hair)",
              borderRadius: 100,
              padding: "12px 0",
              background: "#fff",
              color: "var(--ink)",
              cursor: "pointer",
              transition: "border-color 0.2s",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--ink)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--hair)")}
          >
            <GoogleIcon />
            continue with Google
          </button>
        </form>
      )}

      <p style={{ fontFamily: "var(--sans)", fontSize: "0.78rem", color: "var(--ink-soft)", marginTop: 20 }}>
        {mode === "signup" ? "Already have an account? " : "No account yet? "}
        <button
          type="button"
          onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
          style={{ background: "none", border: "none", color: "var(--pink)", cursor: "pointer", fontFamily: "var(--sans)", fontSize: "0.78rem", fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3 }}
        >
          {mode === "signup" ? "sign in" : "create one"}
        </button>
      </p>
    </>
  );
}

export default function AuthPage() {
  return (
    <div
      style={{
        minHeight: "100svh",
        background: "var(--cream)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--pad)",
      }}
    >
      <Link href="/" className="wordmark" style={{ color: "var(--ink)", fontSize: "1.4rem", marginBottom: 40 }}>
        palette<span style={{ color: "var(--pink)" }}>me</span>
      </Link>

      <div
        style={{
          width: "min(420px, 100%)",
          background: "#fff",
          borderRadius: 20,
          border: "1px solid var(--hair)",
          padding: "clamp(28px,5vw,44px)",
          boxShadow: "0 4px 32px rgba(23,18,26,0.08)",
        }}
      >
        <Suspense fallback={null}>
          <AuthForm />
        </Suspense>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  fontFamily: "var(--sans)",
  fontSize: "0.9rem",
  border: "1px solid var(--hair)",
  borderRadius: 8,
  padding: "12px 16px",
  background: "#fff",
  color: "var(--ink)",
  outline: "none",
  width: "100%",
};

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}
