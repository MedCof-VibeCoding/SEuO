/**
 * Gera números pseudoaleatórios determinísticos a partir do domínio (mock consistente).
 */
export function domainSeed(domain: string): number {
  let h = 0;
  for (let i = 0; i < domain.length; i++) {
    h = (h << 5) - h + domain.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function seededRange(seed: number, min: number, max: number, salt = 0): number {
  const x = Math.sin(seed + salt) * 10000;
  const frac = x - Math.floor(x);
  return Math.round(min + frac * (max - min));
}

export function seededFloat(seed: number, min: number, max: number, salt = 0): number {
  const x = Math.sin(seed + salt * 1.7) * 10000;
  const frac = x - Math.floor(x);
  return Math.round((min + frac * (max - min)) * 10) / 10;
}
