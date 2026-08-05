# Análise do Projeto — SEuO SEO

> Documento gerado em 24/06/2025. Descreve o estado atual do repositório `Template-Next-Nana` (pacote npm: `template-vibe-coding`).

---

## 1. Visão geral

O projeto começou como um **template T3 Stack** para aprendizado com IA (“vibe coding”), mas evoluiu para uma **plataforma de ferramentas SEO em português** com a marca **SEuO**.

| Campo | Valor |
|-------|-------|
| Nome do pacote | `template-vibe-coding` v0.1.0 |
| Produto | **SEuO SEO** — análise comparativa, posicionamento no Google, otimização de texto |
| Gerenciador de pacotes | pnpm 10.11.0 |
| Base | Create T3 App v7.40.0 |

**Observação:** o `README.md` e o `.cursorrules` ainda descrevem um template simples; o código já é um produto com várias ferramentas integradas.

---

## 2. Stack técnica

| Camada | Tecnologia |
|--------|------------|
| Framework | Next.js 15 (App Router, Turbopack em dev) |
| Linguagem | TypeScript 5.8 |
| UI | React 19, Tailwind CSS 4, Framer Motion, Lucide, Recharts, Sonner |
| API principal | Route Handlers REST em `src/app/api/` |
| API secundária | tRPC 11 + TanStack Query + SuperJSON |
| Autenticação | NextAuth 4 (JWT): Google, GitHub, credenciais |
| Banco principal | MongoDB via Mongoose 9 |
| Banco secundário (scaffold) | SQLite via Drizzle ORM — **não utilizado** |
| IA | Google Gemini (análise comparativa), OpenAI (otimização de texto) |
| E-mail | SendGrid — **implementado, não conectado** |
| Validação | Zod 3 |
| Formulários | react-hook-form + `@hookform/resolvers` |
| Variáveis de ambiente | `@t3-oss/env-nextjs` (`src/env.js`) |

---

## 3. Funcionalidades

### 3.1 Rotas públicas (páginas)

| Rota | Descrição | Autenticação |
|------|-----------|--------------|
| `/` | Home com cards das ferramentas principais | Pública |
| `/analyzer` | Formulário: URL alvo + até 2 concorrentes + palavra-chave → análise Gemini | Pública |
| `/compare?id=` | Dashboard comparativo (gráficos, insights, exportação) | Pública |
| `/reports/[slug]` | Relatório detalhado por `id` ou `shareSlug` | Pública |
| `/google-position-checker` | Verificação de posição URL + keyword (GSC ou mock) | Pública (GSC exige login Google) |
| `/optimize` | Otimização de texto com IA (modos, tom, diff, métricas) | Pública |
| `/briefing` | Editor de briefing editorial GEO + SEO (localStorage) | Pública |
| `/settings` | Informações da plataforma, integrações, limites de plano | Pública |
| `/workspace` | Atalhos do painel + histórico | Pública |
| `/workspace/explorar` | Demo: salvar/listar textos via tRPC → MongoDB | Pública |
| `/workspace/aprendizado` | Página placeholder vazia | Pública |

### 3.2 Rotas de autenticação

| Rota | Descrição |
|------|-----------|
| `/login` | Login com Google, GitHub (se configurados) ou e-mail/senha |
| `/register` | Cadastro por e-mail/senha (OAuth desabilitado — “em breve”) |
| `/cadastro` | Redirecionamento permanente → `/register` |
| `/recuperar-senha` | Placeholder — recuperação de senha “em breve” |
| `/termos` | Placeholder — termos de uso pendentes |

### 3.3 Redirecionamentos legados (`/seo/*`)

| Rota antiga | Destino |
|-------------|---------|
| `/seo` | `/` |
| `/seo/analyzer` | `/analyzer` |
| `/seo/report/[id]` | `/reports/[id]` |
| `/seo/dashboard/[id]` | `/compare?id=[id]` |

### 3.4 Ferramentas em detalhe

#### Análise comparativa SEO (`/analyzer` → `/compare`)

- Envia URLs de artigos e palavra-chave opcional.
- Busca páginas no servidor e executa análise com **Google Gemini**.
- Dashboard com scores, gráficos radar/barra, gaps de keywords, vantagens dos concorrentes, plano de 30 dias e recomendações de IA.
- Exportação: `.txt` para relatórios comparativos; `window.print()` para modo benchmark legado.
- Persistência: `sessionStorage` no cliente; salvamento opcional no MongoDB (`userId: "anonymous"`).
- Sempre executa com plano **`pro`** (sem enforcement de cota).

#### Google Position Checker (`/google-position-checker`)

