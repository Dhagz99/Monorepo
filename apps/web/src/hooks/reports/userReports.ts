import {
  getAgentCommissionDetails,
  getAgentsNearMaintenanceExpiry,
  getCommissionReport,
  getReportsAnalytics,
  getTopEarningAgents,
} from "@/services/reports/reports.service";
import { AgentCommissionReportParams, CommissionDetailType } from "@repo/shared";
import { useQuery } from "@tanstack/react-query";

export const useReportsAnalytics = ({
  month,
}: {
  month?: string;
}) => {
  return useQuery({
    queryKey: ["reports-analytics", month],
    queryFn: () => getReportsAnalytics({ month }),
  });
};
export const useTopEarningAgents = ({
  page = 1,
  limit = 10,
  month,
}: {
  page?: number;
  limit?: number;
  month?: string;
}) => {
  return useQuery({
    queryKey: ["top-earning-agents", page, limit, month],
    queryFn: () =>
      getTopEarningAgents({
        page,
        limit,
        month,
      }),
  });
};

export const useAgentsNearMaintenanceExpiry = ({
  page = 1,
  limit = 10,
  month,
}: {
  page?: number;
  limit?: number;
  month?: string;
}) => {
  return useQuery({
    queryKey: [
      "agents-near-maintenance-expiry",
      page,
      limit,
      month,
    ],
    queryFn: () =>
      getAgentsNearMaintenanceExpiry({
        page,
        limit,
        month,
      }),
  });
};


export const useCommissionReport = (
  params: AgentCommissionReportParams
) => {
  return useQuery({
    queryKey: [
      "commission-report",
      params.reportType,
      params.startPeriod,
      params.endPeriod,
      params.searchName,
      params.page,
      params.limit,
    ],

    queryFn: () =>
      getCommissionReport(params),

    enabled: Boolean(
      params.reportType &&
        params.startPeriod &&
        params.endPeriod &&
        params.startPeriod <=
          params.endPeriod
    ),

    placeholderData: (previousData) =>
      previousData,

    staleTime: 60_000,
  });
};

export const useAgentCommissionDetails = ({
  agentId,
  detailType,
  startPeriod,
  endPeriod,
  page = 1,
  limit = 5,
  enabled,
}: {
  agentId: string | null;
  detailType: CommissionDetailType | null;
  startPeriod: string;
  endPeriod: string;
  page?: number;
  limit?: number;
  enabled: boolean;
}) => {
  return useQuery({
    queryKey: [
      "agent-commission-details",
      agentId,
      detailType,
      startPeriod,
      endPeriod,
      page,
      limit,
    ],

    queryFn: () => {
      if (!agentId || !detailType) {
        throw new Error(
          "Agent ID and detail type are required."
        );
      }

      return getAgentCommissionDetails({
        agentId,
        detailType,
        startPeriod,
        endPeriod,
        page,
        limit,
      });
    },

    enabled:
      enabled &&
      Boolean(
        agentId &&
          detailType &&
          startPeriod &&
          endPeriod
      ),

    placeholderData: (previousData) =>
      previousData,

    staleTime: 60_000,
  });
};