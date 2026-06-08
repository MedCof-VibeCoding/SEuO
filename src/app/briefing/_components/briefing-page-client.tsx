"use client";

import { BriefingProvider } from "~/features/content-briefing/context/briefing-context";

import { BriefingHeader } from "./briefing-header";
import { BriefingSections } from "./briefing-sections";
import { BriefingSidebar } from "./briefing-sidebar";

/**
 * App de briefing GEO + SEO (content ops).
 */
export function BriefingPageClient() {
  return (
    <BriefingProvider>
      <div className="shell-page-bg min-h-screen text-white">
        <div
          className="pointer-events-none fixed inset-0 opacity-40"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 0% 0%, color-mix(in oklab, var(--color-brand) 18%, transparent), transparent)",
          }}
        />
        <div className="relative z-10 mx-auto flex max-w-[1600px] flex-col gap-6 px-4 py-6 lg:flex-row lg:px-6 lg:py-8">
          <BriefingSidebar />
          <div className="min-w-0 flex-1 space-y-6">
            <BriefingHeader />
            <BriefingSections />
          </div>
        </div>
      </div>
    </BriefingProvider>
  );
}
