"use client";



import { useSession } from "next-auth/react";



import { redirectToGoogleSignIn } from "~/features/auth/google-sign-in";

import { BarChart3, Loader2 } from "lucide-react";

import { useEffect, useState } from "react";



type GscStatus = {

  connected: boolean;

  signedIn: boolean;

  properties?: string[];

};



/**

 * Banner para conectar Google Search Console antes da consulta.

 */

export function GscConnectBanner() {

  const { data: session, status } = useSession();

  const [gsc, setGsc] = useState<GscStatus | null>(null);

  const [loading, setLoading] = useState(true);



  useEffect(() => {

    if (status === "loading") return;

    setLoading(true);

    void fetch("/api/seo/search-console/status")

      .then((r) => r.json())

      .then((data: GscStatus) => setGsc(data))

      .finally(() => setLoading(false));

  }, [status, session?.gscConnected]);



  if (loading) {

    return (

      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/50">

        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />

        Verificando Search Console…

      </div>

    );

  }



  if (gsc?.connected) {

    return (

      <div className="rounded-xl border border-brand/25 bg-brand/10 px-4 py-3 text-sm text-white/90">

        <span className="flex items-center gap-2 font-semibold text-brand-bright">

          <BarChart3 className="h-4 w-4" aria-hidden />

          Google Search Console conectado

        </span>

        {gsc.properties && gsc.properties.length > 0 ? (

          <p className="mt-1 text-xs text-white/55">

            {gsc.properties.length} propriedade(s) disponível(is)

          </p>

        ) : null}

      </div>

    );

  }



  return (

    <div className="rounded-xl border border-brand/30 bg-brand/5 px-4 py-4 text-sm">

      <p className="font-semibold text-white">

        Dados reais do Google Search Console

      </p>

      <p className="mt-1 text-white/55">

        {gsc?.signedIn

          ? "Sua conta Google ainda não autorizou o Search Console. Saia e entre de novo com Google para liberar o acesso."

          : "Entre com Google para consultar posição, impressões e palavras-chave da sua propriedade verificada."}

      </p>

      <button

        type="button"

        onClick={() => void redirectToGoogleSignIn("/google-position-checker")}

        className="mt-3 rounded-lg border border-brand/40 bg-brand/20 px-4 py-2 text-xs font-bold text-white transition hover:bg-brand/30"

      >

        {gsc?.signedIn ? "Reconectar Google" : "Entrar com Google"}

      </button>

    </div>

  );

}


