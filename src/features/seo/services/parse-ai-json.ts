/**
 * Remove cercas markdown e extrai o primeiro objeto JSON do texto da IA.
 */
export function parseAiJsonText(text: string): unknown {
  let s = text.trim();
  if (!s) {
    throw new Error("empty");
  }

  const fenced = /^```(?:json)?\s*\n?([\s\S]*?)\n?```$/im.exec(s);
  if (fenced?.[1]) {
    s = fenced[1].trim();
  } else if (s.startsWith("```")) {
    s = s.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
  }

  const attempts = [s, stripTrailingCommas(s)];
  for (const candidate of attempts) {
    try {
      return JSON.parse(candidate);
    } catch {
      /* try extract */
    }

    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start >= 0 && end > start) {
      const slice = candidate.slice(start, end + 1);
      try {
        return JSON.parse(slice);
      } catch {
        try {
          return JSON.parse(stripTrailingCommas(slice));
        } catch {
          /* next */
        }
      }
    }
  }

  throw new Error("invalid json");
}

function stripTrailingCommas(json: string): string {
  return json.replace(/,\s*([}\]])/g, "$1");
}

/**
 * Converte itens de lista da IA em strings (objetos com keyword/term/title).
 */
export function coerceStringList(value: unknown, max = 10): string[] {
  if (!Array.isArray(value)) {
    if (typeof value === "string" && value.trim()) {
      return [value.trim()].slice(0, max);
    }
    return [];
  }

  return value
    .slice(0, max)
    .map((item) => {
      if (typeof item === "string") return item.trim();
      if (typeof item === "number") return String(item);
      if (item && typeof item === "object") {
        const o = item as Record<string, unknown>;
        for (const key of ["keyword", "term", "title", "name", "text", "label", "query"]) {
          const v = o[key];
          if (typeof v === "string" && v.trim()) return v.trim();
        }
        return JSON.stringify(item);
      }
      return String(item ?? "").trim();
    })
    .filter((s) => s.length > 0);
}

/**
 * Normaliza objeto chave → texto curto.
 */
export function coerceStringRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (typeof v === "string") {
      out[k] = v;
    } else if (v !== null && v !== undefined) {
      out[k] = typeof v === "object" ? JSON.stringify(v) : String(v);
    }
  }
  return out;
}

/**
 * Desembrulha payload aninhado (ex.: { keywords: { ... } }).
 */
export function unwrapStepPayload(
  data: unknown,
  nestedKeys: string[],
): Record<string, unknown> {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return {};
  }

  let current = data as Record<string, unknown>;
  for (const key of nestedKeys) {
    const inner = current[key];
    if (inner && typeof inner === "object" && !Array.isArray(inner)) {
      current = inner as Record<string, unknown>;
    }
  }
  return current;
}
