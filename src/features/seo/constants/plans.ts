export type UserPlan = "free" | "pro";

export const PLAN_LIMITS = {
  free: {
    analysesPerDay: 3,
    fullInsights: false,
    exportPdf: false,
    fullHistory: false,
    advancedAi: false,
  },
  pro: {
    analysesPerDay: Infinity,
    fullInsights: true,
    exportPdf: true,
    fullHistory: true,
    advancedAi: true,
  },
} as const;

export const PENDING_ANALYSIS_KEY = "seo-pending-analysis";
