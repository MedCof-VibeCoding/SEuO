/**
 * Inicia OAuth Google via POST (evita a página intermediária do NextAuth com só "Google").
 */
export async function redirectToGoogleSignIn(callbackUrl = "/workspace"): Promise<void> {
  const csrfRes = await fetch("/api/auth/csrf");
  if (!csrfRes.ok) {
    throw new Error("Não foi possível iniciar o login com Google.");
  }

  const { csrfToken } = (await csrfRes.json()) as { csrfToken: string };

  const form = document.createElement("form");
  form.method = "POST";
  form.action = `/api/auth/signin/google?${new URLSearchParams({ callbackUrl }).toString()}`;

  const csrfInput = document.createElement("input");
  csrfInput.type = "hidden";
  csrfInput.name = "csrfToken";
  csrfInput.value = csrfToken;
  form.appendChild(csrfInput);

  document.body.appendChild(form);
  form.submit();
}
