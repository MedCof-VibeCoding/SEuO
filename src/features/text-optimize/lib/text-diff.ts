export type DiffToken = {
  type: "equal" | "add" | "remove";
  text: string;
};

/**
 * Diff palavra a palavra (LCS simplificado) para exibição estilo GitHub.
 */
export function buildWordDiff(original: string, optimized: string): DiffToken[] {
  const a = original.split(/(\s+)/).filter((p) => p.length > 0);
  const b = optimized.split(/(\s+)/).filter((p) => p.length > 0);
  const n = a.length;
  const m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    Array<number>(m + 1).fill(0),
  );

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i]![j] = dp[i - 1]![j - 1]! + 1;
      } else {
        dp[i]![j] = Math.max(dp[i - 1]![j]!, dp[i]![j - 1]!);
      }
    }
  }

  const out: DiffToken[] = [];
  let i = n;
  let j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      out.unshift({ type: "equal", text: a[i - 1]! });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i]![j - 1]! >= dp[i - 1]![j]!)) {
      out.unshift({ type: "add", text: b[j - 1]! });
      j--;
    } else {
      out.unshift({ type: "remove", text: a[i - 1]! });
      i--;
    }
  }
  return out;
}
