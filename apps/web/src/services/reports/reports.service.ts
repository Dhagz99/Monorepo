import api from "@/lib/axios";
import {
  AgentCommissionDetailsParams,
  AgentCommissionDetailsPrintParams,
  AgentCommissionDetailsResponse,
  AgentCommissionReportParams,
    CommissionDetailType,
    CommissionPrintParams,
    CommissionPrintResponse,
    CommissionReportResponse,
    GetAgentCommissionDetailsApiResponse,
    GetAgentCommissionReportApiResponse,
    GetCommissionPrintApiResponse,
    GetCommissionReportApiResponse,
    GetMaintenanceNearExpiryApiResponse,
  GetReportsAnalyticsApiResponse,
  GetTopEarningAgentsApiResponse,
  PaginatedAgentCommissionReportResponse,
  PaginatedMaintenanceNearExpiryResponse,
  PaginatedTopEarningAgentsResponse,
  ReportsAnalyticsResponse,
} from "@repo/shared";

export const getReportsAnalytics =
  async ({
    month,
  }: {
    month?: string;
  }): Promise<ReportsAnalyticsResponse> => {
    const response =
      await api.get<GetReportsAnalyticsApiResponse>(
        "/reports/analytics",
        {
          params: {
            month,
          },
        }
      );

    return response.data.data;
  };
export const getTopEarningAgents =
  async ({
    page = 1,
    limit = 10,
    month,
  }: {
    page?: number;
    limit?: number;
    month?: string;
  }): Promise<PaginatedTopEarningAgentsResponse> => {
    const response =
      await api.get<GetTopEarningAgentsApiResponse>(
        "/reports/top-agents",
        {
          params: {
            page,
            limit,
            month,
          },
        }
      );

    return response.data.data;
  };
export const getAgentsNearMaintenanceExpiry = async ({
  page = 1,
  limit = 10,
  month,
}: {
  page?: number;
  limit?: number;
  month?: string;
}): Promise<PaginatedMaintenanceNearExpiryResponse> => {
  const response =
    await api.get<GetMaintenanceNearExpiryApiResponse>(
      "/reports/maintenance-near-expiry",
      {
        params: {
          page,
          limit,
          month,
        },
      }
    );

  return response.data.data;
};

export const getCommissionReport = async (
  params: AgentCommissionReportParams
): Promise<CommissionReportResponse> => {
  const response =
    await api.get<GetCommissionReportApiResponse>(
      "/reports/branch-commission",
      {
        params: {
          reportType:
            params.reportType,

          startPeriod:
            params.startPeriod,

          endPeriod:
            params.endPeriod,

          searchName:
            params.searchName?.trim() ||
            undefined,

          page:
            params.page ?? 1,

          limit:
            params.limit ?? 10,
        },
      }
    );

  return response.data.data;
};


export const getAgentCommissionDetails = async ({
  agentId,
  detailType,
  startPeriod,
  endPeriod,
  page = 1,
  limit = 5,
}: AgentCommissionDetailsParams): Promise<AgentCommissionDetailsResponse> => {
  const response =
    await api.get<GetAgentCommissionDetailsApiResponse>(
      `/reports/agent-commission/${agentId}/details`,
      {
        params: {
          detailType,
          startPeriod,
          endPeriod,
          page,
          limit,
        },
      }
    );

  return response.data.data;
};



export const getCommissionPrintReport = async (
  params: CommissionPrintParams
): Promise<CommissionPrintResponse> => {
  const response =
    await api.get<GetCommissionPrintApiResponse>(
      "/reports/commission/print",
      {
        params: {
          reportType: params.reportType,
          startPeriod: params.startPeriod,
          endPeriod: params.endPeriod,
          searchName:
            params.searchName?.trim() ||
            undefined,
        },
      }
    );

  return response.data.data;
};



export const getAgentCommissionDetailsPrint =
  async ({
    agentId,
    detailType,
    startPeriod,
    endPeriod,
  }: {
    agentId: string;
    detailType: CommissionDetailType;
    startPeriod: string;
    endPeriod: string;
  }): Promise<AgentCommissionDetailsResponse> => {
    const response =
      await api.get<GetAgentCommissionDetailsApiResponse>(
        `/reports/agent-commission/${agentId}/details/print`,
        {
          params: {
            detailType,
            startPeriod,
            endPeriod,
          },
        }
      );

    return response.data.data;
  };