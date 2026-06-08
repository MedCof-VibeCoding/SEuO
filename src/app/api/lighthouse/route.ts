import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  url: z.string().url(),
  strategy: z.enum(["mobile", "desktop"]).optional().default("mobile"),
});

/**
 * Mock Google Lighthouse API — substituir por integração real.
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

  await new Promise((r) => setTimeout(r, 400));

  const score = 55 + Math.floor(Math.random() * 40);

  return NextResponse.json({
    source: "lighthouse-mock",
    url: parsed.data.url,
    strategy: parsed.data.strategy,
    categories: {
      performance: score,
      accessibility: score - 5,
      bestPractices: score + 3,
      seo: score - 2,
    },
    audits: {
      "largest-contentful-paint": { score: 0.72, displayValue: "2.1 s" },
      "cumulative-layout-shift": { score: 0.88, displayValue: "0.05" },
    },
  });
}
