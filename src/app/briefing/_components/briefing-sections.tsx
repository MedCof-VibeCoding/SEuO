"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import { CHECKLIST_ITEMS } from "~/features/content-briefing/constants/default-briefing";
import { useBriefing } from "~/features/content-briefing/context/briefing-context";
import {
  charCount,
  descriptionStatus,
  keywordDensity,
  titleStatus,
} from "~/features/content-briefing/lib/briefing-utils";
import type {
  ContentType,
  FunnelStage,
  InternalLink,
  StructureBlock,
  StructureBlockType,
} from "~/features/content-briefing/types";

import {
  BriefingInput,
  BriefingSelect,
  BriefingTextarea,
  CharCounter,
  ExpandableSection,
} from "./briefing-ui";

const CONTENT_TYPES: { value: ContentType; label: string }[] = [
  { value: "blog_post", label: "Blog post" },
  { value: "landing_page", label: "Landing page" },
  { value: "guide", label: "Guia" },
  { value: "pillar", label: "Pillar page" },
  { value: "comparison", label: "Comparativo" },
  { value: "faq_hub", label: "Hub FAQ" },
];

const FUNNEL: { value: FunnelStage; label: string }[] = [
  { value: "awareness", label: "Awareness" },
  { value: "consideration", label: "Consideration" },
  { value: "decision", label: "Decision" },
  { value: "retention", label: "Retention" },
];

/**
 * Todas as seções editáveis do briefing.
 */
