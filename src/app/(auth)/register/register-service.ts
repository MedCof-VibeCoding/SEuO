export type RegisterPayload = {
  fullName: string;
  email: string;
  password: string;
};

export type RegisterApiError =
  | "EMAIL_IN_USE"
  | "VALIDATION_ERROR"
  | "NETWORK"
  | "SERVER_ERROR"
  | "UNKNOWN";

const MOCK_DELAY_MS = 650;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Simula latência de rede e envia o cadastro para a API real (`/api/auth/register`).
 */
export async function registerAccount(
  input: RegisterPayload,
): Promise<
  | { ok: true }
  | { ok: false; error: RegisterApiError; message?: string }
> {
  await delay(MOCK_DELAY_MS);

  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: input.fullName.trim(),
        email: input.email.trim().toLowerCase(),
        password: input.password,
      }),
    });

    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      message?: string;
    };

    if (res.status === 201) {
      return { ok: true };
    }
    if (res.status === 409 && data.error === "EMAIL_IN_USE") {
      return { ok: false, error: "EMAIL_IN_USE" };
    }
    if (res.status === 400) {
      return { ok: false, error: "VALIDATION_ERROR" };
    }
    if (res.status >= 500) {
      return {
        ok: false,
        error: "SERVER_ERROR",
        message: data.message,
      };
    }
    return { ok: false, error: "UNKNOWN" };
  } catch {
    return { ok: false, error: "NETWORK" };
  }
}
