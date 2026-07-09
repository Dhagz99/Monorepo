import {
    getAgentsNearMaintenanceExpiry,
  getReportsAnalytics,
  getTopEarningAgents,
} from "@/services/reports/reports.service";
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