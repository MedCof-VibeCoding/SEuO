# SEuO SEO

Plataforma de ferramentas SEO em português, construída sobre um [T3 Stack](https://create.t3.gg/)–style starter: **Next.js (App Router)**, **TypeScript**, **Tailwind**, **tRPC**, **MongoDB** (Mongoose) e **NextAuth**. Inclui análise comparativa com OpenAI, Google Position Checker (Search Console), otimização de texto e briefing editorial.

**Documentação completa do projeto:** [docs/analise-projeto.md](docs/analise-projeto.md) — funcionalidades, arquitetura, variáveis de ambiente, fluxos de uso e débitos técnicos conhecidos.

**Integração da API de análise HTML:** [docs/api-analyze-html.md](docs/api-analyze-html.md) — contrato do endpoint `POST /api/seo/analyze-html` para consumo por outro sistema ou I.A.

**Integração Microsoft Clarity:** [docs/integracao-clarity.md](docs/integracao-clarity.md) — tracking, Data Export API, autenticação e configuração segura.

## What you need installed

- [Node.js](https://nodejs.org/) (LTS is fine)
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free cluster (or local MongoDB)

## Quick start

1. **Clone** this repository (or use it as a template on GitHub).

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set **`MONGODB_URI`** to your connection string from Atlas (Database → Connect → Drivers). Replace `<password>` and pick a database name in the path.

4. **Atlas checklist** (if you use the cloud)

   - Create a database user with a password.
   - In **Network Access**, add your IP or `0.0.0.0/0` for local learning (not for production).

5. **Run the app**

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000). A home lista as ferramentas principais (análise comparativa e Position Checker).

   Para análise comparativa, configure também `OPENAI_API_KEY` no `.env`. Para o Position Checker com dados reais, configure OAuth Google e faça login; em dev, `GSC_USE_MOCK=true` usa dados simulados.

## Project layout (where things go)

| Area | Path | Purpose |
|------|------|--------|
| Pages & layouts | `src/app/` | Routes and UI |
| tRPC routers | `src/server/api/routers/` | Server API and database access |
| Router registration | `src/server/api/root.ts` | Combines routers |
| Mongoose models | `src/server/db/models/` | Database shapes |
| DB connection | `src/server/db/connection.ts` | Single shared Mongo connection |
| Env validation | `src/env.js` | Safe list of environment variables |
| AI hints | `.cursorrules` | Rules for Cursor / Copilot-style assistants |
| Project analysis | `docs/analise-projeto.md` | Full feature list, usage guide, technical debt |
| HTML SEO API integration | `docs/api-analyze-html.md` | Request/response contract for `POST /api/seo/analyze-html` |
| Microsoft Clarity integration | `docs/integracao-clarity.md` | Tracking and authenticated Data Export API |

## Using Cursor (or another AI editor)

Open the folder in Cursor. The **`.cursorrules`** file nudges the assistant to keep secrets server-side, use tRPC, and change only what is needed. Describe what you want in plain language; one feature at a time works best.

## Scripts

- `pnpm dev` — development server (Turbopack)
- `pnpm build` / `pnpm start` — production build and run
- `pnpm check` — lint + TypeScript check

## Stack reference

- [Next.js](https://nextjs.org/docs)
- [tRPC](https://trpc.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Mongoose](https://mongoosejs.com/docs/guide.html)

## Deploying

Use any host that supports Next.js (e.g. [Vercel](https://vercel.com)). Set **`MONGODB_URI`** in the host’s environment variables. For Docker or CI builds you can use `SKIP_ENV_VALIDATION` if needed; see [T3 env docs](https://env.t3.gg/docs/nextjs).

## License

Use freely for learning and as a template for your own projects.
