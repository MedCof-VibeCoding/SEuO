import { type Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "~/server/auth/auth-options";

import { RegisterPage } from "./RegisterPage";

export const metadata: Metadata = {
  title: "Criar conta | SEuO",
  description: "Cadastre-se no SEuO.",
};

export default async function RegisterRoutePage() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect("/workspace");
  }

  return <RegisterPage />;
}
