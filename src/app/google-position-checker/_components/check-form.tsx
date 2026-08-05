"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Link2, Search } from "lucide-react";
import { useForm } from "react-hook-form";

import {
  googlePositionCheckSchema,
  type GooglePositionCheckFormValues,
} from "~/features/seo/schemas/google-position-check-input";

type CheckFormProps = {
  loading: boolean;
  onSubmit: (values: GooglePositionCheckFormValues) => void;
  defaultUrl?: string;
  defaultKeyword?: string;
};

const inputClass =
  "w-full rounded-xl border border-white/12 bg-black/30 px-4 py-3 pl-11 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-brand/50 focus:ring-2 focus:ring-brand/25";

/**
 * Formulário do Google Position Checker (URL obrigatória; palavra-chave opcional).
 */
export function CheckForm({
  loading,
  onSubmit,
  defaultUrl = "",
  defaultKeyword = "",
}: CheckFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GooglePositionCheckFormValues>({
    resolver: zodResolver(googlePositionCheckSchema),
    defaultValues: { url: defaultUrl, keyword: defaultKeyword },
  });

  return (
    <form
      onSubmit={(e) => void handleSubmit(onSubmit)(e)}
      className="space-y-4"
      id="gpc-form"
    >
      <div>
        <label htmlFor="gpc-url" className="mb-1.5 block text-xs font-semibold text-white/65">
          URL da página
        </label>
        <div className="relative">
          <Link2
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-bright/70"
            aria-hidden
          />
          <input
            id="gpc-url"
            type="url"
            autoComplete="url"
            placeholder="https://seusite.com.br/blog/guia-seo"
            className={inputClass}
            disabled={loading}
            {...register("url")}
          />
        </div>
        {errors.url ? (
          <p className="mt-1.5 text-xs text-brand-bright" role="alert">
            {errors.url.message}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="gpc-keyword" className="mb-1.5 block text-xs font-semibold text-white/65">
          Palavra-chave <span className="font-normal text-white/40">(opcional)</span>
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-bright/70"
            aria-hidden
          />
          <input
            id="gpc-keyword"
            type="text"
            autoComplete="off"
            placeholder="Deixe em branco para detectar automaticamente"
            className={inputClass}
            disabled={loading}
            {...register("keyword")}
          />
        </div>
        <p className="mt-1.5 text-[11px] leading-relaxed text-white/40">
          Sem palavra-chave, usamos a query com mais impressões no Search Console para esta URL.
        </p>
        {errors.keyword ? (
          <p className="mt-1.5 text-xs text-brand-bright" role="alert">
            {errors.keyword.message}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="group relative w-full overflow-hidden rounded-xl border border-brand/45 bg-brand/35 py-3.5 text-sm font-bold text-white shadow-[0_0_32px_-8px_var(--color-brand)] transition hover:bg-brand/50 hover:shadow-[0_0_40px_-6px_var(--color-brand-bright)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          <Search className="h-4 w-4" aria-hidden />
          {loading ? "Verificando…" : "Verificar posição"}
        </span>
        <span
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition group-hover:opacity-100"
          aria-hidden
        />
      </button>
    </form>
  );
}
