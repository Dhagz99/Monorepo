import api from "@/lib/axios";
import {
    AdminWithdrawalRequest,
  CreateWithdrawalRequestPayload,
  CreateWithdrawalRequestResponse,
} from "@repo/shared";

export const createMyWithdrawalRequest = async (
  payload: CreateWithdrawalRequestPayload
) => {
  const response = await api.post<{
    success: boolean;
    message: string;
    data: CreateWithdrawalRequestResponse;
  }>("/withdrawals/my", payload);

  return response.data.data;
};


export const approveWithdrawalRequest = async (
  withdrawalId: string
) => {
  const response = await api.post<{
    success: boolean;
    message: string;
    data: AdminWithdrawalRequest;
  }>(`/withdrawals/admin/${withdrawalId}/approve`);

  return response.data.data;
};

export const rejectWithdrawalRequest = async ({
  withdrawalId,
  remarks,
}: {
  withdrawalId: string;
  remarks: string;
}) => {
  return api.post(
    `/withdrawals/admin/${withdrawalId}/reject`,
    {
      remarks,
    }
  );
};