"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { useReportSections } from "./report-sections-context";

type ReportSectionProps = {
  id: string;
  step: number;
  icon: LucideIcon;
  title: string;
  description?: string;
  badge?: string;
  children: ReactNode;
};

/**
 * Bloco recolhível do relatório, com âncora para a navegação lateral.
 */
export function ReportSection({
  id,
  step,
  icon: Icon,
  title,
  description,
  badge,
  children,
}: ReportSectionProps) {
  const { isOpen, toggle } = useReportSections();
  const open = isOpen(id);
  const contentId = `${id}-content`;

  return (
    <section
      id={id}
      className="scroll-mt-32 rounded-2xl border border-sidebar-border bg-sidebar/90 shadow-[0_0_48px_-20px_var(--color-brand)] backdrop-blur-sm lg:scroll-mt-40"
    >
      <h2>
        <button
          type="button"
          onClick={() => toggle(id)}
          aria-expanded={open}
          aria-controls={contentId}
          className="flex w-full items-center gap-3 rounded-2xl px-5 py-4 text-left transition hover:bg-white/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-bright sm:gap-4 sm:px-6"
        >
          <span
            className={[
              "grid h-9 w-9 shrink-0 place-items-center rounded-lg border transition",
              open
                ? "border-brand/40 bg-brand/15 text-brand-bright"
                : "border-white/10 bg-white/5 text-white/45",
            ].join(" ")}
          >
            <Icon className="h-4 w-4" aria-hidden />
          </span>

          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold tabular-nums text-white/25">
                {String(step).padStart(2, "0")}
              </span>
              <span className="text-sm font-semibold text-white/90">{title}</span>
              {badge ? (
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-white/50">
                  {badge}
                </span>
              ) : null}
            </span>
            {description ? (
              <span className="mt-1 block text-xs leading-relaxed text-white/45">
                {description}
              </span>
            ) : null}
          </span>

          <ChevronDown
            className={[
              "h-4 w-4 shrink-0 text-white/35 transition-transform duration-300",
              open ? "rotate-180" : "",
            ].join(" ")}
            aria-hidden
          />
        </button>
      </h2>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="content"
            id={contentId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/[0.06] px-5 py-6 sm:px-6">
              {children}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

type SubPanelProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
};

/**
 * Agrupa conteúdos dentro de uma seção do relatório.
 */
export function SubPanel({ title, description, action, children }: SubPanelProps) {
  return (
    <div className="border-t border-white/[0.06] pt-6 first:border-0 first:pt-0">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-white/85">{title}</h3>
          {description ? (
            <p className="mt-1 text-xs leading-relaxed text-white/45">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
