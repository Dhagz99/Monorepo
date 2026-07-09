import api from "@/lib/axios";
import {
  AdminReactivationPayment,
  AdminWithdrawalRequest,
  PaginatedResponse,
  PaginationParams,
} from "@repo/shared";

export const getAdminReactivationPayments = async (
  params: PaginationParams
) => {
  const response = await api.get<
    PaginatedResponse<AdminReactivationPayment> & {
      success: boolean;
      message: string;
    }
  >("/transactions/reactivation/payments", {
    params,
  });

  return response.data;
};

export const getAdminWithdrawals = async (
  params: PaginationParams
) => {
  const response = await api.get<
    PaginatedResponse<AdminWithdrawalRequest> & {
      success: boolean;
      message: string;
    }
  >("/transactions/withdrawals", {
    params,
  });

  return response.data;
};