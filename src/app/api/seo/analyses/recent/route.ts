import { NextResponse } from "next/server";

import { connectToDatabase } from "~/server/db/connection";
import { SeoAnalysisModel } from "~/server/db/models/seo-analysis";

type ReportSnapshot = {
  targetUrl?: string;
  mainKeyword?: string;
  competitorUrls?: string[];
  competitors?: string[];
  comparativeArticle?: { targetUrl?: string; mainKeyword?: string; competitorUrls?: string[] };
  domains?: { role?: string; overallScore?: number }[];
};

/**
 * GET — últimas análises comparativas salvas no MongoDB.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 20)));

  try {
    await connectToDatabase();
    const items = await SeoAnalysisModel.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("analysisId shareSlug primaryDomain createdAt report")
      .lean();

    const analyses = items.map((doc) => {
      const report = doc.report as ReportSnapshot;
      const primary = report.domains?.find((d) => d.role === "primary");
      const targetUrl =
        report.targetUrl ??
        report.comparativeArticle?.targetUrl ??
        doc.primaryDomain;
      const competitorUrls =
        report.competitorUrls ??
        report.comparativeArticle?.competitorUrls ??
        report.competitors ??
        [];

      return {
        id: doc.analysisId,
        shareSlug: doc.shareSlug,
        primaryDomain: doc.primaryDomain,
        targetUrl,
        mainKeyword: report.mainKeyword ?? report.comparativeArticle?.mainKeyword,
        competitorCount: competitorUrls.length,
        overallScore: primary?.overallScore ?? 0,
        createdAt: doc.createdAt?.toISOString?.() ?? new Date().toISOString(),
      };
    });

    return NextResponse.json({ analyses });
  } catch (err) {
    console.error("[api/seo/analyses/recent]", err);
    return NextResponse.json({ analyses: [] });
  }
}