export function BriefingSections() {
  const { briefing, updateBriefing } = useBriefing();
  const { meta, strategic, geoSeo, structure, guidelines, visuals, production, faq, checklist } =
    briefing;

  const scoreData = [
    { name: "GEO", score: geoSeo.geoScore },
    { name: "SEO", score: geoSeo.seoScore },
  ];

  const density = keywordDensity(production.body, briefing.mainKeyword);

  const addBlock = (type: StructureBlockType) => {
    updateBriefing({
      structure: {
        blocks: [
          ...structure.blocks,
          {
            id: crypto.randomUUID(),
            type,
            title: type.toUpperCase(),
            notes: "",
            checked: false,
          },
        ],
      },
    });
  };

  const moveBlock = (index: number, dir: -1 | 1) => {
    const blocks = [...structure.blocks];
    const next = index + dir;
    if (next < 0 || next >= blocks.length) return;
    const a = blocks[index];
    const b = blocks[next];
    if (!a || !b) return;
    blocks[index] = b;
    blocks[next] = a;
    updateBriefing({ structure: { blocks } });
  };

  const addLink = () => {
    const row: InternalLink = {
      id: crypto.randomUUID(),
      anchor: "",
      url: "",
      priority: "media",
      linkType: "contextual",
      status: "pendente",
    };
    updateBriefing({ internalLinks: [...briefing.internalLinks, row] });
  };

  const generateFaq = () => {
    const kw = briefing.mainKeyword || "o tema";
    updateBriefing({
      faq: [
        {
          id: crypto.randomUUID(),
          question: `O que é ${kw}?`,
          answer: `Definição objetiva em 2–3 frases, otimizada para snippet e IA.`,
        },
        {
          id: crypto.randomUUID(),
          question: `Como aplicar ${kw} na prática?`,
          answer: "Passos numerados, escaneáveis, com exemplo concreto.",
        },
        {
          id: crypto.randomUUID(),
          question: `Quais erros evitar em ${kw}?`,
          answer: "Lista curta de armadilhas comuns e como corrigi-las.",
        },
      ],
      checklist: { ...checklist, faqIncluded: true },
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <ExpandableSection id="meta" title="Meta tags" icon="◇" badge="SERP">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-4">
            <BriefingInput
              label="Title SEO"
              value={meta.title}
              onChange={(v) => updateBriefing({ meta: { ...meta, title: v } })}
            />
            <CharCounter value={meta.title} optimal={[30, 60]} />
            <BriefingTextarea
              label="Meta description"
              value={meta.description}
              onChange={(v) => updateBriefing({ meta: { ...meta, description: v } })}
              rows={3}
            />
            <CharCounter value={meta.description} optimal={[140, 160]} />
            <BriefingInput
              label="URL sugerida"
              value={meta.suggestedUrl}
              onChange={(v) => updateBriefing({ meta: { ...meta, suggestedUrl: v } })}
            />
            <p className="text-[10px] text-white/40">
              Title: {titleStatus(charCount(meta.title))} · Description:{" "}
              {descriptionStatus(charCount(meta.description))}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white p-4 text-black">
            <p className="text-xs text-[#1a0dab]">
              {meta.suggestedUrl || "https://seusite.com/blog/..."}
            </p>
            <p className="mt-1 text-xl text-[#1a0dab] hover:underline">
              {meta.title || "Título da página — até 60 caracteres"}
            </p>
            <p className="mt-1 text-sm text-[#4d5156]">
              {meta.description ||
                "Meta description persuasiva com palavra-chave e CTA implícito (140–160 caracteres)."}
            </p>
          </div>
        </div>
      </ExpandableSection>

      <ExpandableSection id="strategic" title="Objetivo estratégico" icon="◎">
        <div className="grid gap-4 sm:grid-cols-2">
          <BriefingTextarea
            label="Objetivo do conteúdo"
            value={strategic.objective}
            onChange={(v) =>
              updateBriefing({ strategic: { ...strategic, objective: v } })
            }
            rows={3}
          />
          <BriefingSelect
            label="Tipo de conteúdo"
            value={strategic.contentType}
            onChange={(v) =>
              updateBriefing({ strategic: { ...strategic, contentType: v } })
            }
            options={CONTENT_TYPES}
          />
          <BriefingSelect
            label="Etapa do funil"
            value={strategic.funnelStage}
            onChange={(v) =>
              updateBriefing({ strategic: { ...strategic, funnelStage: v } })
            }
            options={FUNNEL}
          />
          <BriefingInput
            label="Público-alvo"
            value={strategic.audience}
            onChange={(v) =>
              updateBriefing({ strategic: { ...strategic, audience: v } })
            }
          />
          <BriefingInput
            label="Intenção de busca macro"
            value={strategic.macroIntent}
            onChange={(v) =>
              updateBriefing({ strategic: { ...strategic, macroIntent: v } })
            }
          />
          <BriefingTextarea
            label="Micro intenções"
            value={strategic.microIntents}
            onChange={(v) =>
              updateBriefing({ strategic: { ...strategic, microIntents: v } })
            }
            rows={3}
          />
          <BriefingTextarea
            label="Justificativa estratégica"
            value={strategic.rationale}
            onChange={(v) =>
              updateBriefing({ strategic: { ...strategic, rationale: v } })
            }
            rows={3}
          />
          <BriefingTextarea
            label="Insights de SERP"
            value={strategic.serpInsights}
            onChange={(v) =>
              updateBriefing({ strategic: { ...strategic, serpInsights: v } })
            }
            rows={3}
          />
        </div>
      </ExpandableSection>

      <ExpandableSection id="geo-seo" title="GEO + SEO Intelligence" icon="✦" badge="IA">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 grid gap-4 sm:grid-cols-2">
            <BriefingTextarea
              label="Palavras-chave principais"
              value={geoSeo.primaryKeywords}
              onChange={(v) =>
                updateBriefing({ geoSeo: { ...geoSeo, primaryKeywords: v } })
              }
            />
            <BriefingTextarea
              label="Palavras-chave secundárias"
              value={geoSeo.secondaryKeywords}
              onChange={(v) =>
                updateBriefing({ geoSeo: { ...geoSeo, secondaryKeywords: v } })
              }
            />
            <BriefingTextarea
              label="Entidades semânticas"
              value={geoSeo.semanticEntities}
              onChange={(v) =>
                updateBriefing({ geoSeo: { ...geoSeo, semanticEntities: v } })
              }
            />
            <BriefingTextarea
              label="People Also Ask"
              value={geoSeo.peopleAlsoAsk}
              onChange={(v) =>
                updateBriefing({ geoSeo: { ...geoSeo, peopleAlsoAsk: v } })
              }
            />
            <BriefingTextarea
              label="Termos relacionados"
              value={geoSeo.relatedTerms}
              onChange={(v) =>
                updateBriefing({ geoSeo: { ...geoSeo, relatedTerms: v } })
              }
            />
            <BriefingInput
              label="Intenção semântica"
              value={geoSeo.semanticIntent}
              onChange={(v) =>
                updateBriefing({ geoSeo: { ...geoSeo, semanticIntent: v } })
              }
            />
            <BriefingTextarea
              label="Sugestões para IA generativa"
              value={geoSeo.aiGenerativeTips}
              onChange={(v) =>
                updateBriefing({ geoSeo: { ...geoSeo, aiGenerativeTips: v } })
              }
              rows={3}
            />
            <BriefingTextarea
              label="Blocos de contexto para LLMs"
              value={geoSeo.llmContextBlocks}
              onChange={(v) =>
                updateBriefing({ geoSeo: { ...geoSeo, llmContextBlocks: v } })
              }
              rows={3}
            />
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs text-white/55">Score GEO</label>
              <input
                type="range"
                min={0}
                max={100}
                value={geoSeo.geoScore}
                onChange={(e) =>
                  updateBriefing({
                    geoSeo: { ...geoSeo, geoScore: Number(e.target.value) },
                  })
                }
                className="w-full accent-brand"
              />
              <p className="text-right text-sm font-bold text-brand-bright">{geoSeo.geoScore}</p>
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/55">Score SEO</label>
              <input
                type="range"
                min={0}
                max={100}
                value={geoSeo.seoScore}
                onChange={(e) =>
                  updateBriefing({
                    geoSeo: { ...geoSeo, seoScore: Number(e.target.value) },
                  })
                }
                className="w-full accent-brand"
              />
              <p className="text-right text-sm font-bold text-brand-bright">{geoSeo.seoScore}</p>
            </div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreData}>
                  <XAxis dataKey="name" tick={{ fill: "#fff8", fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: "#fff8", fontSize: 10 }} />
                  <Bar dataKey="score" fill="var(--color-brand-bright)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="mt-4 rounded-xl border border-brand/25 bg-brand/5 p-4">
          <p className="text-xs font-bold uppercase text-brand-bright">
            Simulação Google AI Overview / ChatGPT
          </p>
          <BriefingTextarea
            label=""
            value={geoSeo.aiOverviewSnippet}
            onChange={(v) =>
              updateBriefing({ geoSeo: { ...geoSeo, aiOverviewSnippet: v } })
            }
            rows={3}
            hint="Resposta objetiva que um LLM poderia citar ou resumir."
          />
        </div>
      </ExpandableSection>

      <ExpandableSection id="structure" title="Estrutura recomendada" icon="≡">
        <div className="mb-3 flex flex-wrap gap-2">
          {(["h1", "h2", "h3", "intro", "faq", "cta", "semantic"] as StructureBlockType[]).map(
            (t) => (
              <button
                key={t}
                type="button"
                onClick={() => addBlock(t)}
                className="rounded-lg border border-white/10 px-2 py-1 text-xs hover:bg-white/5"
              >
                + {t}
              </button>
            ),
          )}
        </div>
        <ul className="space-y-2">
          {structure.blocks.map((block, i) => (
            <StructureBlockRow
              key={block.id}
              block={block}
              index={i}
              total={structure.blocks.length}
              onChange={(b) => {
                const blocks = structure.blocks.map((x) => (x.id === b.id ? b : x));
                updateBriefing({ structure: { blocks } });
              }}
              onMove={(dir) => moveBlock(i, dir)}
            />
          ))}
        </ul>
      </ExpandableSection>

      <ExpandableSection id="guidelines" title="Diretrizes editoriais" icon="✎">
        <div className="grid gap-4 sm:grid-cols-2">
          <BriefingTextarea label="Tom de voz" value={guidelines.tone} onChange={(v) => updateBriefing({ guidelines: { ...guidelines, tone: v } })} />
          <BriefingTextarea label="Escaneabilidade" value={guidelines.scannability} onChange={(v) => updateBriefing({ guidelines: { ...guidelines, scannability: v } })} />
          <BriefingInput label="Máx. linhas por parágrafo" value={String(guidelines.maxLinesPerParagraph)} onChange={(v) => updateBriefing({ guidelines: { ...guidelines, maxLinesPerParagraph: Number(v) || 4 } })} />
          <BriefingTextarea label="Uso de negrito" value={guidelines.boldRules} onChange={(v) => updateBriefing({ guidelines: { ...guidelines, boldRules: v } })} />
          <BriefingTextarea label="Linkagem interna" value={guidelines.internalLinking} onChange={(v) => updateBriefing({ guidelines: { ...guidelines, internalLinking: v } })} />
          <BriefingTextarea label="UX writing" value={guidelines.uxWriting} onChange={(v) => updateBriefing({ guidelines: { ...guidelines, uxWriting: v } })} />
          <BriefingTextarea label="Mobile" value={guidelines.mobile} onChange={(v) => updateBriefing({ guidelines: { ...guidelines, mobile: v } })} />
          <BriefingTextarea label="IA generativa" value={guidelines.generativeAi} onChange={(v) => updateBriefing({ guidelines: { ...guidelines, generativeAi: v } })} />
        </div>
      </ExpandableSection>

      <ExpandableSection id="links" title="Links internos" icon="↗">
        <button type="button" onClick={addLink} className="mb-3 rounded-lg border border-white/10 px-3 py-1 text-xs hover:bg-white/5">
          + Adicionar link
        </button>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs text-white/45">
                <th className="p-2">Âncora</th>
                <th className="p-2">URL</th>
                <th className="p-2">Prioridade</th>
                <th className="p-2">Tipo</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {briefing.internalLinks.map((link) => (
                <tr key={link.id} className="border-b border-white/5">
                  <td className="p-2">
                    <input className="w-full rounded border border-white/10 bg-black/20 px-2 py-1 text-xs text-white" value={link.anchor} onChange={(e) => updateBriefing({ internalLinks: briefing.internalLinks.map((l) => l.id === link.id ? { ...l, anchor: e.target.value } : l) })} />
                  </td>
                  <td className="p-2">
                    <input className="w-full rounded border border-white/10 bg-black/20 px-2 py-1 text-xs text-white" value={link.url} onChange={(e) => updateBriefing({ internalLinks: briefing.internalLinks.map((l) => l.id === link.id ? { ...l, url: e.target.value } : l) })} />
                  </td>
                  <td className="p-2">
                    <select className="rounded border border-white/10 bg-black/20 text-xs text-white" value={link.priority} onChange={(e) => updateBriefing({ internalLinks: briefing.internalLinks.map((l) => l.id === link.id ? { ...l, priority: e.target.value as InternalLink["priority"] } : l) })}>
                      <option value="alta">Alta</option>
                      <option value="media">Média</option>
                      <option value="baixa">Baixa</option>
                    </select>
                  </td>
                  <td className="p-2">
                    <select className="rounded border border-white/10 bg-black/20 text-xs text-white" value={link.linkType} onChange={(e) => updateBriefing({ internalLinks: briefing.internalLinks.map((l) => l.id === link.id ? { ...l, linkType: e.target.value as InternalLink["linkType"] } : l) })}>
                      <option value="contextual">Contextual</option>
                      <option value="navegacional">Navegacional</option>
                      <option value="conversao">Conversão</option>
                    </select>
                  </td>
                  <td className="p-2">
                    <select className="rounded border border-white/10 bg-black/20 text-xs text-white" value={link.status} onChange={(e) => updateBriefing({ internalLinks: briefing.internalLinks.map((l) => l.id === link.id ? { ...l, status: e.target.value as InternalLink["status"] } : l) })}>
                      <option value="pendente">Pendente</option>
                      <option value="incluido">Incluído</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ExpandableSection>

      <ExpandableSection id="visuals" title="Recursos visuais" icon="▣">
        <div className="grid gap-4 sm:grid-cols-2">
          <BriefingTextarea label="Sugestões de imagens" value={visuals.imageSuggestions} onChange={(v) => updateBriefing({ visuals: { ...visuals, imageSuggestions: v } })} />
          <BriefingInput label="Banner CTA" value={visuals.bannerCta} onChange={(v) => updateBriefing({ visuals: { ...visuals, bannerCta: v } })} />
          <BriefingTextarea label="Blocos de destaque" value={visuals.highlightBlocks} onChange={(v) => updateBriefing({ visuals: { ...visuals, highlightBlocks: v } })} />
          <BriefingTextarea label="Infográficos" value={visuals.infographics} onChange={(v) => updateBriefing({ visuals: { ...visuals, infographics: v } })} />
        </div>
        <label className="mt-4 block cursor-pointer rounded-xl border border-dashed border-white/15 p-6 text-center text-sm text-white/45 hover:border-brand/30">
          Upload de referências (demo)
          <input type="file" className="hidden" multiple disabled />
        </label>
      </ExpandableSection>

      <ExpandableSection id="production" title="Produção do texto" icon="¶" badge="Live">
        <div className="grid gap-4 lg:grid-cols-2">
          <BriefingTextarea
            label="Editor (markdown)"
            value={production.body}
            onChange={(v) => updateBriefing({ production: { body: v } })}
            rows={14}
          />
          <div className="space-y-3">
            <div className="rounded-xl border border-white/10 bg-black/25 p-3 text-sm prose-invert">
              <p className="mb-2 text-xs font-bold text-white/50">Prévia</p>
              <pre className="whitespace-pre-wrap font-sans text-white/75">{production.body || "Comece a escrever…"}</pre>
            </div>
            <ul className="space-y-1 text-xs text-white/55">
              <li>Densidade KW: <strong className="text-brand-bright">{density}%</strong></li>
              <li>GEO score: {geoSeo.geoScore}/100</li>
              <li>SEO score: {geoSeo.seoScore}/100</li>
              <li>EEAT: inclua autoria, fontes e experiência prática</li>
              <li>Legibilidade: parágrafos ≤ {guidelines.maxLinesPerParagraph} linhas</li>
            </ul>
          </div>
        </div>
      </ExpandableSection>

      <ExpandableSection id="faq" title="FAQ automatizado" icon="?">
        <button type="button" onClick={generateFaq} className="mb-3 rounded-lg border border-brand/40 bg-brand/20 px-3 py-1.5 text-xs font-semibold text-white">
          Gerar FAQ com IA (demo)
        </button>
        <ul className="space-y-4">
          {faq.map((item) => (
            <li key={item.id} className="rounded-xl border border-white/8 p-3">
              <BriefingInput label="Pergunta" value={item.question} onChange={(v) => updateBriefing({ faq: faq.map((f) => (f.id === item.id ? { ...f, question: v } : f)) })} />
              <BriefingTextarea label="Resposta" value={item.answer} onChange={(v) => updateBriefing({ faq: faq.map((f) => (f.id === item.id ? { ...f, answer: v } : f)) })} rows={2} />
            </li>
          ))}
        </ul>
      </ExpandableSection>

      <ExpandableSection id="checklist" title="Checklist final" icon="✓">
        <ul className="grid gap-2 sm:grid-cols-2">
          {CHECKLIST_ITEMS.map((item) => (
            <li key={item.key}>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/8 px-3 py-2 hover:bg-white/[0.03]">
                <input
                  type="checkbox"
                  checked={checklist[item.key] ?? false}
                  onChange={(e) =>
                    updateBriefing({
                      checklist: { ...checklist, [item.key]: e.target.checked },
                    })
                  }
                  className="size-4 rounded border-white/25 text-brand"
                />
                <span className="text-sm text-white/75">{item.label}</span>
              </label>
            </li>
          ))}
        </ul>
      </ExpandableSection>
    </div>
  );
}

function StructureBlockRow({
  block,
  index,
  total,
  onChange,
  onMove,
}: {
  block: StructureBlock;
  index: number;
  total: number;
  onChange: (b: StructureBlock) => void;
  onMove: (dir: -1 | 1) => void;
}) {
  return (
    <li className="flex gap-2 rounded-xl border border-white/8 bg-black/20 p-3">
      <input
        type="checkbox"
        checked={block.checked}
        onChange={(e) => onChange({ ...block, checked: e.target.checked })}
        className="mt-2 size-4 shrink-0"
      />
      <div className="flex-1 grid gap-2 sm:grid-cols-3">
        <span className="text-xs font-bold uppercase text-brand-bright/80">{block.type}</span>
        <input
          className="rounded border border-white/10 bg-black/30 px-2 py-1 text-sm text-white sm:col-span-2"
          value={block.title}
          onChange={(e) => onChange({ ...block, title: e.target.value })}
        />
        <input
          className="rounded border border-white/10 bg-black/30 px-2 py-1 text-xs text-white/70 sm:col-span-3"
          placeholder="Notas / briefing do bloco"
          value={block.notes}
          onChange={(e) => onChange({ ...block, notes: e.target.value })}
        />
      </div>
      <div className="flex flex-col gap-1">
        <button type="button" disabled={index === 0} onClick={() => onMove(-1)} className="text-xs text-white/40 disabled:opacity-30">↑</button>
        <button type="button" disabled={index === total - 1} onClick={() => onMove(1)} className="text-xs text-white/40 disabled:opacity-30">↓</button>
      </div>
    </li>
  );
}
