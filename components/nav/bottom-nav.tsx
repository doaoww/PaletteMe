"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/home", label: "home" },
  { href: "/scan", label: "scan" },
  { href: "/feed", label: "shop" },
  { href: "/profile", label: "profile" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="app-nav glass-nav" aria-label="Main">
      {NAV.map((item) => {
        const active =
          pathname === item.href ||
          (item.href === "/scan" && pathname.startsWith("/scan")) ||
          (item.href === "/feed" && (pathname.startsWith("/feed") || pathname.startsWith("/saved")));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`app-nav__link${active ? " app-nav__link--active" : ""}`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
