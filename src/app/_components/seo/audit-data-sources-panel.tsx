import { CheckCircle2, Database } from "lucide-react";

const VERIFIED_DATA = [
  "HTML e metadados das URLs informadas",
  "Estrutura H1/H2/H3, extensão e cobertura do conteúdo",
  "FAQ, Schema, links, imagens, tabelas e listas detectáveis no HTML",
  "Search Console da URL alvo, quando a conta Google está conectada",
];

/**
 * Explica quais evidências sustentam a auditoria comparativa.
 */
export function AuditDataSourcesPanel() {
  return (
    <div className="rounded-xl border border-sky-400/20 bg-sky-400/[0.05] p-5">
      <div className="flex items-start gap-3">
        <Database className="mt-0.5 h-5 w-5 shrink-0 text-sky-300" aria-hidden />
        <div>
          <h3 className="text-sm font-semibold text-white">Base da auditoria</h3>
          <p className="mt-1 text-sm leading-relaxed text-white/55">
            Este relatório usa apenas dados observados nas páginas coletadas e no Search Console,
            quando disponível.
          </p>
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {VERIFIED_DATA.map((item) => (
          <li key={item} className="flex gap-2 text-sm text-white/65">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
