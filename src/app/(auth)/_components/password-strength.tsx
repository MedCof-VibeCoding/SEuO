import { useMemo } from "react";

export type PasswordStrengthLevel = "empty" | "fraca" | "média" | "forte";

type PasswordStrengthProps = {
  password: string;
};

/**
 * Calcula e exibe a força da senha com barras e texto acessível.
 */
export function PasswordStrength({ password }: PasswordStrengthProps) {
  const { score, label, level } = useMemo(
    () => computeStrength(password),
    [password],
  );

  const bars = 4;
  const active = score;

  return (
    <div className="flex flex-col gap-2" aria-live="polite" aria-atomic="true">
      <div
        className="flex gap-1.5"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={4}
        aria-valuenow={active}
        aria-label={
          password.length === 0
            ? "Força da senha ainda não avaliada"
            : `Força da senha: ${label}`
        }
      >
        {Array.from({ length: bars }, (_, i) => {
          const filled = i < active;
          return (
            <span
              key={i}
              className={[
                "h-1.5 flex-1 rounded-full transition-all duration-300",
                filled ? barColor(level) : "bg-white/10",
              ].join(" ")}
            />
          );
        })}
      </div>
      <p className={`text-xs font-medium ${labelColor(level)}`}>
        {password.length === 0
          ? "Digite uma senha para ver a força."
          : `Força: ${label}`}
      </p>
    </div>
  );
}

function barColor(level: PasswordStrengthLevel): string {
  switch (level) {
    case "fraca":
      return "bg-brand-bright shadow-[0_0_12px_-2px_var(--color-brand)]";
    case "média":
      return "bg-amber-400/90 shadow-[0_0_10px_-3px_rgba(251,191,36,0.5)]";
    case "forte":
      return "bg-emerald-400/90 shadow-[0_0_10px_-3px_rgba(52,211,153,0.45)]";
    default:
      return "bg-white/15";
  }
}

function labelColor(level: PasswordStrengthLevel): string {
  switch (level) {
    case "fraca":
      return "text-brand-bright";
    case "média":
      return "text-amber-300/90";
    case "forte":
      return "text-emerald-300/90";
    default:
      return "text-white/45";
  }
}

function computeStrength(password: string): {
  score: number;
  label: string;
  level: PasswordStrengthLevel;
} {
  if (!password) {
    return { score: 0, label: "—", level: "empty" };
  }

  let p = 0;
  if (password.length >= 8) {
    p += 1;
  }
  if (password.length >= 12) {
    p += 1;
  }
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    p += 1;
  } else if (/[a-zA-Z]/.test(password)) {
    p += 1;
  }
  if (/\d/.test(password)) {
    p += 1;
  }
  if (/[^a-zA-Z0-9]/.test(password)) {
    p += 1;
  }

  const score = Math.min(4, Math.max(1, Math.ceil(p)));

  if (score <= 1) {
    return { score: 1, label: "Fraca", level: "fraca" };
  }
  if (score === 2) {
    return { score: 2, label: "Média", level: "média" };
  }
  if (score === 3) {
    return { score: 3, label: "Boa", level: "média" };
  }
  return { score: 4, label: "Forte", level: "forte" };
}
