import api from "@/lib/axios";

import {
  ReactivationCheckResponse,
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