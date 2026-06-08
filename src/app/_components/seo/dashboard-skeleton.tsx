/**
 * Skeleton de loading do dashboard SEO.
 */
export function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 py-10 sm:px-6">
      <div className="mb-8 h-10 w-64 rounded-lg bg-white/10" />
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 rounded-2xl bg-white/[0.06]" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-72 rounded-2xl bg-white/[0.06]" />
        <div className="h-72 rounded-2xl bg-white/[0.06]" />
      </div>
    </div>
  );
}
