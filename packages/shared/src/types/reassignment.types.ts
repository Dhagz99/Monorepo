export interface GetReassignmentParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface DroppedAgentItem {
  id: string;
  agentCode: string;
  fullName: string;
  level: string;
  status: string;
  updatedAt: Date;

  downlinesCount: number;
}

export interface GetDroppedAgentsResponse {
  data: DroppedAgentItem[];

  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}


export interface GetDroppedAgentDownlinesParams {
  droppedAgentId: string;
}

export interface DroppedAgentDownline {
  id: string;
  agentCode: string;
  fullName: string;
  level: string;
  status: string;
}

export interface GetDroppedAgentDownlinesResponse {
  droppedAgent: {
    id: string;
    agentCode: string;
    fullName: string;
  };

  downlines: DroppedAgentDownline[];
}

export interface AvailableReassignmentUpline {
  id: string;
  agentCode: string;
  fullName: string;
  level: string;
  status: string;
}

export interface GetAvailableReassignmentUplinesResponse {
  data: AvailableReassignmentUpline[];
}

export interface ReassignDownlinesPayload {
  droppedAgentId: string;
  newUplineId: string;
  downlineAgentIds: string[];
  reason?: string;
}

export interface ReassignDownlinesResponse {
  success: boolean;
  reassignedCount: number;
}

export interface GetAvailableReassignmentUplinesParams {
  droppedAgentId: string;
  downlineAgentIds?: string[];
}

export interface AvailableReassignmentUpline {
  id: string;
  agentCode: string;
  fullName: string;
  level: string;
  status: string;
}

export interface GetAvailableReassignmentUplinesResponse {
  data: AvailableReassignmentUpline[];
}