"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, type ReactNode } from "react";

const inputClass =
  "w-full rounded-lg border border-white/12 bg-black/25 px-3 py-2 text-sm text-white placeholder:text-white/35 outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/30";

const labelClass = "mb-1 block text-xs font-semibold text-white/55";

export function BriefingField({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
      {hint ? <p className="mt-1 text-[10px] text-white/40">{hint}</p> : null}
    </div>
  );
}

export function BriefingInput({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <BriefingField label={label} hint={hint}>
      <input
        className={inputClass}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </BriefingField>
  );
}

export function BriefingTextarea({
  label,
  value,
  onChange,
  rows = 4,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <BriefingField label={label} hint={hint}>
      <textarea
        className={`${inputClass} resize-y`}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </BriefingField>
  );
}

export function BriefingSelect<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <BriefingField label={label}>
      <select
        className={inputClass}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-sidebar">
            {o.label}
          </option>
        ))}
      </select>
    </BriefingField>
  );
}

type ExpandableSectionProps = {
  id: string;
  title: string;
  icon?: string;
  badge?: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

/**
 * Card expansível estilo content ops.
 */
export function ExpandableSection({
  id,
  title,
  icon,
  badge,
  defaultOpen = true,
  children,
}: ExpandableSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section id={id} className="scroll-mt-24 rounded-2xl border border-sidebar-border bg-sidebar/80 shadow-[0_0_32px_-16px_var(--color-brand)]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-white/[0.03]"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 font-semibold text-white">
          {icon ? (
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/15 text-sm text-brand-bright">
              {icon}
            </span>
          ) : null}
          {title}
        </span>
        <span className="flex items-center gap-2">
          {badge ? (
            <span className="rounded-md bg-brand/15 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-bright">
              {badge}
            </span>
          ) : null}
          <span className="text-white/40">{open ? "−" : "+"}</span>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/8 px-5 pb-5 pt-4">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

export function CharCounter({
  value,
  min,
  max,
  optimal,
}: {
  value: string;
  min?: number;
  max?: number;
  optimal?: [number, number];
}) {
  const len = value.length;
  let status: "ok" | "warn" | "error" = "warn";
  if (optimal && len >= optimal[0] && len <= optimal[1]) status = "ok";
  else if (max && len > max) status = "error";
  else if (min && len > 0 && len < min) status = "warn";

  const color =
    status === "ok"
      ? "text-emerald-400"
      : status === "error"
        ? "text-brand-bright"
        : "text-amber-400";

  return (
    <p className={`mt-1 text-right text-[10px] ${color}`}>
      {len} caracteres
      {optimal ? ` · ideal ${optimal[0]}–${optimal[1]}` : null}
    </p>
  );
}
