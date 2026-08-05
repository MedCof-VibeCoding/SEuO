import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { SeoAnalysisError } from "~/features/seo/errors/analysis-errors";
import { analyzeArticlesSchema } from "~/features/seo/schemas/article-input";
import {
  buildComparativeSearchConsoleData,
  buildDisconnectedSearchConsoleData,
} from "~/features/seo/services/comparative-search-console";
import { runSeoAnalysis } from "~/features/seo/services/run-analysis";
import { isOpenAIConfigured } from "~/server/ai/openai";
import { authOptions } from "~/server/auth/auth-options";
import { connectToDatabase } from "~/server/db/connection";
import { SeoAnalysisModel } from "~/server/db/models/seo-analysis";
import { getGoogleAccessToken } from "~/server/search-console/google-tokens";

/**
 * POST — análise SEO comparativa editorial (público, sem login).
 */
export async function POST(request: Request) {
  if (!isOpenAIConfigured()) {
    return NextResponse.json(
      {
        error: "OPENAI_NOT_CONFIGURED",
        message:
          "OPENAI_API_KEY não encontrada. Salve o .env (Ctrl+S) e reinicie: pnpm dev",
      },
      { status: 503 },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { error: "INVALID_JSON", message: "Corpo da requisição inválido." },
      { status: 400 },
    );
  }

  const body =
    typeof json === "object" && json !== null
      ? (json as Record<string, unknown>)
      : {};

  const parsed = analyzeArticlesSchema.safeParse({
    targetUrl: body.targetUrl ?? "",
    competitor1: body.competitor1 ?? "",
    competitor2: body.competitor2 ?? "",
    mainKeyword: body.mainKeyword ?? "",
    niche: body.niche ?? "",
    objective: body.objective ?? "",
  });
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const firstMessage =
      Object.values(fieldErrors)
        .flat()
        .find((m): m is string => Boolean(m)) ?? "Verifique as URLs informadas.";

    return NextResponse.json(
      {
        error: "VALIDATION_ERROR",
        message: firstMessage,
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const competitors = [parsed.data.competitor1, parsed.data.competitor2].filter(
    (u): u is string => Boolean(u),
  );

  try {
    let report = await runSeoAnalysis(
      {
        targetUrl: parsed.data.targetUrl,
        competitors,
        mainKeyword: parsed.data.mainKeyword,
        niche: parsed.data.niche,
        objective: parsed.data.objective,
      },
      "pro",
    );

    const session = await getServerSession(authOptions);
    const targetUrl = parsed.data.targetUrl;
    const mainKeyword = parsed.data.mainKeyword;

    if (session?.user?.id) {
      const accessToken = await getGoogleAccessToken(session.user.id);
      if (accessToken) {
        try {
          report.searchConsole = await buildComparativeSearchConsoleData(
            accessToken,
            targetUrl,
            {
              mainKeyword,
              aiKeywords: report.comparativeArticle?.keywords.top_keywords,
            },
          );
        } catch (err) {
          console.error("[api/seo/analyze] GSC enrichment failed", err);
          report.searchConsole = {
            ...buildDisconnectedSearchConsoleData(targetUrl, mainKeyword),
            connected: true,
            insight: "Não foi possível consultar o Search Console nesta análise.",
          };
        }
      } else {
        report.searchConsole = {
          ...buildDisconnectedSearchConsoleData(targetUrl, mainKeyword),
          connected: true,
          insight:
            "Conecte o Google Search Console (login com Google) para ver posição e cliques reais.",
        };
      }
    } else {
      report.searchConsole = buildDisconnectedSearchConsoleData(targetUrl, mainKeyword);
    }

    try {
      await connectToDatabase();
      await SeoAnalysisModel.create({
        analysisId: report.id,
        shareSlug: report.shareSlug,
        userId: session?.user?.id ?? "anonymous",
        primaryDomain: report.primaryDomain,
        report,
      });
    } catch {
      /* relatório ainda retorna ao cliente */
    }

    console.log(JSON.stringify(report, null, 2));
    return NextResponse.json({ report }, { status: 201 });
  } catch (err) {
    if (err instanceof SeoAnalysisError) {
      return NextResponse.json(
        { error: err.code, message: err.message },
        { status: err.httpStatus },
      );
    }

    const message = err instanceof Error ? err.message : "Erro inesperado na análise.";
    console.error("[api/seo/analyze]", err);

    return NextResponse.json(
      { error: "ANALYSIS_FAILED", message },
      { status: 500 },
    );
  }
}
