import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

import {
  ClarityApiError,
  clarityDimensions,
  fetchClarityInsights,
} from "~/server/clarity/clarity-api";
import { isClarityEmailAllowed } from "~/server/clarity/clarity-auth";
import { authOptions } from "~/server/auth/auth-options";

const querySchema = z.object({
  numOfDays: z.coerce.number().int().min(1).max(3).default(1),
  dimensions: z.array(z.enum(clarityDimensions)).max(3).default(["URL"]),
});

/**
 * GET — retorna insights agregados do Clarity para usuários autorizados.
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
        message: "Seu e-mail não está autorizado em CLARITY_ALLOWED_EMAILS.",
      },
      { status: 403 },
    );
  }

  const url = new URL(request.url);
  const dimensions = url.searchParams.getAll("dimension");
  const parsed = querySchema.safeParse({
    numOfDays: url.searchParams.get("numOfDays") ?? 1,
    dimensions: dimensions.length ? dimensions : ["URL"],
  });
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "VALIDATION_ERROR",
        message: "Use 1–3 dias e no máximo três dimensões válidas.",
      },
      { status: 400 },
    );
  }

  try {
    const metrics = await fetchClarityInsights({
      numOfDays: parsed.data.numOfDays as 1 | 2 | 3,
      dimensions: parsed.data.dimensions,
    });
    return NextResponse.json({
      source: "microsoft_clarity",
      timezone: "UTC",
      numOfDays: parsed.data.numOfDays,
      dimensions: parsed.data.dimensions,
      fetchedAt: new Date().toISOString(),
      metrics,
    });
  } catch (error) {
    if (error instanceof ClarityApiError) {
      return NextResponse.json(
        { error: error.code, message: error.message },
        { status: error.status },
      );
    }
    console.error("[api/seo/clarity/insights]", error);
    return NextResponse.json(
      { error: "CLARITY_REQUEST_FAILED", message: "Falha ao consultar o Clarity." },
      { status: 500 },
    );
  }
}
