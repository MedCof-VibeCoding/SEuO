"use client";

import { LayoutGrid } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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
] as const;

/**
 * Menu Painel — navegação entre as ferramentas do site.
 */
export function ToolsNavMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="relative z-50" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-brand/35 bg-brand/15 px-3 py-1.5 text-sm font-semibold text-white transition hover:border-brand/50 hover:bg-brand/25"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <LayoutGrid className="h-4 w-4 text-brand-bright" aria-hidden />
        Painel
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-[100] mt-2 min-w-[220px] overflow-hidden rounded-xl border border-white/12 bg-sidebar py-1 shadow-xl"
        >
          {TOOLS.map((tool) => {
            const active = tool.match(pathname);
            return (
              <Link
                key={tool.href}
                href={tool.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className={[
                  "block px-4 py-2.5 text-sm transition",
                  active
                    ? "bg-brand/15 font-semibold text-brand-bright"
                    : "text-white/75 hover:bg-white/5 hover:text-white",
                ].join(" ")}
              >
                {tool.label}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
