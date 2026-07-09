import api from "@/lib/axios";
import {
  CreateReactivationPaymentPayload,
  CreateReactivationPaymentResponse,
} from "@repo/shared";

export const createMyReactivationPayment = async (
  payload: CreateReactivationPaymentPayload
) => {
  const response = await api.post<{
    success: boolean;
    message: string;
    data: CreateReactivationPaymentResponse;
  }>("/payment/reactivation/pay", payload);

  return response.data.data;
};