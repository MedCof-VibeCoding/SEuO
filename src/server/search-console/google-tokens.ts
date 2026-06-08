import "server-only";

import { env } from "~/env";
import { connectToDatabase } from "~/server/db/connection";
import { UserModel } from "~/server/db/models/user";

type GoogleTokenPayload = {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
};

/**
 * Persiste tokens OAuth do Google (Search Console) no usuário.
 */
export async function saveGoogleTokens(
  userId: string,
  tokens: {
    accessToken?: string | null;
    refreshToken?: string | null;
    expiresAt?: number | null;
  },
): Promise<void> {
  if (!tokens.accessToken && !tokens.refreshToken) return;

  await connectToDatabase();
  const $set: Record<string, string | Date> = {};
  if (tokens.accessToken) $set.googleAccessToken = tokens.accessToken;
  if (tokens.refreshToken) $set.googleRefreshToken = tokens.refreshToken;
  if (tokens.expiresAt) $set.googleTokenExpiresAt = new Date(tokens.expiresAt * 1000);

  await UserModel.updateOne({ _id: userId }, { $set });
}

/**
 * Retorna access token válido, renovando com refresh_token se necessário.
 */
export async function getGoogleAccessToken(userId: string): Promise<string | null> {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) return null;

  await connectToDatabase();
  const user = await UserModel.findById(userId).lean();
  if (!user?.googleRefreshToken && !user?.googleAccessToken) return null;

  const expiresAt = user.googleTokenExpiresAt
    ? new Date(user.googleTokenExpiresAt).getTime()
    : 0;
  const stillValid =
    user.googleAccessToken && expiresAt > Date.now() + 60_000;

  if (stillValid && user.googleAccessToken) {
    return user.googleAccessToken;
  }

  if (!user.googleRefreshToken) {
    return user.googleAccessToken ?? null;
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      refresh_token: user.googleRefreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) return null;

  const data = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };

  const next: GoogleTokenPayload = {
    accessToken: data.access_token,
    refreshToken: user.googleRefreshToken,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
  };

  await UserModel.updateOne(
    { _id: userId },
    {
      $set: {
        googleAccessToken: next.accessToken,
        googleRefreshToken: next.refreshToken,
        googleTokenExpiresAt: next.expiresAt,
      },
    },
  );

  return next.accessToken;
}

/**
 * Indica se o usuário pode chamar a API do Search Console.
 */
export async function hasSearchConsoleAccess(userId: string): Promise<boolean> {
  await connectToDatabase();
  const user = await UserModel.findById(userId).lean();
  return Boolean(user?.googleRefreshToken || user?.googleAccessToken);
}
