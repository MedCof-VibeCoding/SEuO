import { NextResponse } from "next/server";

import { quickWinInputSchema } from "~/features/seo/schemas/quick-win-input";
import { generateQuickWin } from "~/features/seo/services/generate-quick-win";

/**
 * POST — gera briefing Quick Win SEO em Markdown.
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

  const parsed = quickWinInputSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "VALIDATION_ERROR",
        message: parsed.error.errors[0]?.message ?? "Verifique os dados.",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  try {
    const markdown = await generateQuickWin(parsed.data);
    return NextResponse.json({ markdown });
  } catch (error) {
    const code =
      error instanceof Error && error.message === "OPENAI_NOT_CONFIGURED"
        ? "OPENAI_NOT_CONFIGURED"
        : "GENERATION_FAILED";
    const status = code === "OPENAI_NOT_CONFIGURED" ? 503 : 500;
    const message =
      code === "OPENAI_NOT_CONFIGURED"
        ? "Configure OPENAI_API_KEY e reinicie o servidor."
        : "Não foi possível gerar o Quick Win. Tente novamente.";

    console.error("[api/seo/quick-win]", error);
    return NextResponse.json({ error: code, message }, { status });
  }
}
