"use client";

import { motion } from "framer-motion";

import { useBriefing } from "~/features/content-briefing/context/briefing-context";
import type { BriefingStatus } from "~/features/content-briefing/types";

import { BriefingInput, BriefingSelect } from "./briefing-ui";

const STATUS_OPTIONS: { value: BriefingStatus; label: string }[] = [
  { value: "draft", label: "Rascunho" },
  { value: "in_review", label: "Em revisão" },
  { value: "approved", label: "Aprovado" },
  { value: "published", label: "Publicado" },
];

/**
 * Header principal do briefing com ações globais.
 */
export function BriefingHeader() {
  const {
    briefing,
    updateBriefing,
    lastSaved,
    progress,
    duplicateBriefing,
    generateWithAi,
    exportMarkdown,
    exportPdf,
    toggleDarkMode,
  } = useBriefing();

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-20 rounded-2xl border border-sidebar-border bg-sidebar/95 p-4 backdrop-blur-md sm:p-5"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <BriefingInput
            label="Projeto / conteúdo"
            value={briefing.projectName}
            onChange={(v) => updateBriefing({ projectName: v })}
          />
          <BriefingInput
            label="Palavra-chave principal"
            value={briefing.mainKeyword}
            onChange={(v) => updateBriefing({ mainKeyword: v })}
          />
          <BriefingSelect
            label="Status"
            value={briefing.status}
            onChange={(v) => updateBriefing({ status: v })}
            options={STATUS_OPTIONS}
          />
          <BriefingInput
            label="Responsável"
            value={briefing.owner}
            onChange={(v) => updateBriefing({ owner: v })}
          />
        </div>
        <p className="text-xs text-white/45 lg:pt-6">
          Criado {new Date(briefing.createdAt).toLocaleDateString("pt-BR")}
          {lastSaved ? ` · salvo ${lastSaved}` : null}
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="h-2 flex-1 min-w-[120px] max-w-[200px] overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-brand transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs font-medium text-white/55">{progress}% checklist</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={toggleDarkMode}
            className="rounded-lg border border-white/12 px-3 py-1.5 text-xs text-white/70 hover:bg-white/5"
          >
            Tema
          </button>
          <button
            type="button"
            onClick={exportMarkdown}
            className="rounded-lg border border-white/12 px-3 py-1.5 text-xs text-white/70 hover:bg-white/5"
          >
            Exportar MD
          </button>
          <button
            type="button"
            onClick={exportPdf}
            className="rounded-lg border border-white/12 px-3 py-1.5 text-xs text-white/70 hover:bg-white/5"
          >
            Exportar PDF
          </button>
          <button
            type="button"
            onClick={duplicateBriefing}
            className="rounded-lg border border-white/12 px-3 py-1.5 text-xs text-white/70 hover:bg-white/5"
          >
            Duplicar
          </button>
          <button
            type="button"
            onClick={generateWithAi}
            className="rounded-lg border border-brand/45 bg-brand/30 px-4 py-1.5 text-xs font-bold text-white hover:bg-brand/45"
          >
            Gerar briefing com IA
          </button>
        </div>
      </div>
    </motion.header>
  );
}
