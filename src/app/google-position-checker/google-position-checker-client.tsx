"use client";

import { AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { CheckForm } from "~/app/google-position-checker/_components/check-form";
import { GscConnectBanner } from "~/app/google-position-checker/_components/gsc-connect-banner";
import { GpcFooter } from "~/app/google-position-checker/_components/gpc-footer";
import { GpcHero } from "~/app/google-position-checker/_components/gpc-hero";
import { HistoryPanel } from "~/app/google-position-checker/_components/history-panel";
import { LoadingProgress } from "~/app/google-position-checker/_components/loading-progress";
import { ResultDashboard } from "~/app/google-position-checker/_components/result-dashboard";
import type { GooglePositionCheckFormValues } from "~/features/seo/schemas/google-position-check-input";
import {
  loadGooglePositionHistory,
  saveGooglePositionHistory,
} from "~/features/seo/lib/google-position-history";
import type {
  GooglePositionCheckResult,
  GooglePositionHistoryEntry,
} from "~/features/seo/types/google-position-check";

type ApiResponse = {
  result?: GooglePositionCheckResult;
  message?: string;
  error?: string;
};

/**
 * Cliente da landing Google Position Checker.
 */
export function GooglePositionCheckerClient() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GooglePositionCheckResult | null>(null);
  const [history, setHistory] = useState<GooglePositionHistoryEntry[]>([]);
  const [formDefaults, setFormDefaults] = useState({ url: "", keyword: "" });
  const [pendingKeyword, setPendingKeyword] = useState("");

  useEffect(() => {
    setHistory(loadGooglePositionHistory());
  }, []);

  const runCheck = useCallback(async (values: GooglePositionCheckFormValues) => {
    setLoading(true);
    setResult(null);
    setPendingKeyword(values.keyword.trim());

    try {
      const res = await fetch("/api/seo/google-position-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: values.url.trim(),
          keyword: values.keyword.trim(),
        }),
      });

      const data = (await res.json()) as ApiResponse;
      if (!res.ok || !data.result) {
        if (data.error === "GSC_AUTH_REQUIRED" || data.error === "GSC_TOKEN_MISSING") {
          toast.error(data.message ?? "Conecte o Google Search Console.");
        } else {
          toast.error(data.message ?? "Não foi possível verificar a posição.");
        }
        return;
      }

      setResult(data.result);
      console.log(JSON.stringify(data.result, null, 2));
      const updated = saveGooglePositionHistory(data.result);
      setHistory(updated);
      toast.success(
        data.result.found
          ? `Posição #${data.result.position} encontrada`
          : "Consulta concluída — fora do top 100",
      );
    } catch {
      toast.error("Erro de conexão. Verifique se o servidor está ativo.");
    } finally {
      setLoading(false);
      setPendingKeyword("");
    }
  }, []);

  const handleHistorySelect = useCallback((entry: GooglePositionHistoryEntry) => {
    setFormDefaults({ url: entry.url, keyword: entry.keyword });
    void runCheck({ url: entry.url, keyword: entry.keyword });
    document.getElementById("gpc-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [runCheck]);

  return (
    <div className="relative mx-auto max-w-4xl px-4 py-12 pb-8 sm:px-6 sm:py-16">
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[90%] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse, rgba(34,211,238,0.2), rgba(52,211,153,0.08), transparent 70%)",
        }}
        aria-hidden
      />

      <GpcHero />

      <div className="mt-10 space-y-8">
        <div className="rounded-2xl border border-white/12 bg-gradient-to-b from-white/[0.06] to-black/40 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-sm sm:p-8">
          <div className="mb-6">
            <GscConnectBanner />
          </div>
          <CheckForm
            loading={loading}
            onSubmit={runCheck}
            defaultUrl={formDefaults.url}
            defaultKeyword={formDefaults.keyword}
            key={`${formDefaults.url}-${formDefaults.keyword}`}
          />
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <LoadingProgress key="loading" active keyword={pendingKeyword} />
          ) : null}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {result && !loading ? (
            <div
              key="result"
              className="rounded-2xl border border-brand/20 bg-black/30 p-6 sm:p-8"
            >
              <ResultDashboard result={result} />
            </div>
          ) : null}
        </AnimatePresence>

        <HistoryPanel entries={history} onSelect={handleHistorySelect} />
      </div>

      <GpcFooter />
    </div>
  );
}
