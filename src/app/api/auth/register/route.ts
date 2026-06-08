import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { connectToDatabase } from "~/server/db/connection";
import { UserModel } from "~/server/db/models/user";

const registerBodySchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().email().max(320),
  password: z.string().min(8).max(128),
});

/**
 * Cria usuário com nome, e-mail e senha (hash bcrypt).
 */
export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const parsed = registerBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "VALIDATION_ERROR" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase().trim();
  const fullName = parsed.data.fullName.trim();
  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  try {
    await connectToDatabase();
    await UserModel.create({ email, passwordHash, fullName, plan: "free" });
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      err.code === 11000
    ) {
      return NextResponse.json({ error: "EMAIL_IN_USE" }, { status: 409 });
    }
    const message =
      err instanceof Error ? err.message : "Erro ao salvar no banco de dados.";
    console.error("[register]", err);
    return NextResponse.json(
      {
        error: "SERVER_ERROR",
        message:
          process.env.NODE_ENV === "development" ? message : undefined,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
