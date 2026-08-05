import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "~/server/auth/auth-options";
import { ClarityApiError } from "~/server/clarity/clarity-api";
import { isClarityEmailAllowed } from "~/server/clarity/clarity-auth";
import { buildClarityDashboard } from "~/server/clarity/clarity-dashboard";

/**
 * GET — métricas do Microsoft Clarity para a URL analisada.
 */
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "Faça login para consultar o Clarity." },
      { status: 401 },
    );
  }
  if (!isClarityEmailAllowed(session.user.email)) {
    return NextResponse.json(
      {
        error: "FORBIDDEN",
        message: "Seu e-mail não está autorizado a consultar o Clarity.",
      },
      { status: 403 },
    );
  }

  const targetUrl = new URL(request.url).searchParams.get("targetUrl")?.trim();
  if (!targetUrl) {
    return NextResponse.json(
      {
        error: "MISSING_TARGET_URL",
        message: "Informe a URL analisada para consultar o Clarity.",
      },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json({ result: await buildClarityDashboard(targetUrl) });
  } catch (error) {
    if (error instanceof ClarityApiError) {
      return NextResponse.json(
        { error: error.code, message: error.message },
        { status: error.status },
      );
    }
    console.error("[api/seo/clarity/dashboard]", error);
    return NextResponse.json(
      { error: "CLARITY_DASHBOARD_FAILED", message: "Falha ao consultar o Clarity." },
      { status: 500 },
    );
  }
}
