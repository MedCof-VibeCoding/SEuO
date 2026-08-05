"use client";

import { useEffect, useState } from "react";

import type { ThirtyDayPlanItem } from "~/features/seo/types/analysis";

type PlanChecklistProps = {
  weeks: ThirtyDayPlanItem[];
  storageKey: string;
};

/**
 * Plano de 30 dias como checklist, com progresso salvo no navegador.
 */
export function PlanChecklist({ weeks, storageKey }: PlanChecklistProps) {
  const [done, setDone] = useState<Set<string>>(() => new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) setDone(new Set(JSON.parse(stored) as string[]));
    } catch {
      // progresso é opcional; falhas de storage não devem quebrar o relatório
    }
    setLoaded(true);
  }, [storageKey]);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify([...done]));
    } catch {
      // ignora cota indisponível
    }
  }, [done, loaded, storageKey]);

  const toggle = (task: string) => {
    setDone((previous) => {
      const next = new Set(previous);
      if (!next.delete(task)) next.add(task);
      return next;
    });
  };

  const total = weeks.reduce((count, week) => count + week.tasks.length, 0);
  const completed = weeks.reduce(
    (count, week) => count + week.tasks.filter((task) => done.has(task)).length,
    0,
  );
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/8">
          <div
            className="h-full rounded-full bg-brand transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="shrink-0 text-xs tabular-nums text-white/45">
          {completed}/{total} concluídas
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {weeks.map((week) => (
          <div
            key={week.week}
            className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4"
          >
            <p className="text-[11px] font-bold uppercase tracking-wide text-brand-bright">
              Semana {week.week}
            </p>
            <p className="mt-1 text-sm font-semibold text-white/90">{week.focus}</p>
            <ul className="mt-3 space-y-2">
              {week.tasks.map((task) => {
                const checked = done.has(task);
                return (
                  <li key={task}>
                    <label className="flex cursor-pointer items-start gap-2.5 text-sm">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(task)}
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[var(--color-brand)]"
                      />
                      <span
                        className={
                          checked
                            ? "text-white/30 line-through"
                            : "text-white/60 transition hover:text-white/80"
                        }
                      >
                        {task}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