- Verificação de posição para URL + palavra-chave.
- **Modo real:** exige login Google com escopo Search Console readonly; chama API do GSC.
- **Modo mock:** `GSC_USE_MOCK=true` ignora autenticação.
- Resultados: posição, tier, estimativa de CTR, keywords relacionadas, histórico de ranking, score SEO.
- Histórico armazenado em **localStorage**.

#### Otimização de texto (`/optimize`)

- Modos: balanced, seo_max, conversion, authority.
- Usa OpenAI quando configurado; **fallback heurístico offline** quando não há chave.
- Métricas ao vivo, visualizador de diff, geração de FAQ, histórico de sessão.

#### Briefing de conteúdo (`/briefing`)

- Briefing editorial completo: meta, estratégico, GEO/SEO, blocos de estrutura, links internos, FAQ, checklist, comentários, versões.
- “Gerar com IA” = **preenchimento local por template** (`fillBriefingWithAiSuggestions`), não chamada real a LLM.
- Autosave em **localStorage**; exportação Markdown/PDF (via print).

#### Autenticação

- Login: Google (se env configurado), GitHub (se env configurado), credenciais.
- Cadastro: apenas e-mail/senha; botões Google/GitHub **desabilitados**.
- Login Google armazena tokens do GSC no documento do usuário.
- Sessão expõe `user.id`, `user.plan`, `gscConnected`.

#### Workspace

- Sidebar: Painel, Home SEO, Posição Google, Explorar, Aprendizado.
- Explorar: demo tRPC para textos salvos (dados globais, sem escopo por usuário).

### 3.5 APIs REST (`src/app/api/`)

| Método | Endpoint | Função |
|--------|----------|--------|
| GET/POST | `/api/trpc/[trpc]` | Handler tRPC |
| GET/POST | `/api/auth/[...nextauth]` | NextAuth |
| POST | `/api/auth/register` | Criar usuário (hash bcrypt) |
| POST | `/api/seo/analyze` | Análise comparativa SEO (OpenAI obrigatório) |
| POST | `/api/seo/analyze-html` | Análise SEO de HTML enviado no body (on-page + GSC opcional). Ver [api-analyze-html.md](api-analyze-html.md) |
| POST | `/api/seo/google-position-check` | Verificação de posição (GSC ou mock) |
| POST | `/api/seo/optimize-text` | Otimização de texto (OpenAI ou offline) |
| GET | `/api/seo/history` | Histórico de análises do usuário (vazio sem sessão) |
| GET | `/api/seo/analysis/[id]` | Buscar relatório por `analysisId` ou `shareSlug` |
| GET | `/api/seo/search-console/status` | Status de conexão GSC + lista de propriedades |
| POST | `/api/pagespeed` | Scores PageSpeed **mock** (não usado no frontend) |
| POST | `/api/lighthouse` | Scores Lighthouse **mock** (não usado no frontend) |

### 3.6 Procedimentos tRPC

Registrados em `src/server/api/root.ts`:

| Router | Procedimento | Tipo | Descrição |
|--------|--------------|------|-----------|
| `health` | `ping` | query | Retorna `{ ok: true }` |
| `savedText` | `list` | query | Últimos 50 textos salvos no MongoDB (global) |
| `savedText` | `create` | mutation | Salvar texto (1–2000 chars) no MongoDB (global) |

**Total: 3 procedimentos.** Todos usam `publicProcedure` — sem middleware de autenticação.

### 3.7 Módulos de domínio (`src/features/`)

| Módulo | Papel |
|--------|-------|
| `seo/` | Engines de análise, GPC, análise comparativa Gemini, schemas, dados de gráficos, exportação |
| `text-optimize/` | Otimização OpenAI, métricas, diff |
| `content-briefing/` | Tipos de briefing, contexto, preenchimento local “IA”, utils |
| `auth/` | Helper de login Google |

### 3.8 Modelos MongoDB (`src/server/db/models/`)

| Modelo | Uso |
|--------|-----|
| `User` | Usuários, plano (`free`/`pro`), tokens Google/GSC, contadores de cota |
| `SeoAnalysis` | Relatórios de análise comparativa |
| `SavedText` | Demo de textos salvos (Explorar) |

---

