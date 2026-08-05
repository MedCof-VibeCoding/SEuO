"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  analyzeArticlesSchema,
  type AnalyzeArticlesFormInput,
  type AnalyzeArticlesFormValues,
} from "~/features/seo/schemas/article-input";
import {
  saveComparativeAnalysisHistory,
} from "~/features/seo/lib/comparative-analysis-history";
import type { SeoAnalysisReport } from "~/features/seo/types/analysis";

type DomainInputFormProps = {
  compact?: boolean;
  onAnalysisComplete?: (report: SeoAnalysisReport) => void;
};

/**
 * Formulário de URLs — análise comparativa editorial com OpenAI.
 */
const ERROR_HINTS: Record<string, string> = {
  OPENAI_NOT_CONFIGURED:
    "Salve o .env com OPENAI_API_KEY e reinicie o servidor (pnpm dev).",
  OPENAI_QUOTA_EXCEEDED:
    "Cota OpenAI esgotada. Verifique billing em platform.openai.com/account/billing.",
  OPENAI_AUTH_ERROR: "Chave inválida. Gere uma nova em platform.openai.com/api-keys",
  GEMINI_NOT_CONFIGURED:
    "Salve o .env com OPENAI_API_KEY e reinicie o servidor (pnpm dev).",
  GEMINI_QUOTA_EXCEEDED:
    "Cota da API esgotada. Aguarde e tente novamente.",
  GEMINI_AUTH_ERROR: "Chave de API inválida.",
  AI_INVALID_JSON: "A IA retornou JSON inválido. Tente novamente em alguns segundos.",
  AI_SCHEMA_MISMATCH: "A IA retornou formato inesperado. Tente novamente.",
};

