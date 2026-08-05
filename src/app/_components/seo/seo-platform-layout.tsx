"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { SeuoLogo } from "./seuo-logo";
import { ToolsNavMenu } from "./tools-nav-menu";

/**
 * Header público da plataforma SEO.
 */
function SeoHeader() {
  return (
    <header className="no-print pointer-events-auto sticky top-0 z-50 border-b border-sidebar-border bg-sidebar/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center"
          aria-label="SEuO SEO — página inicial"
        >
          <SeuoLogo variant="header" className="hidden sm:flex" />
          <SeuoLogo variant="icon" className="h-9 w-9 sm:hidden" />
        </Link>

        <nav
          className="flex items-center justify-end gap-2 sm:gap-3"
          aria-label="Navegação principal"
        >
          <ToolsNavMenu />
        </nav>
      </div>
    </header>
  );
}

/**
 * Layout compartilhado das páginas SEO.
 */
export function SeoPlatformLayout({ children }: { children: ReactNode }) {
  return (
    <div className="shell-page-bg relative isolate min-h-screen text-white">
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-50"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 70% 45% at 50% -15%, color-mix(in oklab, var(--color-brand) 28%, transparent), transparent), radial-gradient(ellipse 50% 35% at 100% 80%, color-mix(in oklab, var(--color-brand) 12%, transparent), transparent)",
        }}
      />
      <SeoHeader />
      <main className="relative">{children}</main>
    </div>
  );
}
