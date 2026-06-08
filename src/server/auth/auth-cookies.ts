import type { NextAuthOptions } from "next-auth";

/**
 * Cookies do NextAuth em HTTP local (evita "State cookie was missing").
 */
export function getAuthCookies(): NextAuthOptions["cookies"] {
  const secure = process.env.NEXTAUTH_URL?.startsWith("https://") ?? false;
  const prefix = secure ? "__Secure-" : "";

  const base = {
    sameSite: "lax" as const,
    path: "/",
    secure,
  };

  return {
    sessionToken: {
      name: `${prefix}next-auth.session-token`,
      options: { ...base, httpOnly: true },
    },
    callbackUrl: {
      name: `${prefix}next-auth.callback-url`,
      options: { ...base, httpOnly: true },
    },
    csrfToken: {
      name: `${secure ? "__Host-" : ""}next-auth.csrf-token`,
      options: { ...base, httpOnly: true },
    },
    pkceCodeVerifier: {
      name: `${prefix}next-auth.pkce.code_verifier`,
      options: { ...base, httpOnly: true, maxAge: 60 * 15 },
    },
    state: {
      name: `${prefix}next-auth.state`,
      options: { ...base, httpOnly: true, maxAge: 60 * 15 },
    },
  };
}
