import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { googlePositionCheckSchema } from "~/features/seo/schemas/google-position-check-input";
import { buildGooglePositionCheck } from "~/features/seo/services/google-position-check-engine";
import { buildGooglePositionFromSearchConsole } from "~/features/seo/services/google-position-search-console";
import { authOptions } from "~/server/auth/auth-options";
import { getGoogleAccessToken, hasSearchConsoleAccess } from "~/server/search-console/google-tokens";
import { SearchConsoleApiError } from "~/server/search-console/search-console-api";

const USE_MOCK = process.env.GSC_USE_MOCK === "true";

/**
 * POST — posição via Google Search Console (OAuth) ou mock se GSC_USE_MOCK=true.
 */
export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON", message: "JSON inválido." }, { status: 400 });
  }

  const parsed = googlePositionCheckSchema.safeParse(json);
  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message ?? "Dados inválidos.";
    return NextResponse.json({ error: "VALIDATION_ERROR", message }, { status: 400 });
  }

  if (USE_MOCK) {
    const result = buildGooglePositionCheck(parsed.data.url, parsed.data.keyword);
    console.log(JSON.stringify(result, null, 2));
    return NextResponse.json({ result });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      {
        error: "GSC_AUTH_REQUIRED",
        message: "Entre com Google para consultar o Search Console.",
      },
      { status: 401 },
    );
  }

  const hasGsc = await hasSearchConsoleAccess(session.user.id);
  if (!hasGsc) {
    return NextResponse.json(
      {
        error: "GSC_TOKEN_MISSING",
        message:
          "Conecte sua conta Google com permissão do Search Console (faça logout e login novamente com Google).",
      },
      { status: 403 },
    );
  }

  const accessToken = await getGoogleAccessToken(session.user.id);
  if (!accessToken) {
    return NextResponse.json(
      {
        error: "GSC_TOKEN_MISSING",
        message: "Não foi possível renovar o acesso ao Google. Entre novamente com Google.",
      },
      { status: 403 },
    );
  }

  try {
    const result = await buildGooglePositionFromSearchConsole(
      accessToken,
      parsed.data.url,
      parsed.data.keyword,
    );
    console.log(JSON.stringify(result, null, 2));
    return NextResponse.json({ result });
  } catch (err) {
    if (err instanceof Error && err.message === "GSC_PROPERTY_NOT_FOUND") {
      return NextResponse.json(
        {
          error: "GSC_PROPERTY_NOT_FOUND",
          message:
            "Nenhuma propriedade do Search Console corresponde a esta URL. Verifique o domínio no GSC.",
        },
        { status: 404 },
      );
    }
    if (err instanceof SearchConsoleApiError) {
      console.error("[gsc]", err.status, err.body);
      return NextResponse.json(
        {
          error: "GSC_API_ERROR",
          message:
            err.status === 403
              ? "Sem permissão no Search Console. Ative a API e verifique o acesso à propriedade."
              : "Erro ao consultar o Search Console.",
        },
        { status: 502 },
      );
    }
    console.error("[google-position-check]", err);
    return NextResponse.json(
      { error: "SERVER_ERROR", message: "Falha ao processar dados do Search Console." },
      { status: 500 },
    );
  }
}
