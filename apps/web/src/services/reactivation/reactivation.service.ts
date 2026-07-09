import api from "@/lib/axios";

import {
  GetMyReactivationApprovalsParams,
  GetMyReactivationApprovalsResponse,
  ReactivationApprovalProgressResponse,
  ReactivationCheckResponse,
  ReviewReactivationApprovalPayload,
  ReviewReactivationApprovalResponse,
  SubmitAdminReactivationResponse,
} from "@repo/shared";

export const checkReactivationService =
  async (): Promise<ReactivationCheckResponse> => {
    const res =
      await api.get(
        "/reactivation/check"
      );

    return res.data;
  };

export const selfReactivateService =
  async () => {
    const res =
      await api.post(
        "/reactivation/self"
      );

    return res.data;
  };



export const submitAdminReactivationRequestService =
  async (
    formData: FormData
  ): Promise<SubmitAdminReactivationResponse> => {
    const res = await api.post(
      "/reactivation/admin-reactivation-request",
      formData
    );

    return res.data;
  };


export const getMyReactivationApprovalsService =
  async (
    params: GetMyReactivationApprovalsParams
  ): Promise<GetMyReactivationApprovalsResponse> => {
    const res = await api.get(
      "/reactivation/reactivation-approvals/my",
      {
        params,
      }
    );

    return res.data;
  };

export const reviewReactivationApprovalService =
  async (
    payload: ReviewReactivationApprovalPayload
  ): Promise<ReviewReactivationApprovalResponse> => {
    const res =
      await api.patch(
        "/reactivation/reactivation-approvals/review",
        payload
      );

    return res.data;
  };


export const getMyReactivationApprovalProgress = async (
  requestId: string
) => {
  const response = await api.get<{
    success: boolean;
    message: string;
    data: ReactivationApprovalProgressResponse;
  }>(
    `/reactivation/my-requests/${requestId}/progress`
  );

  return response.data.data;
};