"use client";

import { ChevronDown, type LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { useReportSections } from "./report-sections-context";

export type ReportNavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
};

type ReportNavProps = {
  items: ReportNavItem[];
};

/**
 * Índice do relatório: barra lateral fixa no desktop e lista recolhível no mobile.
 */
export function ReportNav({ items }: ReportNavProps) {
  const { open } = useReportSections();
  const active = useActiveSection(items.map((item) => item.id));

  const goTo = (id: string) => {
    open(id);
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <>
      <details className="no-print group mb-5 rounded-xl border border-white/[0.07] bg-sidebar/80 lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold text-white/75">
          Índice do relatório
          <ChevronDown
            className="h-4 w-4 text-white/40 transition-transform group-open:rotate-180"
            aria-hidden
          />
        </summary>
        <ul className="border-t border-white/[0.06] p-2">
          {items.map((item, index) => (
            <li key={item.id}>
              <NavLink
                item={item}
                index={index + 1}
                active={active === item.id}
                onSelect={goTo}
              />
            </li>
          ))}
        </ul>
      </details>

      <nav
        aria-label="Seções do relatório"
        className="no-print sticky top-40 hidden self-start lg:block"
      >
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-white/25">
          Relatório
        </p>
        <ul className="flex flex-col gap-0.5">
          {items.map((item, index) => (
            <li key={item.id}>
              <NavLink
                item={item}
                index={index + 1}
                active={active === item.id}
                onSelect={goTo}
              />
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}

/**
 * Item de navegação com estado ativo.
 */
function NavLink({
  item,
  index,
  active,
  onSelect,
}: {
  item: ReportNavItem;
  index: number;
  active: boolean;
  onSelect: (id: string) => void;
}) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      aria-current={active ? "true" : undefined}
      className={[
        "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition",
        active
          ? "bg-brand/12 font-semibold text-white"
          : "text-white/45 hover:bg-white/5 hover:text-white/75",
      ].join(" ")}
    >
      <Icon
        className={`h-4 w-4 shrink-0 ${active ? "text-brand-bright" : "text-white/30"}`}
        aria-hidden
      />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      <span className="text-[10px] tabular-nums text-white/20">{index}</span>
    </button>
  );
}

/**
 * Destaca a seção visível durante a rolagem.
 */
function useActiveSection(ids: string[]): string {
  const [active, setActive] = useState(ids[0] ?? "");
  const key = ids.join("|");

  useEffect(() => {
    const sectionIds = key.split("|").filter(Boolean);
    const visible = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        const first = sectionIds.find((id) => visible.has(id));
        if (first) setActive(first);
      },
      { rootMargin: "-160px 0px -55% 0px" },
    );

    for (const id of sectionIds) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [key]);

  return active;
}
