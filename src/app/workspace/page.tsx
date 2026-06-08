import Link from "next/link";

/**
 * Painel público — atalhos para ferramentas SEO (sem login).
 */
export default function WorkspaceDashboardPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold">Painel SEuO</h1>
      <p className="mt-2 text-sm text-white/55">
        Acesso livre às ferramentas. Seus relatórios recentes ficam salvos no navegador
        (sessionStorage) após cada análise.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link
          href="/"
          className="inline-flex rounded-xl border border-brand/40 bg-brand/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand/30"
        >
          Análise comparativa SEO
        </Link>
        <Link
          href="/google-position-checker"
          className="inline-flex rounded-xl border border-brand/35 bg-brand/15 px-5 py-3 text-sm font-semibold text-white transition hover:border-brand/50 hover:bg-brand/25"
        >
          Google Position Checker
        </Link>
      </div>

      <section className="mt-10 rounded-xl border border-sidebar-border bg-sidebar/50 p-5">
        <h2 className="text-lg font-semibold text-white/85">Histórico</h2>
        <p className="mt-2 text-sm text-white/50">
          Abra novamente um relatório pelo link{" "}
          <code className="rounded bg-black/30 px-1 text-brand-bright">/compare?id=...</code>{" "}
          ou use o comparador após nova análise na home.
        </p>
      </section>
    </div>
  );
}
