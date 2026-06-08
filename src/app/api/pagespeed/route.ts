import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  url: z.string().url(),
  strategy: z.enum(["mobile", "desktop"]).optional().default("mobile"),
});

/**
 * Mock PageSpeed Insights API — substituir por integração real.
 */
export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "VALIDATION_ERROR" }, { status: 400 });
  }

  await new Promise((r) => setTimeout(r, 350));

  const mobile = 48 + Math.floor(Math.random() * 45);
  const desktop = mobile + 8 + Math.floor(Math.random() * 12);

  return NextResponse.json({
    source: "pagespeed-mock",
    url: parsed.data.url,
    strategy: parsed.data.strategy,
    loadingExperience: {
      metrics: {
        FIRST_CONTENTFUL_PAINT_MS: { percentile: 1200 + Math.floor(Math.random() * 2000) },
        INTERACTION_TO_NEXT_PAINT_MS: { percentile: 180 + Math.floor(Math.random() * 300) },
      },
    },
    lighthouseResult: {
      categories: {
        performance: { score: (parsed.data.strategy === "mobile" ? mobile : desktop) / 100 },
      },
    },
    scores: { mobile, desktop },
  });
}
