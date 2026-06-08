import "server-only";

import { connectToDatabase } from "~/server/db/connection";
import { UserModel } from "~/server/db/models/user";

type OAuthProfile = {
  email: string;
  name?: string | null;
  image?: string | null;
};

/**
 * Cria ou atualiza usuário após login social (Google/GitHub).
 */
export async function syncOAuthUser(profile: OAuthProfile): Promise<string> {
  const email = profile.email.toLowerCase().trim();
  await connectToDatabase();

  const existing = await UserModel.findOne({ email }).lean();
  if (existing) {
    await UserModel.updateOne(
      { _id: existing._id },
      {
        $set: {
          fullName: profile.name?.trim() || existing.fullName,
          image: profile.image ?? existing.image,
        },
      },
    );
    return existing._id.toString();
  }

  const created = await UserModel.create({
    email,
    fullName: profile.name?.trim() ?? "",
    image: profile.image ?? undefined,
    plan: "free",
  });
  return created._id.toString();
}
