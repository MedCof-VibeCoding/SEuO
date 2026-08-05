import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import {
  buildComparativeSearchConsoleData,
  buildDisconnectedSearchConsoleData,
} from "~/features/seo/services/comparative-search-console";
import { authOptions } from "~/server/auth/auth-options";
import { getGoogleAccessToken } from "~/server/search-console/google-tokens";

/**
 * GET — métricas GSC para uma URL (enriquecimento do relatório comparativo).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url")?.trim();
  const mainKeyword = searchParams.get("keyword")?.trim() || undefined;

  if (!url) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: "Informe a URL." },
      { status: 400 },
    );
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({
      searchConsole: buildDisconnectedSearchConsoleData(url, mainKeyword),
    });
  }

  const accessToken = await getGoogleAccessToken(session.user.id);
  if (!accessToken) {
    return NextResponse.json({
      searchConsole: {
        ...buildDisconnectedSearchConsoleData(url, mainKeyword),
        connected: true,
        insight:
          "Reconecte sua conta Google com permissão do Search Console para ver dados reais.",
      },
    });
  }

  try {
    const searchConsole = await buildComparativeSearchConsoleData(accessToken, url, {
      mainKeyword,
    });
    return NextResponse.json({ searchConsole });
  } catch (err) {
    console.error("[search-console/page-metrics]", err);
    return NextResponse.json({
      searchConsole: {
        ...buildDisconnectedSearchConsoleData(url, mainKeyword),
        connected: true,
        insight: "Não foi possível consultar o Search Console agora. Tente novamente.",
      },
    });
  }
}
