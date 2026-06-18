"use client";

import { useEffect } from "react";
import { AppBrand, AppNavLinks, SidebarCreditsCard, SignOutButton } from "@/components/nav/app-nav-shared";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function AppMobileDrawer({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="app-mobile-drawer" role="presentation">
      <button
        type="button"
        className="app-mobile-drawer__backdrop"
        aria-label="Close menu"
        onClick={onClose}
      />
      <aside className="app-mobile-drawer__panel" role="dialog" aria-label="Navigation menu">
        <div className="app-mobile-drawer__head">
          <AppBrand className="app-mobile-drawer__brand wordmark" />
          <button
            type="button"
            className="app-mobile-drawer__close"
            aria-label="Close menu"
            onClick={onClose}
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <nav className="app-mobile-drawer__nav">
          <AppNavLinks variant="drawer" onNavigate={onClose} />
        </nav>
        <SignOutButton onNavigate={onClose} />
        <SidebarCreditsCard />
      </aside>
    </div>
  );
}
