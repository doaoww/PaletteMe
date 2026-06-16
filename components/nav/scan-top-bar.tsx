"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_NAV, AppBrand, isNavActive } from "@/components/nav/app-nav-shared";
import { CreditPill } from "@/components/nav/credit-pill";

export function ScanTopBar() {
  const pathname = usePathname();

  return (
    <header className="scan-topbar glass-nav">
      <div className="scan-topbar__inner">
        <AppBrand className="scan-topbar__brand wordmark" />
        <nav className="scan-topbar__nav" aria-label="Main">
          {APP_NAV.map((item) => {
            const active = isNavActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`scan-topbar__link${active ? " scan-topbar__link--active" : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <CreditPill className="scan-topbar__credits" labelMode="scans-left" />
      </div>
    </header>
  );
}
