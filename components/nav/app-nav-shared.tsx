"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  DEFAULT_WEEKLY_SCAN_CREDITS,
  getBrowserScanCreditState,
} from "@/lib/scan-credits";

export const APP_NAV = [
  { href: "/home", label: "home", icon: "home" },
  { href: "/scan", label: "scan", icon: "scan" },
  { href: "/profile", label: "profile", icon: "profile" },
] as const;

export type AppNavIcon = (typeof APP_NAV)[number]["icon"];

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
