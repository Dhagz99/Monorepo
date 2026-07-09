
import { getAdminReactivationPayments, getAdminWithdrawals } from "@/services/transaction/transaction.service";
import { PaginationParams } from "@repo/shared";
import { useQuery } from "@tanstack/react-query";

export const useAdminReactivationPayments = (
  params: PaginationParams,
  enabled = true
) => {
  return useQuery({
    queryKey: ["admin-reactivation-payments", params],
    queryFn: () => getAdminReactivationPayments(params),
    enabled,
  });
};

export const useAdminWithdrawals = (
  params: PaginationParams,
  enabled = true
) => {
  return useQuery({
    queryKey: ["admin-withdrawals", params],
    queryFn: () => getAdminWithdrawals(params),
    enabled,
  });
};