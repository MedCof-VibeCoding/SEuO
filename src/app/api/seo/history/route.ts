import { NextResponse } from "next/server";

import { getServerSession } from "next-auth";



import { authOptions } from "~/server/auth/auth-options";

import { getAnalysisUsage } from "~/server/auth/plan-limits";

import { connectToDatabase } from "~/server/db/connection";

import { SeoAnalysisModel } from "~/server/db/models/seo-analysis";



/**

 * GET — histórico (opcional se houver sessão; senão vazio).

 */

export async function GET() {

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {

    return NextResponse.json({

      plan: "pro",

      usage: { used: 0, limit: null },

      history: [],

    });

  }



  await connectToDatabase();

  const usage = await getAnalysisUsage(session.user.id);

  const limit = usage.limit ?? 999;

  const historyLimit = session.user.plan === "pro" ? 50 : 10;



  const items = await SeoAnalysisModel.find({ userId: session.user.id })

    .sort({ createdAt: -1 })

    .limit(historyLimit)

    .select("analysisId shareSlug primaryDomain createdAt report.domains")

    .lean();



  const history = items.map((doc) => {

    const domains = (doc.report as { domains?: { overallScore: number }[] })?.domains;

    const primary = domains?.[0];

    return {

      id: doc.analysisId,

      shareSlug: doc.shareSlug,

      primaryDomain: doc.primaryDomain,

      createdAt: doc.createdAt,

      overallScore: primary?.overallScore ?? 0,

    };

  });



  return NextResponse.json({

    plan: session.user.plan,

    usage: { used: usage.used, limit },

    history,

  });

}


