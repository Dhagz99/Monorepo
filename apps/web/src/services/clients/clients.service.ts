import api from "@/lib/axios";

import {
  CommissionDetailsResponse,
  GetClientsParams,
  GetClientsResponse,
} from "@repo/shared";

export const getClientsService =
  async (
    params: GetClientsParams
  ): Promise<GetClientsResponse> => {
    const res = await api.post(
      "/clients/getClients",
      {},
      {
        params,
      }
    );

    return res.data;
  };

export const getCommissionDetailsService =
  async (
    clientId: string
  ): Promise<CommissionDetailsResponse> => {

    const res = await api.get(
      `/clients/commission/details/${clientId}`
    );

    return res.data;
  };