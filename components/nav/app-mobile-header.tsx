"use client";

import { CreditPill } from "@/components/nav/credit-pill";
import { AppBrand } from "@/components/nav/app-nav-shared";

type Props = {
  onMenuOpen: () => void;
};

export function AppMobileHeader({ onMenuOpen }: Props) {
  return (
    <header className="app-mobile-header glass-nav">
      <button
        type="button"
        className="app-mobile-header__menu"
        aria-label="Open menu"
        onClick={onMenuOpen}
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
      <AppBrand className="app-mobile-header__brand wordmark" />
      <CreditPill className="app-mobile-header__credits" compact />
    </header>
  );
}
