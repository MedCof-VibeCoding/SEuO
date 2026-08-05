export type ClarityBreakdownItem = {
  label: string;
  sessions: number;
  share: number;
};

export type ClarityIssueItem = {
  key: string;
  label: string;
  count: number;
  affectedSessions: number;
  affectedPercentage: number;
  severity: "critical" | "warning" | "info";
};

export type ClarityClickData = {
  deadClicks: number;
  rageClicks: number;
  errorClicks: number;
  quickbackClicks: number;
  totalProblemClicks: number;
  insights: string[];
};

/** Métricas do Clarity restritas à URL analisada. */
export type ClarityDashboardData = {
  source: "microsoft_clarity";
  numOfDays: 1 | 2 | 3;
  fetchedAt: string;
  targetUrl: string;
  matched: boolean;
  traffic: {
    sessions: number;
    pageViews: number;
    pagesPerSession: number | null;
  };
  clicks: ClarityClickData;
  issues: ClarityIssueItem[];
  breakdowns: {
    devices: ClarityBreakdownItem[];
    browsers: ClarityBreakdownItem[];
    operatingSystems: ClarityBreakdownItem[];
    countries: ClarityBreakdownItem[];
  };
  limitations: string[];
};
