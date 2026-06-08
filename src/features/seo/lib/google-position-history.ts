import type {
  GooglePositionCheckResult,
  GooglePositionHistoryEntry,
} from "~/features/seo/types/google-position-check";

export const GPC_HISTORY_KEY = "seuo-google-position-history";
const MAX_ENTRIES = 12;

/**
 * Carrega histórico de consultas do localStorage.
 */
export function loadGooglePositionHistory(): GooglePositionHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(GPC_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as GooglePositionHistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Persiste nova consulta no histórico (mais recente primeiro).
 */
export function saveGooglePositionHistory(result: GooglePositionCheckResult): GooglePositionHistoryEntry[] {
  const entry: GooglePositionHistoryEntry = {
    id: `${Date.now()}-${result.keyword.slice(0, 8)}`,
    url: result.url,
    keyword: result.keyword,
    position: result.position,
    rankTier: result.rankTier,
    checkedAt: result.checkedAt,
  };

  const prev = loadGooglePositionHistory().filter(
    (e) => !(e.url === entry.url && e.keyword === entry.keyword),
  );
  const next = [entry, ...prev].slice(0, MAX_ENTRIES);
  localStorage.setItem(GPC_HISTORY_KEY, JSON.stringify(next));
  return next;
}