export function DomainInputForm({ compact = false, onAnalysisComplete }: DomainInputFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AnalyzeArticlesFormInput, unknown, AnalyzeArticlesFormValues>({
    resolver: zodResolver(analyzeArticlesSchema),
    defaultValues: {
      targetUrl: "",
      competitor1: "",
      competitor2: "",
      mainKeyword: "",
      niche: "",
      objective: "",
    },
  });

  const onSubmit = useCallback(
    async (values: AnalyzeArticlesFormValues) => {
      setLoading(true);
      setSubmitError(null);
      try {
        const res = await fetch("/api/seo/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetUrl: values.targetUrl,
            competitor1: values.competitor1 ?? "",
            competitor2: values.competitor2 ?? "",
            mainKeyword: values.mainKeyword ?? "",
            niche: values.niche ?? "",
            objective: values.objective ?? "",
          }),
        });

        let data: {
          report?: SeoAnalysisReport;
          error?: string;
          message?: string;
        } = {};

        try {
          data = (await res.json()) as typeof data;
        } catch {
          setSubmitError(`Erro ${res.status}: resposta inválida do servidor.`);
          toast.error("Resposta inválida do servidor.");
          return;
        }

        if (!res.ok || !data.report) {
          const code = data.error ?? `HTTP_${res.status}`;
          const message =
            data.message ??
            ERROR_HINTS[code] ??
            `Não foi possível concluir a análise (${code}).`;

          setSubmitError(message);
          toast.error(message, { duration: 8000 });
          return;
        }

        console.log(JSON.stringify(data.report, null, 2));
        sessionStorage.setItem(`seo-report-${data.report.id}`, JSON.stringify(data.report));
        saveComparativeAnalysisHistory(data.report);
        onAnalysisComplete?.(data.report);
        toast.success("Análise comparativa concluída!");
        router.push(`/compare?id=${data.report.id}`);
      } catch {
        const msg = "Erro de conexão. Verifique se o servidor está rodando (pnpm dev).";
        setSubmitError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    },
    [router, onAnalysisComplete],
  );

  const inputClass =
    "w-full rounded-xl border border-white/15 bg-black/25 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none ring-brand/40 transition focus:border-brand/50 focus:ring-2 disabled:opacity-50";

  return (
    <motion.form
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      onSubmit={(e) => void handleSubmit(onSubmit)(e)}
      className={compact ? "flex flex-col gap-4" : "flex flex-col gap-5"}
    >
      <div>
        <label htmlFor="targetUrl" className="mb-1.5 block text-xs font-semibold text-white/60">
          URL do artigo-alvo
        </label>
        <input
          id="targetUrl"
          placeholder="https://seublog.com.br/blog/seu-artigo"
          autoComplete="url"
          disabled={loading}
          className={inputClass}
          {...register("targetUrl")}
        />
        {errors.targetUrl ? (
          <p className="mt-1 text-xs text-brand-bright" role="alert">
            {errors.targetUrl.message}
          </p>
        ) : null}
      </div>

      <div className={compact ? "grid gap-4" : "grid gap-4 sm:grid-cols-2"}>
        <div>
          <label htmlFor="competitor1" className="mb-1.5 block text-xs font-semibold text-white/60">
            Concorrente 1 <span className="text-white/35">(opcional)</span>
          </label>
          <input
            id="competitor1"
            placeholder="https://concorrente.com/pagina"
            disabled={loading}
            className={inputClass}
            {...register("competitor1")}
          />
        </div>
        <div>
          <label htmlFor="competitor2" className="mb-1.5 block text-xs font-semibold text-white/60">
            Concorrente 2 <span className="text-white/35">(opcional)</span>
          </label>
          <input
            id="competitor2"
            placeholder="https://..."
            disabled={loading}
            className={inputClass}
            {...register("competitor2")}
          />
        </div>
      </div>

      {errors.competitor1 ? (
        <p className="text-xs text-brand-bright" role="alert">
          {errors.competitor1.message}
        </p>
      ) : null}
      {errors.competitor2 ? (
        <p className="text-xs text-brand-bright" role="alert">
          {errors.competitor2.message}
        </p>
      ) : null}

      <div>
        <label htmlFor="mainKeyword" className="mb-1.5 block text-xs font-semibold text-white/60">
          Keyword principal <span className="text-white/35">(opcional)</span>
        </label>
        <input
          id="mainKeyword"
          placeholder="concurso médico juazeiro 2026"
          disabled={loading}
          className={inputClass}
          {...register("mainKeyword")}
        />
      </div>

      <div className={compact ? "grid gap-4" : "grid gap-4 sm:grid-cols-2"}>
        <div>
          <label htmlFor="niche" className="mb-1.5 block text-xs font-semibold text-white/60">
            Nicho <span className="text-white/35">(opcional)</span>
          </label>
          <input
            id="niche"
            placeholder="Ex.: educação médica"
            disabled={loading}
            className={inputClass}
            {...register("niche")}
          />
        </div>
        <div>
          <label htmlFor="objective" className="mb-1.5 block text-xs font-semibold text-white/60">
            Objetivo <span className="text-white/35">(opcional)</span>
          </label>
          <input
            id="objective"
            placeholder="Ex.: gerar inscrições qualificadas"
            disabled={loading}
            className={inputClass}
            {...register("objective")}
          />
        </div>
      </div>

      {submitError ? (
        <div
          role="alert"
          className="rounded-xl border border-brand/40 bg-brand/10 px-4 py-3 text-sm text-brand-bright"
        >
          <p className="font-semibold">Não foi possível analisar</p>
          <p className="mt-1 text-white/70">{submitError}</p>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="group relative w-full overflow-hidden rounded-xl border border-brand/45 bg-brand/35 py-3.5 text-sm font-bold text-white shadow-[0_0_32px_-8px_var(--color-brand)] transition hover:bg-brand/50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-10"
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Coletando páginas · 3 etapas IA…
            </>
          ) : (
            "Analisar artigo"
          )}
        </span>
      </button>
    </motion.form>
  );
}
