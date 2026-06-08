/**
 * Normaliza URL de página para comparação (protocolo https, sem hash, trailing slash opcional).
 */
export function normalizePageUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withProto);
    url.hash = "";
    let path = url.pathname;
    if (path.length > 1 && path.endsWith("/")) {
      path = path.slice(0, -1);
    }
    url.pathname = path || "/";
    return url.toString().replace(/\/$/, "") || url.origin;
  } catch {
    return trimmed;
  }
}
