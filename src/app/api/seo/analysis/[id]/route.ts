import { NextResponse } from "next/server";

import type { SeoAnalysisReport } from "~/features/seo/types/analysis";
import { connectToDatabase } from "~/server/db/connection";
import { SeoAnalysisModel } from "~/server/db/models/seo-analysis";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET — recupera relatório por id ou shareSlug.
 */
export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    await connectToDatabase();
    const doc = await SeoAnalysisModel.findOne({
      $or: [{ analysisId: id }, { shareSlug: id }],
    }).lean();

    if (!doc?.report) {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }

    return NextResponse.json({ report: doc.report as SeoAnalysisReport });
  } catch {
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
