"use client";



import { motion } from "framer-motion";

import { Loader2, Search } from "lucide-react";

import { useEffect, useState } from "react";



type LoadingProgressProps = {

  active: boolean;

  keyword?: string;

};



const STEPS = [

  "Conectando à SERP simulada…",

  "Buscando resultados orgânicos…",

  "Comparando URL com top 100…",

  "Calculando métricas SEO…",

];



/**

 * Barra de progresso animada durante a consulta de posição.

 */

export function LoadingProgress({ active, keyword }: LoadingProgressProps) {

  const [progress, setProgress] = useState(0);

  const [stepIndex, setStepIndex] = useState(0);



  useEffect(() => {

    if (!active) {

      setProgress(0);

      setStepIndex(0);

      return;

    }



    setProgress(8);

    const interval = setInterval(() => {

      setProgress((p) => {

        if (p >= 92) return p;

        return p + 4 + Math.random() * 6;

      });

      setStepIndex((i) => (i + 1) % STEPS.length);

    }, 480);



    return () => clearInterval(interval);

  }, [active]);



  if (!active) return null;



  return (

    <motion.div

      initial={{ opacity: 0, y: 8 }}

      animate={{ opacity: 1, y: 0 }}

      exit={{ opacity: 0 }}

      className="rounded-2xl border border-brand/25 bg-gradient-to-br from-brand/10 to-black/40 p-6"

      role="status"

      aria-live="polite"

      aria-busy="true"

    >

      <div className="flex items-center gap-3">

        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-brand/30 bg-brand/10">

          <Loader2 className="h-5 w-5 animate-spin text-brand-bright" />

        </div>

        <div>

          <p className="text-sm font-semibold text-white">Consultando Search Console</p>

          <p className="text-xs text-white/45">

            {keyword ? `Palavra-chave: “${keyword}”` : STEPS[stepIndex]}

          </p>

        </div>

        <Search className="ml-auto h-5 w-5 text-brand-bright/60" aria-hidden />

      </div>



      <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/8">

        <motion.div

          className="h-full rounded-full bg-gradient-to-r from-brand via-brand-bright to-brand-bright"

          initial={{ width: "0%" }}

          animate={{ width: `${Math.min(progress, 95)}%` }}

          transition={{ ease: "easeOut", duration: 0.35 }}

        />

      </div>

      <p className="mt-2 text-right text-[10px] font-mono text-brand-bright/80">

        {Math.round(Math.min(progress, 95))}%

      </p>

      <p className="mt-3 text-xs text-white/40">{STEPS[stepIndex]}</p>

    </motion.div>

  );

}


