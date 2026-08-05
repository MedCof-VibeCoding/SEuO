"use client";

import { LayoutGrid } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const TOOLS = [
  { href: "/", label: "Home", match: (p: string) => p === "/" },
  {
    href: "/google-position-checker",
    label: "Position Checker",
    match: (p: string) => p.startsWith("/google-position-checker"),
  },
  {
    href: "/analyzer",
    label: "Análise comparativa",
    match: (p: string) =>
      p.startsWith("/analyzer") || p.startsWith("/compare"),
  },
  {
    href: "/quick-wins",
    label: "Quick Wins",
    match: (p: string) => p.startsWith("/quick-wins"),
  },
] as const;

function toolLinkClass(active: boolean) {
  return [
    "rounded-lg px-3 py-1.5 text-sm transition",
    active
      ? "bg-brand/15 font-semibold text-brand-bright"
      : "text-white/75 hover:bg-white/5 hover:text-white",
  ].join(" ");
}

/**
 * Menu Painel — navegação entre as ferramentas do site.
 */
export function ToolsNavMenu() {
  const pathname = usePathname();
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    detailsRef.current?.removeAttribute("open");
  }, [pathname]);

  return (
    <>
      <nav
        className="hidden items-center gap-1 sm:flex"
        aria-label="Ferramentas"
      >
        {TOOLS.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className={toolLinkClass(tool.match(pathname))}
          >
            {tool.label}
          </Link>
        ))}
      </nav>

      <details ref={detailsRef} className="relative sm:hidden">
        <summary
          className="inline-flex cursor-pointer list-none items-center gap-2 rounded-lg border border-brand/35 bg-brand/15 px-3 py-1.5 text-sm font-semibold text-white transition hover:border-brand/50 hover:bg-brand/25 [&::-webkit-details-marker]:hidden"
          aria-label="Abrir menu Painel"
        >
          <LayoutGrid className="h-4 w-4 text-brand-bright" aria-hidden />
          Painel
        </summary>

        <div
          role="menu"
          className="absolute right-0 z-[100] mt-2 min-w-[220px] overflow-hidden rounded-xl border border-white/12 bg-sidebar py-1 shadow-xl"
        >
          {TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              role="menuitem"
              className={["block", toolLinkClass(tool.match(pathname))].join(" ")}
            >
              {tool.label}
            </Link>
          ))}
        </div>
      </details>
    </>
  );
}
