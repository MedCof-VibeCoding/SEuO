import Link from "next/link";

/**
 * Footer minimalista do Google Position Checker.
 */
export function GpcFooter() {
  return (
    <footer className="mt-16 border-t border-white/8 py-8 text-center text-xs text-white/40">
      <p>
        SEuO SEO · Google Position Checker · Google Search Console
      </p>
      <nav className="mt-3 flex flex-wrap justify-center gap-4">
        <Link href="/" className="transition hover:text-brand-bright">
          Benchmark SEO
        </Link>
      </nav>
    </footer>
  );
}
