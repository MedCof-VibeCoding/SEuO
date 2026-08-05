import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { analyzeHtmlSchema } from "~/features/seo/schemas/html-seo-analysis-input";
import { analyzeHtmlSeo } from "~/features/seo/services/html-seo-analyzer";
import { authOptions } from "~/server/auth/auth-options";
import { getGoogleAccessToken } from "~/server/search-console/google-tokens";

/**
 * POST — análise SEO de HTML com métricas on-page, keywords e Search Console.
 */
export async function POST(request: Request) {
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

  const parsed = analyzeHtmlSchema.safeParse({
    html: body.html ?? "",
    url: body.url ?? "",
    mainKeyword: body.mainKeyword ?? "",
  });

  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message ?? "Dados inválidos.";
    return NextResponse.json({ error: "VALIDATION_ERROR", message }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  let gscAccessToken: string | null = null;
  if (session?.user?.id) {
    gscAccessToken = await getGoogleAccessToken(session.user.id);
  }

  try {
    const result = await analyzeHtmlSeo({
      html: parsed.data.html,
      url: parsed.data.url,
      mainKeyword: parsed.data.mainKeyword,
      gscAccessToken,
    });

    return NextResponse.json({ result }, { status: 200 });
  } catch (err) {
    console.error("[api/seo/analyze-html]", err);
    const message = err instanceof Error ? err.message : "Falha na análise do HTML.";
    return NextResponse.json({ error: "ANALYSIS_FAILED", message }, { status: 500 });
  }
}
