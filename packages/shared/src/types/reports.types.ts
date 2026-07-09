export interface ReportsAnalyticsSummary {
  totalCommissionGenerated: number;
  totalCompletedWithdrawals: number;
  totalAvailableCredits: number;
  totalCompanyExpenses: number;
  pendingWithdrawalsCount: number;
  agentsNearMaintenanceCount: number;
}

export interface ReportsRecentPayment {
  id: string;
  amount: string | number;
  status: string;
  updatedAt: string;
  agent: {
    fullName: string;
    agentCode: string;
  };
}

export interface ReportsRecentWithdrawal {
  id: string;
  amount: string | number;
  status: string;
  updatedAt: string;
  agent: {
    fullName: string;
    agentCode: string;
  };
}

export interface ReportsTopAgent {
  agent: {
    id: string;
    fullName: string;
    agentCode: string;
    level: string;
  } | null;
  totalCommission: number;
}

export interface ReportsMonthlyExpense {
  type: string;
  total: number;
  count: number;
}

export interface ReportsAgentNearExpiry {
  id: string;
  remainingSales: number;
  cycleEndDate: string;
  status: string;
  agent: {
    fullName: string;
    agentCode: string;
    level: string;
  };
}

export interface ReportPaginationParams {
  page?: number;
  limit?: number;
  month?: string;
};

export interface PaginatedTopEarningAgentsResponse {
  data: ReportsTopAgent[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GetTopEarningAgentsApiResponse {
  success: boolean;
  data: PaginatedTopEarningAgentsResponse;
}


export type ActivityFeedType =
  | "REACTIVATION_PAYMENT"
  | "WITHDRAWAL";

export interface ReportsActivityFeed {
  id: string;
  type: ActivityFeedType;
  title: string;
  description: string;
  amount: string | number;
  status: string;
  createdAt: string;
  agent: {
    id: string;
    fullName: string;
    agentCode: string;
    level?: string;
  };
}

export interface ReportsAnalyticsResponse {
  summary: ReportsAnalyticsSummary;
  recentPayments: ReportsRecentPayment[];
  recentWithdrawals: ReportsRecentWithdrawal[];
  monthlyExpenses: ReportsMonthlyExpense[];
  agentsNearExpiry: ReportsAgentNearExpiry[];
  activityFeeds: ReportsActivityFeed[];
}
export interface GetReportsAnalyticsApiResponse {
  success: boolean;
  data: ReportsAnalyticsResponse;
}




export interface NearExpiryParams {
  page?: number;
  limit?: number;
  month?: string;
};

export interface MaintenanceNearExpiryAgent {
  id: string;
  agentId: string;
  cycleMonth: number;
  cycleYear: number;
  requiredSales: number;
  completedSales: number;
  remainingSales: number;
  cycleEndDate: string;
  status: string;
  agent: {
    id: string;
    fullName: string;
    agentCode: string;
    level: string;
    status: string;
  };
}

export interface PaginatedMaintenanceNearExpiryResponse {
  data: MaintenanceNearExpiryAgent[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GetMaintenanceNearExpiryApiResponse {
  success: boolean;
  data: PaginatedMaintenanceNearExpiryResponse;
}