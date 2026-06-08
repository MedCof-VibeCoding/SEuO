/**
 * Normaliza entrada do usuário para hostname (sem protocolo/path).
 */
export function normalizeDomain(input: string): string {
  let value = input.trim().toLowerCase();
  if (!value) {
    return "";
  }
  if (!/^https?:\/\//i.test(value)) {
    value = `https://${value}`;
  }
  try {
    const url = new URL(value);
    return url.hostname.replace(/^www\./, "");
  } catch {
    const cleaned = value
      .replace(/^https?:\/\//, "")
      .split("/")[0]
      ?.split("?")[0]
      ?.replace(/^www\./, "");
    return cleaned ?? input.trim().toLowerCase();
  }
}
