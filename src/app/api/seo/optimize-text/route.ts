import { NextResponse } from "next/server";



import { optimizeTextSchema } from "~/features/text-optimize/schemas/optimize-input";

import { optimizeText } from "~/features/text-optimize/services/optimize-text";



/**

 * POST — otimização de texto SEO com IA (público, sem login).

 */

export async function POST(request: Request) {

  let json: unknown;

  try {

    json = await request.json();

  } catch {

    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });

  }



  const parsed = optimizeTextSchema.safeParse(json);

  if (!parsed.success) {

    return NextResponse.json(

      { error: "VALIDATION_ERROR", details: parsed.error.flatten() },

      { status: 400 },

    );

  }



  const result = await optimizeText(parsed.data);

  return NextResponse.json({ result });

}


