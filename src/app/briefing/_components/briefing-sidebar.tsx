"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { SECTION_NAV } from "~/features/content-briefing/constants/default-briefing";
import { useBriefing } from "~/features/content-briefing/context/briefing-context";

/**
 * Sidebar fixa de navegação + métricas rápidas.
 */
export function BriefingSidebar() {
  const { briefing, progress, saveVersion, restoreVersion } = useBriefing();
  const [active, setActive] = useState("meta");

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (a.boundingClientRect.top > b.boundingClientRect.top ? 1 : -1));
        if (visible[0]?.target.id) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 },
    );
    for (const s of SECTION_NAV) {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    }
    return () => obs.disconnect();
  }, []);

  return (
    <aside className="no-print flex w-full shrink-0 flex-col gap-4 lg:sticky lg:top-4 lg:w-56 xl:w-60">
      <Link
        href="/"
        className="text-xs text-white/45 hover:text-brand-bright"
      >
        ← SEuO SEO
      </Link>
      <p className="text-xs font-bold uppercase tracking-wider text-brand-bright">
        Briefing GEO + SEO
      </p>

      <nav className="flex flex-row flex-wrap gap-1 lg:flex-col" aria-label="Seções">
        {SECTION_NAV.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={
              active === item.id
                ? "rounded-lg border border-brand/35 bg-brand/15 px-3 py-2 text-sm font-medium text-white"
                : "rounded-lg px-3 py-2 text-sm text-white/55 transition hover:bg-white/5 hover:text-white"
            }
          >
            <span className="mr-1.5 opacity-60">{item.icon}</span>
            {item.label}
          </a>
        ))}
      </nav>

      <div className="rounded-xl border border-sidebar-border bg-black/20 p-3 text-xs">
        <p className="font-semibold text-white/70">Dashboard</p>
        <ul className="mt-2 space-y-1.5 text-white/50">
          <li>GEO: {briefing.geoSeo.geoScore}/100</li>
          <li>SEO: {briefing.geoSeo.seoScore}/100</li>
          <li>Checklist: {progress}%</li>
          <li>Links: {briefing.internalLinks.length}</li>
          <li>FAQ: {briefing.faq.length}</li>
        </ul>
        <p className="mt-3 border-t border-white/10 pt-2 text-[10px] text-white/35">
          Integrações (demo): Search Console · ChatGPT
        </p>
      </div>

      <div className="rounded-xl border border-sidebar-border bg-black/20 p-3">
        <p className="text-xs font-semibold text-white/70">Versões</p>
        <button
          type="button"
          onClick={() => saveVersion(`v${briefing.versions.length + 1}`)}
          className="mt-2 w-full rounded-lg border border-white/10 py-1.5 text-xs hover:bg-white/5"
        >
          Salvar versão
        </button>
        <ul className="mt-2 max-h-28 space-y-1 overflow-auto">
          {briefing.versions.map((v) => (
            <li key={v.id}>
              <button
                type="button"
                onClick={() => restoreVersion(v.id)}
                className="w-full truncate text-left text-[10px] text-white/45 hover:text-brand-bright"
              >
                {v.label} · {new Date(v.savedAt).toLocaleString("pt-BR")}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-sidebar-border bg-black/20 p-3">
        <p className="text-xs font-semibold text-white/70">Comentários</p>
        <CommentBox />
      </div>
    </aside>
  );
}

function CommentBox() {
  const { briefing, updateBriefing } = useBriefing();
  const [text, setText] = useState("");
  const [author, setAuthor] = useState("");

  const add = () => {
    if (!text.trim()) return;
    updateBriefing({
      comments: [
        {
          id: crypto.randomUUID(),
          author: author.trim() || "Anônimo",
          text: text.trim(),
          createdAt: new Date().toISOString(),
        },
        ...briefing.comments,
      ],
    });
    setText("");
  };

  return (
    <div className="mt-2 space-y-2">
      <input
        className="w-full rounded border border-white/10 bg-black/30 px-2 py-1 text-[10px] text-white"
        placeholder="Seu nome"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
      />
      <textarea
        className="w-full rounded border border-white/10 bg-black/30 px-2 py-1 text-[10px] text-white"
        rows={2}
        placeholder="Comentário…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        type="button"
        onClick={add}
        className="w-full rounded bg-brand/25 py-1 text-[10px] font-semibold text-white"
      >
        Adicionar
      </button>
      <ul className="max-h-24 space-y-1 overflow-auto">
        {briefing.comments.map((c) => (
          <li key={c.id} className="text-[10px] text-white/45">
            <strong className="text-white/65">{c.author}:</strong> {c.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
