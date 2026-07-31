import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  checkUniqueInfoService,
  DroppedorSuspendedAgentStatusService,
  getAgentDetailsService,
  getAgentEditDetails,
  getAgentTransactionsHistService,
  getAgentTransactionsService,
  getMasterlistService,
  getPendingAgentService,
  getRemainingSalesService,
  readAllNotifService,
  registerAgentService,
  searchAgentsReactivateService,
  searchAgentsService,
  searchBranchesService,
  updateAdminAccountService,
  updateAgentAccountService,
  updateAgentDetails,
  updatePendingAgentStatusService,
} from "@/services/agents/agent.service";

import {
  CheckUniqueInfoParams,
  GetAgentDetailsParams,
  GetMasterlistParams,
  GetPendingAgentParams,
  GetRemainingSalesParams,
  GetTransactionParams,
  RegisterAgentSchema,
  SearchAgentsParams,
  SearchBranchParams,
  TransactionHistParams,
  UpdateAdminAccSchema,
  UpdateAgentAccSchema,
  UpdateAgentDetailsPayload,
} from "@repo/shared";

export const useSearchAgents = (
  params: SearchAgentsParams
) => {

  return useQuery({
    queryKey: [
      "agents-search",
      params,
    ],

    queryFn: () =>
      searchAgentsService(
        params
      ),

    enabled:
      !!params.search,
  });
};
export const useSearchAgentsReactivate = (
  params: SearchAgentsParams
) => {

  return useQuery({
    queryKey: [
      "agents-search-reactivate",
      params,
    ],

    queryFn: () =>
      searchAgentsReactivateService(
        params
      ),

    enabled:
      !!params.search,
  });
};


export const useCheckUniqueInfo =
  () => {

    return useMutation({

      mutationFn: (
        payload: CheckUniqueInfoParams
      ) =>
        checkUniqueInfoService(
          payload
        ),
    });
  };

export const useSearchBranches = (
    params: SearchBranchParams
) => {
    return useQuery({
        queryKey:[
            "branch-search",
            params,
        ],
        queryFn: () =>
            searchBranchesService(
                params
            ),
        enabled:
            !!params.search,
    });
};

export const useRegisterAgent =
  () => {

    return useMutation({
      mutationFn:
        (
          payload: RegisterAgentSchema
        ) =>
          registerAgentService(
            payload
          ),
    });
  };

export const useGetPendingAgents = (
  params: GetPendingAgentParams
) => {
  return useQuery({
    queryKey: ["pendingAgents", params],

    queryFn: () =>
      getPendingAgentService(params),
  });
};

export const useMasterlistAgents = (
  params: GetMasterlistParams
) => {
  return useQuery({
    queryKey: [
      "masterlist",
      params.page,
      params.limit,
      params.search,
      params.status,
    ],
    queryFn: () => getMasterlistService(params),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 30_000,
  });
};

export const useUpdatePendingAgentStatus = () => {

  const queryClient =
    useQueryClient();

  return useMutation({

    mutationFn: ({
      agentId,
      status,
    }: {
      agentId: string;
      status:
        | "ACTIVE"
        | "REJECTED";
    }) =>
      updatePendingAgentStatusService(
        agentId,
        status
      ),

    onSuccess: () => {

      queryClient.invalidateQueries({
        queryKey: ["pendingAgents"],
      });

       queryClient.invalidateQueries({
        queryKey: ["masterlist"],
      });

    },
  });
};


export const useDroppedorSuspendedAgentStatus = () => {

  const queryClient =
    useQueryClient();

  return useMutation({

    mutationFn: ({
      agentId,
      status,
    }: {
      agentId: string;
      status:  "DROPPED" | "SUSPENDED"
    }) =>
      DroppedorSuspendedAgentStatusService(
        agentId,
        status
      ),

    onSuccess: () => {

       queryClient.invalidateQueries({
        queryKey: ["masterlist"],
      });

    },
  });
};




export const useAgentDetails = (
  params: GetAgentDetailsParams
) => {

  return useQuery({

    queryKey: [
      "agent-details",
      params.agentId,
    ],

    queryFn: () =>
      getAgentDetailsService(
        params
      ),

    enabled:
      !!params.agentId,
  });
};

export const useAgentTransactions = (
  params: GetTransactionParams
) => {

  return useQuery({

    queryKey: [
      "agent-transactions",
      params.agentId,
      params.page,
      params.limit,
    ],

    queryFn: () =>
      getAgentTransactionsService(
        params
      ),

    enabled:
      !!params.agentId,
  });
};

export const useAgentTransactionsHist = (
  params: TransactionHistParams
) => {

  return useQuery({

    queryKey: [
      "agent-transactions-hist",
      params.agentId,
      params.limit,
      params.month,
      params.year,
    ],

    queryFn: () =>
      getAgentTransactionsHistService(
        params
      ),

    enabled:
      !!params.agentId,
  });
};


export const useMarkNotificationsRead =
  () => {

    const queryClient =
      useQueryClient();

    return useMutation({
      mutationFn: (
        agentId: string
      ) =>
        readAllNotifService(
          agentId
        ),

      onSuccess: (
        _,
        agentId
      ) => {

        queryClient.invalidateQueries({
          queryKey: [
            "agent-details",
            agentId,
          ],
        });

      },
    });
  };


export const useUpdateAgentAccount =
  () => {

    const queryClient =
      useQueryClient();

    return useMutation({

      mutationFn: (
        payload:
        UpdateAgentAccSchema
      ) =>
        updateAgentAccountService(
          payload
        ),

      onSuccess: () => {

        queryClient.invalidateQueries({
          queryKey: [
            "agent-details"
          ],
        });

      },
    });
  };

export const useUpdateAdminAccount =
  () => {

    const queryClient =
      useQueryClient();

    return useMutation({

      mutationFn: (
        payload:
        UpdateAdminAccSchema
      ) =>
        updateAdminAccountService(
          payload
        ),

      onSuccess: () => {

        queryClient.invalidateQueries({
          queryKey: [
            "agent-details"
          ],
        });

      },
    });
  };


export const useRemainingSales = (
  params: GetRemainingSalesParams
) => {

  return useQuery({

    queryKey: [
      "remaining-sales",
      params.agentId,
    ],

    queryFn: () =>
      getRemainingSalesService(
        params
      ),

    enabled:
      !!params.agentId,
  });
};



// Edit Agent 

export function useAgentEditDetails(
  agentId: string | null
) {
  return useQuery({
    queryKey: [
      "agent-edit-details",
      agentId,
    ],

    queryFn: () => {
      if (!agentId) {
        throw new Error(
          "Agent ID is required."
        );
      }

      return getAgentEditDetails(
        agentId
      );
    },

    enabled:
      Boolean(agentId),
  });
}

export function useUpdateAgentDetails() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      params: {
        agentId: string;
        payload: UpdateAgentDetailsPayload;
      }
    ) =>
      updateAgentDetails(
        params
      ),

    onSuccess: (
      response,
      variables
    ) => {
      queryClient.setQueryData(
        [
          "agent-edit-details",
          variables.agentId,
        ],
        response.data
      );

      queryClient.invalidateQueries({
        queryKey: [
          "masterlist",
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "agent-profile",
          variables.agentId,
        ],
      });
    },
  });
}

