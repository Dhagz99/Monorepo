import api from "@/lib/axios";
import {
    GetMaintenanceNearExpiryApiResponse,
  GetReportsAnalyticsApiResponse,
  GetTopEarningAgentsApiResponse,
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