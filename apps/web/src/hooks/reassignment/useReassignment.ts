import {
  getDroppedAgentsService,
  getDroppedAgentDownlinesService,
  getAvailableReassignmentUplinesService,
  reassignDownlinesService,
} from "@/services/reassignment/reassignment.service";

import {
  GetReassignmentParams,
  ReassignDownlinesPayload,
} from "@repo/shared";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

export const useDroppedAgents = (
  params: GetReassignmentParams
) => {
  return useQuery({
    queryKey: [
      "dropped-agents",
      params.page,
      params.limit,
      params.search,
    ],
    queryFn: () =>
      getDroppedAgentsService(params),
  });
};

export const useDroppedAgentDownlines = (
  droppedAgentId: string | null
) => {
  return useQuery({
    queryKey: [
      "dropped-agent-downlines",
      droppedAgentId,
    ],
    queryFn: () =>
      getDroppedAgentDownlinesService(
        droppedAgentId as string
      ),
    enabled: !!droppedAgentId,
  });
};
export const useAvailableReassignmentUplines = (
  droppedAgentId: string | null,
  downlineAgentIds: string[]
) => {
  return useQuery({
    queryKey: [
      "available-reassignment-uplines",
      droppedAgentId,
      downlineAgentIds,
    ],
    queryFn: () =>
      getAvailableReassignmentUplinesService(
        droppedAgentId as string,
        downlineAgentIds
      ),
    enabled: !!droppedAgentId,
  });
};

export const useReassignDownlines = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      payload: ReassignDownlinesPayload
    ) => reassignDownlinesService(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["dropped-agents"],
      });

      queryClient.invalidateQueries({
        queryKey: ["dropped-agent-downlines"],
      });

      queryClient.invalidateQueries({
        queryKey: ["available-reassignment-uplines"],
      });
    },
  });
};