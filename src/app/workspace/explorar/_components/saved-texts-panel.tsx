"use client";

import { useState } from "react";

import { api } from "~/trpc/react";

export function SavedTextsPanel() {
  const utils = api.useUtils();
  const [content, setContent] = useState("");
  const listQuery = api.savedText.list.useQuery();
  const createMutation = api.savedText.create.useMutation({
    onSuccess: async () => {
      await utils.savedText.list.invalidate();
      setContent("");
    },
  });

  const items = listQuery.data ?? [];

  return (
    <div className="mt-8 space-y-8">
      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          const trimmed = content.trim();
          if (!trimmed) return;
          createMutation.mutate({ content: trimmed });
        }}
      >
        <label htmlFor="saved-text" className="text-sm font-medium text-white/70">
          Salvar um texto
        </label>
        <textarea
          id="saved-text"
          name="content"
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Digite algo e clique em salvar…"
          className="resize-y rounded-lg border border-sidebar-border bg-white/5 px-4 py-3 text-white placeholder:text-white/35 focus:border-brand/50 focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
        <button
          type="submit"
          disabled={
            createMutation.isPending || content.trim().length === 0
          }
          className="w-fit rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-bright disabled:cursor-not-allowed disabled:opacity-40"
        >
          {createMutation.isPending ? "Salvando…" : "Salvar no banco"}
        </button>
        {createMutation.isError ? (
          <p className="text-sm text-brand-bright" role="alert">
            Não foi possível salvar. Verifique o MongoDB e o .env.
          </p>
        ) : null}
      </form>

      <section aria-labelledby="list-heading">
        <h2
          id="list-heading"
          className="text-lg font-semibold text-white/90"
        >
          Textos salvos ({items.length})
        </h2>
        {listQuery.isLoading ? (
          <p className="mt-3 text-sm text-white/50">Carregando…</p>
        ) : items.length === 0 ? (
          <p className="mt-3 text-sm text-white/50">
            Nenhum texto ainda. Salve o primeiro acima.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="rounded-lg border border-sidebar-border bg-white/5 px-4 py-3"
              >
                <p className="whitespace-pre-wrap text-white/90">
                  {item.content}
                </p>
                <p className="mt-2 text-xs text-white/45">
                  {item.createdAt
                    ? new Intl.DateTimeFormat("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      }).format(new Date(item.createdAt))
                    : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
