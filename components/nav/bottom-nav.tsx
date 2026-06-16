"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_NAV, NavIcon, isNavActive } from "@/components/nav/app-nav-shared";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="app-nav glass-nav" aria-label="Main">
      {APP_NAV.map((item) => {
        const active = isNavActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`app-nav__link${active ? " app-nav__link--active" : ""}`}
          >
            <NavIcon name={item.icon} className="app-nav__icon" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