## 4. Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│  Browser (Client Components)                                 │
│  - fetch() → /api/seo/*, /api/auth/*                        │
│  - api.savedText.* → /api/trpc (apenas em Explorar)         │
│  - next-auth/react (login)                                   │
│  - sessionStorage / localStorage para relatórios e histórico │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  Next.js App Router                                          │
│  - Server Components: layouts, metadata, prefetch de sessão  │
│  - Route Handlers: lógica principal de negócio (não tRPC)   │
│  - tRPC: health + savedText demo                             │
└──────────────────────────┬──────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
   NextAuth 4          Mongoose           APIs externas
   (sessão JWT)       MongoDB            Gemini, OpenAI,
   modelo User        SavedText          GSC, SendGrid
                      SeoAnalysis
```

### Organização do frontend

- `src/app/` — rotas, layouts, `_components` por página
- `src/app/_components/` — UI compartilhada (dashboard SEO, optimize, sidebar)
- `src/features/` — lógica de domínio, serviços, hooks, schemas

### Layouts

| Layout | Uso |
|--------|-----|
| Root | `TRPCReactProvider`, `AuthSessionProvider` |
| Workspace | Sidebar de navegação |
| Auth | Formulários centralizados |
| Briefing | Passthrough |

### Fluxo de autenticação

- Estratégia JWT (sem sessões no banco).
- Google OAuth solicita escopo `webmasters.readonly` + refresh offline.
- Usuários OAuth sincronizados via `syncOAuthUser`; tokens gravados no documento `User`.
- **Sem middleware de rotas** — páginas não são protegidas no servidor.
- Plano (`free`/`pro`) no JWT, mas endpoint de análise ignora cotas.

### Tensão arquitetural

O `.cursorrules` prescreve “toda API server via tRPC”, mas **a maior parte da lógica de negócio está em Route Handlers REST**. O tRPC funciona como health check + demo de aprendizado.

---

## 5. Pontos importantes de utilização

### 5.1 Variáveis de ambiente

#### Obrigatórias

| Variável | Propósito |
|----------|-----------|
| `MONGODB_URI` | Conexão MongoDB (validada no build) |
| `NODE_ENV` | `development` / `test` / `production` |

#### Opcionais por funcionalidade

| Variável | Funcionalidade |
|----------|----------------|
| `MONGODB_URI_STANDARD` | String Atlas sem SRV (workaround DNS no Windows) |
| `GEMINI_API_KEY`, `GEMINI_MODEL` | Análise comparativa (**obrigatório para `/analyzer`**) |
| `OPENAI_API_KEY`, `OPENAI_MODEL` | Otimização de texto (fallback offline sem chave) |
| `NEXTAUTH_SECRET`, `NEXTAUTH_URL` | Login e cadastro |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Login Google + GSC |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | Login GitHub |
| `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL` | E-mail (não conectado) |
| `NEXT_PUBLIC_APP_URL` | URL pública / redirects OAuth |
| `SQLITE_DATABASE_PATH` | Scaffold SQLite (não usado) |
| `SKIP_ENV_VALIDATION` | Builds Docker/CI |
| `GSC_USE_MOCK` | **Não documentado em `env.js`** — mock do GPC sem login |

### 5.2 Como executar

```bash
cp .env.example .env   # configure MONGODB_URI no mínimo
pnpm install
pnpm dev               # http://localhost:3000
pnpm build && pnpm start
pnpm check             # lint + tsc
```

### 5.3 Fluxos principais

1. **Análise comparativa:** `/analyzer` → POST `/api/seo/analyze` → `/compare?id=...` (requer `GEMINI_API_KEY`)
2. **Position checker:** Login Google → `/google-position-checker` → POST `/api/seo/google-position-check` (ou `GSC_USE_MOCK=true` em dev)
3. **Otimização de texto:** `/optimize` → POST `/api/seo/optimize-text`
4. **Cadastro/login:** `/register` → POST `/api/auth/register` → `/login` → NextAuth → `/workspace`
5. **Demo tRPC:** `/workspace/explorar` → `savedText.list` / `savedText.create`

### 5.4 Armazenamento de dados

| Onde | O que |
|------|-------|
| MongoDB | Usuários, relatórios SEO, textos salvos (demo) |
| sessionStorage | Cache de relatórios SEO |
| localStorage | Histórico GPC, briefing, “lembrar e-mail” no login |
| SQLite | Não utilizado |

### 5.5 Rotas órfãs (sem link no menu principal)

- `/optimize` e `/briefing` — acessíveis por URL direta
- `SeoCopilotShortcut` existe como componente mas **não é importado** em nenhum lugar

---

## 6. Débitos técnicos conhecidos

### 6.1 Funcionalidades incompletas ou placeholder

| Item | Localização |
|------|-------------|
| Recuperação de senha | `src/app/(auth)/recuperar-senha/page.tsx` |
| Termos de uso | `src/app/(auth)/termos/page.tsx` |
| OAuth no cadastro | Google/GitHub desabilitados em `RegisterPage.tsx` |
| Página Aprendizado | `src/app/workspace/aprendizado/page.tsx` — vazia |
| SendGrid | Implementado em `src/server/email/`, nunca chamado |
| APIs PageSpeed / Lighthouse | Apenas mock; **não usadas pela UI** |
| “IA” do briefing | Templates locais, não LLM real |
| SQLite/Drizzle | Schema + client existem; `getSqliteDb()` nunca importado; `better-sqlite3` ausente de `dependencies` |

### 6.2 Código morto ou não utilizado

| Item | Detalhe |
|------|---------|
| `src/features/seo/services/mock-analyzer.ts` | Não importado |
| `consumeAnalysisQuota()` | Definido em `plan-limits.ts`, nunca chamado |
| `getSqliteDb()` | Definido, nunca importado |
| `SeoCopilotShortcut` | Componente não importado |
| `/api/seo/history` | Sem referências no frontend |

### 6.3 Código marcado como `@deprecated`

| Arquivo | Itens |
|---------|-------|
| `src/features/seo/schemas/article-input.ts` | `AnalyzeDomainsInput`, `analyzeDomainsSchema` |
| `src/features/seo/services/gemini-comparative-analysis.ts` | Tipos/funções legadas |
| `src/features/seo/types/analysis.ts` | Tipos legados |

### 6.4 Segurança e controle de acesso

| Problema | Detalhe |
|----------|---------|
| Análise pública como Pro | `/api/seo/analyze` sempre passa `plan: "pro"`; sem auth nem cota |
| Textos salvos globais | `savedText.list`/`create` sem escopo por usuário |
| Relatórios anônimos | Análises salvas com `userId: "anonymous"` |
| API pública de relatórios | `GET /api/seo/analysis/[id]` — qualquer um com ID/slug acessa |
| Secret de dev inseguro | Fallback de `NEXTAUTH_SECRET` em desenvolvimento |
| Sem middleware | Nenhuma proteção server-side de rotas |
| Bypass GSC mock | `GSC_USE_MOCK=true` ignora autenticação |
| Logs em produção | Relatórios/resultados logados no console do servidor |
| `GSC_USE_MOCK` fora do schema | Variável usada mas não validada em `src/env.js` |

### 6.5 Testes

**Nenhum** arquivo `*.test.*` ou `*.spec.*` no repositório.

### 6.6 Divergência de documentação

| Documento | Problema |
|-----------|----------|
| `README.md` | Descreve “páginas placeholder” e sidebar simples |
| `.cursorrules` | Diz “preferir `publicProcedure` até auth ser adicionada” — auth existe, mas APIs principais ignoram tRPC |
| Nome do pacote | `template-vibe-coding` vs marca **SEuO** |

### 6.7 Workarounds e hacks

| Item | Detalhe |
|------|---------|
| DNS MongoDB | Workaround em `connection.ts` (IPv4 primeiro, DNS público, `MONGODB_URI_STANDARD`) |
| Delay artificial tRPC | `timingMiddleware` em dev (100–500ms aleatório) |
| Delay no cadastro | `register-service.ts` adiciona 650ms fake antes da API |
| Erros silenciados | Rota de análise engole erros de salvamento no MongoDB |
| Cotas não aplicadas | `getAnalysisUsage` existe; `consumeAnalysisQuota` nunca é chamado na análise |

### 6.8 Comentários TODO/FIXME

Nenhum `TODO`, `FIXME`, `HACK` ou `XXX` encontrado em `src/` — débitos estão implícitos no código (placeholders, código morto, APIs mock).

---

## 7. Resumo executivo

**SEuO** é uma plataforma SEO em português construída sobre um template Next.js/T3, com funcionalidades além do que o README descreve:

- Análise comparativa editorial com Gemini
- Google Position Checker via Search Console
- Otimização de texto com OpenAI
- Briefing de conteúdo rico (persistência local)

A **maior parte da lógica de negócio usa REST**, não tRPC (apenas 3 procedimentos). MongoDB é o banco ativo; SQLite/Drizzle é scaffold não utilizado. Autenticação existe (NextAuth + planos), mas **as ferramentas SEO principais são públicas e sem gating**.

Principais débitos: arquitetura híbrida API, endpoints públicos sem escopo, caminhos mock/não usados, ausência total de testes e documentação defasada em relação ao produto real.

---

## 8. Referências rápidas

| Recurso | Caminho |
|---------|---------|
| Integração API análise HTML | [docs/api-analyze-html.md](api-analyze-html.md) |
| Regras para IA | `.cursorrules` |
| Validação de env | `src/env.js` |
| Exemplo de env | `.env.example` |
| Registro de routers tRPC | `src/server/api/root.ts` |
| Opções NextAuth | `src/server/auth/auth-options.ts` |
| Limites de plano | `src/server/auth/plan-limits.ts` |
| Layout SEO público | `src/app/_components/seo/seo-platform-layout.tsx` |
