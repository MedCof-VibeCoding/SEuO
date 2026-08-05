"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clipboard,
  Download,
  FileText,
  Loader2,
  Printer,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useCallback, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

import { SeoPanel } from "~/app/_components/seo/seo-panel";

type QuickWinForm = {
  mainKeyword: string;
  secondaryTerms: string;
  company: string;
  site: string;
  objective: string;
  audience: string;
  searchVolume: string;
  difficulty: string;
  currentUrl: string;
  additionalContext: string;
};

const EMPTY_FORM: QuickWinForm = {
  mainKeyword: "",
  secondaryTerms: "",
  company: "Grupo MedCof",
  site: "https://www.grupomedcof.com.br",
  objective: "Gerar tráfego qualificado e conversões no blog MedCof",
  audience: "Médicos e estudantes de medicina em preparação para residência",
  searchVolume: "",
  difficulty: "",
  currentUrl: "",
  additionalContext: "",
};

const INPUT_CLASS =
  "w-full rounded-xl border border-white/12 bg-black/25 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-brand/55 focus:ring-2 focus:ring-brand/25";

/**
 * Formulário e pauta QuickWin no padrão MedCof/SearchHub.
 */
export function QuickWinsPageClient() {
  const [form, setForm] = useState<QuickWinForm>(EMPTY_FORM);
  const [markdown, setMarkdown] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = useCallback(
    (field: keyof QuickWinForm, value: string) => {
      setForm((current) => ({ ...current, [field]: value }));
    },
    [],
  );

  const generate = useCallback(async () => {
    if (!form.mainKeyword.trim()) {
      toast.error("Informe a palavra-chave principal.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/seo/quick-win", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await response.json()) as {
        markdown?: string;
        message?: string;
      };
      if (!response.ok || !data.markdown) {
        toast.error(data.message ?? "Não foi possível gerar o Quick Win.");
        return;
      }
      setMarkdown(data.markdown);
      toast.success("Pauta QuickWin gerada com sucesso.");
      requestAnimationFrame(() => {
        document.getElementById("quick-win-report")?.scrollIntoView({ behavior: "smooth" });
      });
    } catch {
      toast.error("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  }, [form]);

  const copyReport = useCallback(async () => {
    await navigator.clipboard.writeText(markdown);
    toast.success("Pauta copiada em Markdown.");
  }, [markdown]);

  const downloadReport = useCallback(() => {
    const slug = form.mainKeyword
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `quick-win-${slug || "seo"}.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  }, [form.mainKeyword, markdown]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 pb-24 sm:px-6">
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-3xl text-center"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-brand/35 bg-brand/15">
          <Sparkles className="h-6 w-6 text-brand-bright" aria-hidden />
        </div>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.24em] text-brand-bright">
          Padrão MedCof / SearchHub
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-5xl">
          QuickWin — Pauta SEO
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-white/55 sm:text-base">
          Gere a pauta editorial completa do artigo: snippet, H1, estrutura H2/H3 com
          instruções, termos secundários, linkagem interna e CTA MedCof — sem escrever o
          texto final.
        </p>
      </motion.header>

      <SeoPanel className="mx-auto mt-10 max-w-5xl">
        <div className="mb-6 flex items-center gap-3">
          <FileText className="h-5 w-5 text-brand-bright" aria-hidden />
          <div>
            <h2 className="font-semibold text-white">Dados da pauta</h2>
            <p className="text-xs text-white/40">
              Palavra-chave principal é obrigatória. Termos secundários são recomendados.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="Palavra-chave principal *"
            value={form.mainKeyword}
            placeholder="Ex.: cronograma de estudos residência médica"
            onChange={(value) => updateField("mainKeyword", value)}
          />
          <Field
            label="Termos secundários"
            value={form.secondaryTerms}
            placeholder="Ex.: plano de estudos, revisão espaçada, banco de questões"
            onChange={(value) => updateField("secondaryTerms", value)}
          />
          <Field
            label="Empresa"
            value={form.company}
            placeholder="Grupo MedCof"
            onChange={(value) => updateField("company", value)}
          />
          <Field
            label="Site"
            value={form.site}
            type="url"
            placeholder="https://www.grupomedcof.com.br"
            onChange={(value) => updateField("site", value)}
          />
          <Field
            label="Objetivo"
            value={form.objective}
            placeholder="Ex.: atrair leads para o curso intensivo"
            onChange={(value) => updateField("objective", value)}
          />
          <Field
            label="Público-alvo"
            value={form.audience}
            placeholder="Ex.: médicos R1 e estudantes do 6º ano"
            onChange={(value) => updateField("audience", value)}
          />
          <Field
            label="Volume de busca"
            value={form.searchVolume}
            placeholder="Somente se você tiver o dado"
            onChange={(value) => updateField("searchVolume", value)}
          />
          <Field
            label="Dificuldade"
            value={form.difficulty}
            placeholder="Somente se você tiver o dado"
            onChange={(value) => updateField("difficulty", value)}
          />
          <Field
            label="URL atual"
            value={form.currentUrl}
            type="url"
            placeholder="Deixe vazio para um novo artigo"
            onChange={(value) => updateField("currentUrl", value)}
          />
        </div>

        <label className="mt-5 block">
          <span className="mb-1.5 block text-xs font-semibold text-white/60">
            Contexto adicional
          </span>
          <textarea
            rows={4}
            value={form.additionalContext}
            onChange={(event) => updateField("additionalContext", event.target.value)}
            placeholder="Produto, diferenciais, tom de voz, restrições, páginas internas disponíveis..."
            className={INPUT_CLASS}
          />
        </label>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void generate()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-brand/50 bg-brand/35 px-6 py-3 text-sm font-bold text-white transition hover:bg-brand/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Sparkles className="h-4 w-4" aria-hidden />
            )}
            {loading ? "Gerando pauta…" : "Gerar QuickWin"}
          </button>
          <p className="text-xs text-white/35">
            Entrega só a pauta editorial — nunca o artigo completo.
          </p>
        </div>
      </SeoPanel>

      {markdown ? (
        <motion.section
          id="quick-win-report"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12"
        >
          <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-emerald-300">
              <CheckCircle2 className="h-4 w-4" aria-hidden />
              Pauta pronta para o redator
            </div>
            <div className="flex flex-wrap gap-2">
              <ActionButton icon={Clipboard} label="Copiar" onClick={() => void copyReport()} />
              <ActionButton icon={Download} label="Baixar .md" onClick={downloadReport} />
              <ActionButton icon={Printer} label="Imprimir / PDF" onClick={() => window.print()} />
              <ActionButton
                icon={RotateCcw}
                label="Novo"
                onClick={() => {
                  setMarkdown("");
                  setForm(EMPTY_FORM);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </div>
          </div>

          <article className="quick-win-report rounded-2xl border border-white/10 bg-[#0d0d14]/95 px-5 py-8 shadow-2xl sm:px-10 lg:px-14">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
          </article>
        </motion.section>
      ) : null}
    </div>
  );
}

/**
 * Campo de texto acessível do formulário.
 */
function Field({
  label,
  value,
  placeholder,
  type = "text",
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  type?: "text" | "url";
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <span className="mb-1.5 block text-xs font-semibold text-white/60">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={INPUT_CLASS}
      />
    </label>
  );
}

/**
 * Botão de ação do relatório.
 */
function ActionButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Clipboard;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-lg border border-white/12 bg-white/5 px-3 py-2 text-xs font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {label}
    </button>
  );
}
