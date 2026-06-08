import { NextResponse } from "next/server";

import { SeoAnalysisError } from "~/features/seo/errors/analysis-errors";
import { analyzeArticlesSchema } from "~/features/seo/schemas/article-input";
import { runSeoAnalysis } from "~/features/seo/services/run-analysis";
import { isGeminiConfigured } from "~/server/ai/gemini";
import { connectToDatabase } from "~/server/db/connection";
import { SeoAnalysisModel } from "~/server/db/models/seo-analysis";

/**
 * POST — análise SEO comparativa editorial (público, sem login).
 */
export async function POST(request: Request) {
  if (!isGeminiConfigured()) {
    return NextResponse.json(
      {
        error: "GEMINI_NOT_CONFIGURED",
        message:
          "GEMINI_API_KEY não encontrada. Salve o .env (Ctrl+S) e reinicie: pnpm dev",
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

  const parsed = analyzeArticlesSchema.safeParse(json);
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
    const report = await runSeoAnalysis(
      {
        targetUrl: parsed.data.targetUrl,
        competitors,
        mainKeyword: parsed.data.mainKeyword,
      },
      "pro",
    );

    try {
      await connectToDatabase();
      await SeoAnalysisModel.create({
        analysisId: report.id,
        shareSlug: report.shareSlug,
        userId: "anonymous",
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
