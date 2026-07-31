export type ReactivationPhase =
  | "NOT_EXPIRED"
  | "NO_EXPIRED_CYCLE"
  | "REACTIVATION_VIA_ADMIN"
  | "NO_SLOT_AVAILABLE"
  | "SELF_REACTIVATION"
  | "PROBATION_PERIOD"
  | "COOLDOWN_PERIOD"
  | "PENDING_REQUEST";

export interface ReactivationCheckResponse {
  eligible: boolean;
  agentStatus: string;
  expiredAt?: string | Date;
  daysExpired?: number;
  remainingProbation?: number;
  daysProbation?: number;
  remainingDays?: number;
  cooldownDays?: number;
  phase?: ReactivationPhase;
  message: string;
}



export interface ReactivationApprovalProgressItem {
  id: string;
  reviewerType: "ADMIN" | "UPLINE_AGENT";
  status: "PENDING" | "APPROVED" | "REJECTED";
  approvalOrder: number;
  isRequired: boolean;
  assignedAt: string;
  reviewedAt?: string | null;
  remarks?: string | null;

  reviewerUser?: {
    id: number;
    name: string;
  } | null;

  reviewerAgent?: {
    id: string;
    fullName: string;
    agentCode: string;
    level: string;
  } | null;
}

export interface ReactivationApprovalProgressResponse {
  requestId: string;
  requestStatus: string;
  requestedAt: string;
  approvedAt?: string | null;
  failedAt?: string | null;
  remarks?: string | null;

  agent: {
    id: string;
    fullName: string;
    agentCode: string;
    level: string;
  };

  approvals: ReactivationApprovalProgressItem[];
}

export interface ReactivationRequestAgentDetails {
   id: string;
   agentCode: string;
   fullName: string;
   status: string; 
}

export interface ReactivationApprovalReviewer {
  id: number;
  name: string;
  username: string;
}

export interface ReactivationRequestApprovalDetails {
  id: string;
  status: string;
  remarks: string | null;
  reviewedAt: string | null;
  reviewer: ReactivationApprovalReviewer | null;
}

export interface ReactivationRequestDetailsResponse {
  requestId: string;

  agent: ReactivationRequestAgentDetails;

  requiredSales: number;

  probationStartDate: string | null;
  probationEndDate: string | null;

  approval: ReactivationRequestApprovalDetails | null;
}

export interface GetReactivationRequestDetailsApiResponse {
  success: boolean;
  message?: string;
  data: ReactivationRequestDetailsResponse;
}