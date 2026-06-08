"use client";

import { motion } from "framer-motion";

import { GooglePositionShortcut } from "~/app/_components/seo/google-position-shortcut";

const features = [
  "Core Web Vitals e Lighthouse",
  "Comparativo visual em tempo real",
  "Insights com IA",
  "Plano SEO de 30 dias",
];

/**
 * Hero animado da landing SEO (client — Framer Motion).
 */
export function SeoLandingHero() {
  return (
    <div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-xs font-bold uppercase tracking-[0.25em] text-brand-bright"
      >
        Growth intelligence
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mt-4 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.25rem]"
      >
        Domine o SEO{" "}
        <span className="text-brand-bright">frente aos concorrentes</span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-6 max-w-lg text-lg leading-relaxed text-white/55"
      >
        Análise comparativa premium: técnico, performance, conteúdo, autoridade e UX.
        Insights acionáveis em segundos.
      </motion.p>
      <motion.ul
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="mt-8 flex flex-col gap-2"
      >
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm text-white/60">
            <span className="text-brand-bright" aria-hidden>
              ✓
            </span>
            {f}
          </li>
        ))}
      </motion.ul>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 flex flex-wrap items-center gap-3"
      >
        <GooglePositionShortcut variant="checker" />
        <GooglePositionShortcut variant="compact" />
      </motion.div>

      <div className="mt-12 hidden lg:block">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Métricas", value: "40+" },
            { label: "Domínios", value: "3" },
            { label: "Categorias", value: "5" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-sidebar-border bg-sidebar/60 px-4 py-3"
            >
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-white/40">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
