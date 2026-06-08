import "~/styles/globals.css";

import { type Metadata, type Viewport } from "next";
import { Geist } from "next/font/google";
import { getServerSession } from "next-auth";

import { AuthSessionProvider } from "~/app/_components/auth-session-provider";
import { AppToaster } from "~/app/_components/app-toaster";
import { authOptions } from "~/server/auth/auth-options";
import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: {
    default: "SEuO — Análise SEO comparativa",
    template: "%s | SEuO",
  },
  description:
    "Compare seu site com concorrentes. SEO técnico, performance, conteúdo e autoridade digital.",
  icons: [{ rel: "icon", url: "/seuo-logo-icon.svg", type: "image/svg+xml" }],
};

export const viewport: Viewport = {
  themeColor: "#0a0607",
};

const geist = Geist({
  subsets: ["latin", "latin-ext"],
  variable: "--font-geist-sans",
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="pt-BR" className={`${geist.variable}`}>
      <body className="min-h-screen bg-shell text-white antialiased">
        <TRPCReactProvider>
          <AuthSessionProvider session={session}>
            {children}
            <AppToaster />
          </AuthSessionProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
