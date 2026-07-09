import api from "@/lib/axios";

import {
  GetReassignmentParams,
  GetDroppedAgentsResponse,
  GetDroppedAgentDownlinesResponse,
  GetAvailableReassignmentUplinesResponse,
  ReassignDownlinesPayload,
} from "@repo/shared";

export const getDroppedAgentsService = async (
  params: GetReassignmentParams
): Promise<GetDroppedAgentsResponse> => {
  const res = await api.get(
    "/reassignment/dropped-agents",
    {
      params,
    }
  );

  return res.data;
};

export const getDroppedAgentDownlinesService =
  async (
    droppedAgentId: string
  ): Promise<GetDroppedAgentDownlinesResponse> => {
    const res = await api.get(
      `/reassignment/dropped-agents/${droppedAgentId}/downlines`
    );

    return res.data;
  };

  
export const getAvailableReassignmentUplinesService =
  async (
    droppedAgentId: string,
    downlineAgentIds: string[] = []
  ): Promise<GetAvailableReassignmentUplinesResponse> => {
    const res = await api.get(
      `/reassignment/dropped-agents/${droppedAgentId}/available-uplines`,
      {
        params: {
          downlineAgentIds:
            downlineAgentIds.length > 0
              ? downlineAgentIds.join(",")
              : undefined,
        },
      }
    );

    return res.data;
  };

export const reassignDownlinesService = async (
  payload: ReassignDownlinesPayload
) => {
  const res = await api.post(
    "/reassignment/reassign-downlines",
    payload
  );

  return res.data;
};