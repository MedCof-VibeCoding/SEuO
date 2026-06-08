"use client";

import { motion } from "framer-motion";
import { Radar } from "lucide-react";

/**
 * Hero do Google Position Checker.
 */
export function GpcHero() {
  return (
    <section className="relative text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-brand/35 bg-brand/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-bright"
      >
        <Radar className="h-3.5 w-3.5" aria-hidden />
        Google Position Checker
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl"
      >
        Descubra a posição do seu site{" "}
        <span className="text-brand-bright">
          no Google
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/55 sm:text-lg"
      >
        Informe a URL da página e a palavra-chave alvo. Os dados vêm do{" "}
        <strong className="font-medium text-white/70">Google Search Console</strong> (posição média,
        impressões, CTR e queries da mesma página).
      </motion.p>
    </section>
  );
}
