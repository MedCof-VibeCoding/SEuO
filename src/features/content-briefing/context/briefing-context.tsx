"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import { createDefaultBriefing } from "~/features/content-briefing/constants/default-briefing";
import { fillBriefingWithAiSuggestions } from "~/features/content-briefing/lib/briefing-ai-fill";
import {
  checklistProgress,
  exportBriefingMarkdown,
  snapshotBriefing,
} from "~/features/content-briefing/lib/briefing-utils";
import type { ContentBriefing } from "~/features/content-briefing/types";

const STORAGE_KEY = "seuo-content-briefing";

type BriefingContextValue = {
  briefing: ContentBriefing;
  setBriefing: React.Dispatch<React.SetStateAction<ContentBriefing>>;
  updateBriefing: (patch: Partial<ContentBriefing> | ((b: ContentBriefing) => ContentBriefing)) => void;
  lastSaved: string | null;
  progress: number;
  duplicateBriefing: () => void;
  generateWithAi: () => void;
  exportMarkdown: () => void;
  exportPdf: () => void;
  saveVersion: (label: string) => void;
  restoreVersion: (id: string) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
};

const BriefingContext = createContext<BriefingContextValue | null>(null);

/**
 * Provider com autosave em localStorage.
 */
export function BriefingProvider({ children }: { children: ReactNode }) {
  const [briefing, setBriefing] = useState<ContentBriefing>(createDefaultBriefing);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setBriefing(JSON.parse(raw) as ContentBriefing);
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const t = setTimeout(() => {
      const next = { ...briefing, updatedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setLastSaved(new Date().toLocaleTimeString("pt-BR"));
    }, 800);
    return () => clearTimeout(t);
  }, [briefing, hydrated]);

  const updateBriefing = useCallback(
    (patch: Partial<ContentBriefing> | ((b: ContentBriefing) => ContentBriefing)) => {
      setBriefing((prev) => {
        const next = typeof patch === "function" ? patch(prev) : { ...prev, ...patch };
        return { ...next, updatedAt: new Date().toISOString() };
      });
    },
    [],
  );

  const duplicateBriefing = useCallback(() => {
    const copy = createDefaultBriefing();
    setBriefing({
      ...briefing,
      ...copy,
      id: copy.id,
      createdAt: copy.createdAt,
      projectName: `${briefing.projectName} (cópia)`,
    });
    toast.success("Briefing duplicado");
  }, [briefing]);

  const generateWithAi = useCallback(() => {
    setBriefing(fillBriefingWithAiSuggestions(briefing));
    toast.success("Briefing preenchido com sugestões de IA");
  }, [briefing]);

  const exportMarkdown = useCallback(() => {
    const md = exportBriefingMarkdown(briefing);
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `briefing-${briefing.mainKeyword || "conteudo"}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Markdown exportado");
  }, [briefing]);

  const exportPdf = useCallback(() => {
    window.print();
    toast.message("Use “Salvar como PDF” na janela de impressão");
  }, []);

  const saveVersion = useCallback(
    (label: string) => {
      const v = {
        id: crypto.randomUUID(),
        label,
        savedAt: new Date().toISOString(),
        snapshot: snapshotBriefing(briefing),
      };
      updateBriefing({
        versions: [v, ...briefing.versions].slice(0, 12),
      });
      toast.success("Versão salva");
    },
    [briefing, updateBriefing],
  );

  const restoreVersion = useCallback(
    (id: string) => {
      const v = briefing.versions.find((x) => x.id === id);
      if (!v) return;
      try {
        setBriefing(JSON.parse(v.snapshot) as ContentBriefing);
        toast.success("Versão restaurada");
      } catch {
        toast.error("Não foi possível restaurar");
      }
    },
    [briefing.versions],
  );

  const progress = useMemo(
    () => checklistProgress(briefing.checklist),
    [briefing.checklist],
  );

  const value: BriefingContextValue = {
    briefing,
    setBriefing,
    updateBriefing,
    lastSaved,
    progress,
    duplicateBriefing,
    generateWithAi,
    exportMarkdown,
    exportPdf,
    saveVersion,
    restoreVersion,
    darkMode,
    toggleDarkMode: () => setDarkMode((d) => !d),
  };

  return <BriefingContext.Provider value={value}>{children}</BriefingContext.Provider>;
}

export function useBriefing() {
  const ctx = useContext(BriefingContext);
  if (!ctx) throw new Error("useBriefing must be used within BriefingProvider");
  return ctx;
}
