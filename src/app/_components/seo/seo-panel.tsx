import type { ReactNode } from "react";

type SeoPanelProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  id?: string;
};

/**
 * Card com glassmorphism leve para o dashboard SEO.
 */
export function SeoPanel({
  children,
  className = "",
  delay = 0,
  id,
}: SeoPanelProps) {
  return (
    <section
      id={id}
      className={[
        "animate-seo-fade-up rounded-2xl border border-sidebar-border bg-sidebar/90 p-5 shadow-[0_0_48px_-16px_var(--color-brand)] backdrop-blur-sm sm:p-6",
        className,
      ].join(" ")}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </section>
  );
}
