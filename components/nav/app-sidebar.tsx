"use client";

import { AppBrand, AppNavLinks, SidebarCreditsCard, SignOutButton } from "@/components/nav/app-nav-shared";

export function AppSidebar() {
  return (
    <aside className="app-sidebar glass-nav" aria-label="Main navigation">
      <AppBrand className="app-sidebar__brand wordmark" />
      <nav className="app-sidebar__nav">
        <AppNavLinks variant="sidebar" />
      </nav>
      <SignOutButton />
      <SidebarCreditsCard />
    </aside>
  );
}
