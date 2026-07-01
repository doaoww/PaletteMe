"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  DEFAULT_WEEKLY_SCAN_CREDITS,
  getBrowserScanCreditState,
} from "@/lib/scan/scan-credits";

export const APP_NAV = [
  { href: "/home", label: "home", icon: "home" },
  { href: "/scan", label: "scan", icon: "scan" },
  { href: "/feed", label: "picks", icon: "picks" },
  { href: "/profile", label: "profile", icon: "profile" },
] as const;

export type AppNavIcon = "home" | "scan" | "picks" | "profile";

export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/scan") return pathname === href || pathname.startsWith("/scan");
  return pathname === href;
}

export function NavIcon({ name, className }: { name: AppNavIcon; className?: string }) {
  const cn = className ?? "app-nav-icon";
  if (name === "home") {
    return (
      <svg className={cn} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === "scan") {
    return (
      <svg className={cn} viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="4" y="7" width="16" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="13" r="3" stroke="currentColor" strokeWidth="1.8" />
        <path d="M9 7V5.5A2.5 2.5 0 0 1 11.5 3h1A2.5 2.5 0 0 1 15 5.5V7" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }
  if (name === "picks") {
    return (
      <svg className={cn} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M6 7h15l-1.5 12H7.5L6 7z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M9 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg className={cn} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 20c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function AppBrand({ className }: { className?: string }) {
  return (
    <Link href="/" className={className ?? "app-brand wordmark"}>
      palette<span className="me">me</span>
    </Link>
  );
}

export function AppNavLinks({
  onNavigate,
  variant = "sidebar",
}: {
  onNavigate?: () => void;
  variant?: "sidebar" | "drawer";
}) {
  const pathname = usePathname();

  return (
    <>
      {APP_NAV.map((item) => {
        const active = isNavActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`app-nav-link app-nav-link--${variant}${active ? " app-nav-link--active" : ""}`}
          >
            <NavIcon name={item.icon} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </>
  );
}

export function SignOutButton({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) return;
    import("@/lib/db/supabase").then(({ createClient }) => {
      createClient().auth.getUser().then(({ data: { user } }) => {
        setVisible(!!user);
      });
    });
  }, []);

  if (!visible) return null;

  async function handleSignOut() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) return;
    const { createClient } = await import("@/lib/db/supabase");
    await createClient().auth.signOut();
    onNavigate?.();
    router.push("/quiz");
  }

  return (
    <button
      type="button"
      onClick={() => void handleSignOut()}
      className="app-nav-signout"
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden className="app-nav-icon">
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="10 17 15 12 10 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="15" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      <span>sign out</span>
    </button>
  );
}

export function SidebarCreditsCard() {
  const [remaining, setRemaining] = useState(DEFAULT_WEEKLY_SCAN_CREDITS);

  useEffect(() => {
    setRemaining(getBrowserScanCreditState().remaining);
  }, []);

  return (
    <div className="app-sidebar__credits-card">
      <p className="app-sidebar__credits-label">credits</p>
      <p className="app-sidebar__credits-value">
        {remaining} <span aria-hidden>✦</span>
      </p>
      <p className="app-sidebar__credits-sub">scans left this month</p>
    </div>
  );
}
