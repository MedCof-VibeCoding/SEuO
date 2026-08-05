import "server-only";

import { env } from "~/env";

/**
 * Confirma se um e-mail pode acessar os dados privados do projeto Clarity.
 */
export function isClarityEmailAllowed(email: string | null | undefined): boolean {
  if (!email || !env.CLARITY_ALLOWED_EMAILS) return false;
  const allowed = env.CLARITY_ALLOWED_EMAILS.split(",").map((item) =>
    item.trim().toLowerCase(),
  );
  return allowed.includes(email.toLowerCase());
}
