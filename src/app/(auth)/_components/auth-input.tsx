import { forwardRef, type ReactNode } from "react";

export type AuthInputProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightSlot?: ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>;

/**
 * Campo de formulário com label, ícone à esquerda e slot opcional (ex.: mostrar senha).
 */
export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  function AuthInput(
    {
      id,
      label,
      hint,
      error,
      leftIcon,
      rightSlot,
      className = "",
      disabled,
      ...rest
    },
    ref,
  ) {
    const errId = `${id}-error`;
    const hintId = `${id}-hint`;

    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={id}
          className="text-xs font-semibold tracking-wide text-white/70"
        >
          {label}
        </label>
        <div className="group relative">
          {leftIcon ? (
            <span
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 transition group-focus-within:text-brand-bright"
              aria-hidden
            >
              {leftIcon}
            </span>
          ) : null}
          <input
            ref={ref}
            id={id}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={
              [error ? errId : null, hint ? hintId : null].filter(Boolean).join(" ") ||
              undefined
            }
            className={[
              "w-full rounded-xl border bg-black/30 py-3 text-sm text-white outline-none transition",
              "placeholder:text-white/35",
              "hover:border-white/25 hover:bg-black/35",
              "focus:border-brand/55 focus:bg-black/40 focus:ring-2 focus:ring-brand/30",
              "disabled:cursor-not-allowed disabled:opacity-55",
              leftIcon ? "pl-11 pr-3" : "px-4",
              rightSlot ? "pr-12" : "",
              error
                ? "border-brand/60 ring-1 ring-brand/25"
                : "border-white/12",
              className,
            ].join(" ")}
            {...rest}
          />
          {rightSlot ? (
            <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center">
              {rightSlot}
            </div>
          ) : null}
        </div>
        {hint && !error ? (
          <p id={hintId} className="text-xs text-white/45">
            {hint}
          </p>
        ) : null}
        {error ? (
          <p id={errId} role="alert" className="text-xs font-medium text-brand-bright">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
