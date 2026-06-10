import api from "@/lib/axios";

import {
  ScannedAgentParams,
  ScannedAgentResponse,
  CreateCommissionPayload,
  UpdateCommissionRules,
} from "@repo/shared";

export const scannedAgentService =
  async (
    params: ScannedAgentParams
  ): Promise<ScannedAgentResponse> => {

    const res =
      await api.get(
        "/commission/scannedAgent",
        {
          params,
        }
      );

    return res.data;
  };

export const createCommissionScanService =
  async (
    payload: CreateCommissionPayload
  ) => {

    const res =
      await api.post(
        "/commission/create",
        payload
      );

    return res.data;
  };


export const updateCommissionRule =
  async (
    data: UpdateCommissionRules
  ) => {

    const response =
      await api.put(
        "/commission/commission-rule",
        data
      );

    return response.data;
  };