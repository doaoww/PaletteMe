"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { AppSidebar } from "@/components/nav/app-sidebar";
import { AppMobileHeader } from "@/components/nav/app-mobile-header";
import { AppMobileDrawer } from "@/components/nav/app-mobile-drawer";
import { BottomNav } from "@/components/nav/bottom-nav";

type Props = {
  children: ReactNode;
  className?: string;
  hideNav?: boolean;
};

export function AppChrome({ children, className, hideNav = false }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className={`app-chrome${className ? ` ${className}` : ""}`}>
      {!hideNav ? <AppSidebar /> : null}
      <div className="app-chrome__stage">
        {!hideNav ? <AppMobileHeader onMenuOpen={() => setDrawerOpen(true)} /> : null}
        {children}
      </div>
      {!hideNav ? <BottomNav /> : null}
      {!hideNav ? (
        <AppMobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      ) : null}
    </div>
  );
}
