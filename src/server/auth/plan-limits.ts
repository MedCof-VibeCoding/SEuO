import "server-only";

import { PLAN_LIMITS, type UserPlan } from "~/features/seo/constants/plans";
import { connectToDatabase } from "~/server/db/connection";
import { UserModel } from "~/server/db/models/user";

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Verifica cota diária e incrementa contador de análises do usuário.
 */
export async function consumeAnalysisQuota(userId: string): Promise<
  | { ok: true; plan: UserPlan }
  | { ok: false; error: "LIMIT_REACHED"; plan: UserPlan; limit: number }
> {
  await connectToDatabase();
  const user = await UserModel.findById(userId).lean();
  if (!user) {
    return { ok: false, error: "LIMIT_REACHED", plan: "free", limit: 0 };
  }

  const plan = (user.plan === "pro" ? "pro" : "free") as UserPlan;
  const limit = PLAN_LIMITS[plan].analysesPerDay;

  if (limit === Infinity) {
    return { ok: true, plan };
  }

  const dayKey = todayKey();
  let count = user.analysesToday ?? 0;
  if (user.analysesDayKey !== dayKey) {
    count = 0;
  }

  if (count >= limit) {
    return { ok: false, error: "LIMIT_REACHED", plan, limit };
  }

  await UserModel.updateOne(
    { _id: userId },
    {
      $set: { analysesDayKey: dayKey, analysesToday: count + 1 },
    },
  );

  return { ok: true, plan };
}

/**
 * Retorna plano e uso atual sem incrementar.
 */
export async function getAnalysisUsage(userId: string) {
  await connectToDatabase();
  const user = await UserModel.findById(userId).lean();
  if (!user) {
    return { plan: "free" as UserPlan, used: 0, limit: PLAN_LIMITS.free.analysesPerDay };
  }

  const plan = (user.plan === "pro" ? "pro" : "free") as UserPlan;
  const limit = PLAN_LIMITS[plan].analysesPerDay;
  const dayKey = todayKey();
  const used =
    user.analysesDayKey === dayKey ? (user.analysesToday ?? 0) : 0;

  return { plan, used, limit: limit === Infinity ? null : limit };
}
