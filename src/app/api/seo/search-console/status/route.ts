import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "~/server/auth/auth-options";
import { getGoogleAccessToken, hasSearchConsoleAccess } from "~/server/search-console/google-tokens";
import { listGscSites } from "~/server/search-console/search-console-api";

/**
 * GET — status da conexão com Google Search Console.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ connected: false, signedIn: false });
  }

  const linked = await hasSearchConsoleAccess(session.user.id);
  if (!linked) {
    return NextResponse.json({ connected: false, signedIn: true });
  }

  const token = await getGoogleAccessToken(session.user.id);
  if (!token) {
    return NextResponse.json({ connected: false, signedIn: true });
  }

  try {
    const sites = await listGscSites(token);
    return NextResponse.json({
      connected: true,
      signedIn: true,
      properties: sites.map((s) => s.siteUrl),
    });
  } catch {
    return NextResponse.json({ connected: false, signedIn: true });
  }
}
