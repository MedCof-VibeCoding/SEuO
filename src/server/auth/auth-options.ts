import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { env } from "~/env";
import { connectToDatabase } from "~/server/db/connection";
import { UserModel } from "~/server/db/models/user";
import { syncOAuthUser } from "~/server/auth/sync-oauth-user";
import { getAuthCookies } from "~/server/auth/auth-cookies";
import {
  hasSearchConsoleAccess,
  saveGoogleTokens,
} from "~/server/search-console/google-tokens";

const GOOGLE_SEARCH_CONSOLE_SCOPE =
  "https://www.googleapis.com/auth/webmasters.readonly";

const credentialsSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(1).max(128),
});

const googleEnabled =
  Boolean(env.GOOGLE_CLIENT_ID) && Boolean(env.GOOGLE_CLIENT_SECRET);
const githubEnabled =
  Boolean(env.GITHUB_CLIENT_ID) && Boolean(env.GITHUB_CLIENT_SECRET);

/**
 * Carrega plano e imagem do usuário no token JWT.
 */
async function loadUserTokenFields(userId: string): Promise<{
  plan: "free" | "pro";
  image: string | null;
}> {
  await connectToDatabase();
  const doc = await UserModel.findById(userId).lean();
  const plan: "free" | "pro" = doc?.plan === "pro" ? "pro" : "free";
  return {
    plan,
    image: doc?.image ?? null,
  };
}

/**
 * NextAuth: credenciais, Google e GitHub (JWT).
 */
export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === "development",
  cookies: getAuthCookies(),
  pages: {
    signIn: "/login",
  },
  providers: [
    ...(googleEnabled
      ? [
          GoogleProvider({
            clientId: env.GOOGLE_CLIENT_ID!,
            clientSecret: env.GOOGLE_CLIENT_SECRET!,
            authorization: {
              params: {
                scope: `openid email profile ${GOOGLE_SEARCH_CONSOLE_SCOPE}`,
                access_type: "offline",
                prompt: "consent",
              },
            },
          }),
        ]
      : []),
    ...(githubEnabled
      ? [
          GitHubProvider({
            clientId: env.GITHUB_CLIENT_ID!,
            clientSecret: env.GITHUB_CLIENT_SECRET!,
          }),
        ]
      : []),
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse({
          email: raw?.email,
          password: raw?.password,
        });
        if (!parsed.success) {
          return null;
        }
        const { email, password } = parsed.data;
        await connectToDatabase();
        const user = await UserModel.findOne({
          email: email.toLowerCase().trim(),
        }).lean();
        if (!user?.passwordHash) {
          return null;
        }
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
          return null;
        }
        const trimmedName = user.fullName?.trim();
        const displayName =
          trimmedName && trimmedName.length > 0
            ? trimmedName
            : (user.email?.split("@")[0] ?? "Usuário");

        return {
          id: user._id.toString(),
          email: user.email,
          name: displayName,
          image: user.image ?? undefined,
          plan: user.plan === "pro" ? "pro" : "free",
        };
      },
    }),
  ],
  secret:
    env.NEXTAUTH_SECRET ??
    (process.env.NODE_ENV === "development"
      ? "dev-insecure-nextauth-secret-set-NEXTAUTH_SECRET-in-env"
      : undefined),
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google" && account?.provider !== "github") {
        return true;
      }
      if (!user.email) return false;
      try {
        const id = await syncOAuthUser({
          email: user.email,
          name: user.name,
          image: user.image,
        });
        user.id = id;
        return true;
      } catch (err) {
        console.error("[auth signIn]", err);
        return false;
      }
    },
    async jwt({ token, user, account }) {
      if (user?.id) {
        token.sub = user.id;
      }
      if (user?.email) {
        token.email = user.email;
      }
      if (user?.name) {
        token.name = user.name;
      }
      if (user?.image) {
        token.picture = user.image;
      }
      if (account && user?.id) {
        const fields = await loadUserTokenFields(user.id);
        token.plan = fields.plan;
        token.picture = fields.image ?? token.picture;
        if (account.provider === "google") {
          await saveGoogleTokens(user.id, {
            accessToken: account.access_token,
            refreshToken: account.refresh_token,
            expiresAt: account.expires_at,
          });
          token.gscConnected = true;
        }
      }
      if (user && "plan" in user && user.plan) {
        token.plan = user.plan as "free" | "pro";
      }
      if (token.sub && !token.plan) {
        const fields = await loadUserTokenFields(token.sub);
        token.plan = fields.plan;
      }
      if (token.sub) {
        token.gscConnected = await hasSearchConsoleAccess(token.sub);
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        if (token.sub) {
          session.user.id = token.sub;
        }
        if (token.email) {
          session.user.email = token.email;
        }
        if (token.name) {
          session.user.name = token.name;
        }
        if (token.picture) {
          session.user.image = token.picture;
        }
        session.user.plan = token.plan === "pro" ? "pro" : "free";
      }
      session.gscConnected = Boolean(token.gscConnected);
      return session;
    },
  },
};
