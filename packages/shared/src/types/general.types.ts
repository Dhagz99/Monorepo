



export interface UserSetting {
  id: number;

  name: string | null;

  username: string;

  email: string | null;

  isActive: boolean;
}

export interface GetUsersParams{
  search?: string;
  limit?: number;
  page?: number;
  status?: string;
}

export interface GetUserResponse{
  data: UserSetting[];

  total: number;

  page: number;

  limit: number;

  totalPages: number;

}




export interface CommissionRule {
  id: string;

  accountType: string;

  agentStatus: string;

  formulaType: string;

  sspAmount: number;

  piraRate: number;

  isActive: boolean;

  createdAt: string;

  updatedAt: string;
}

export interface OverrideCommissionRule {
  id: string;

  receiverLevel: string;

  sourceLevel: string;

  amount: number;

  isActive: boolean;

  createdAt: string;

  updatedAt: string;
}

export interface CommissionSettingsResponse {
  // users: UserSetting[];

  commissionRules: CommissionRule[];

  overrideRules: OverrideCommissionRule[];
}

export interface RoleOption {
  id:number;
  name:string;
}

export interface GetRolesApiResponse {
  success: boolean;
  data: RoleOption[];
}

export interface BranchOption {
    id: string;
    branchName: string;
    branchCode:string;
    companyName:string;
}

export interface GetBranchesResponse {
    success: boolean;
    data: BranchOption[];
}

export interface DateRange {
    startDate: string;
    endDate: string;
  };



export type EligibleAgentOption = {
  id: string;
  agentCode: string;
  fullName: string;
  level: string;
  status: string;
};

export type SearchEligibleAgentsResponse = {
  data: EligibleAgentOption[];
};





// General Settings 


export type OverrideRulePayload = {
  receiverLevel: string;
  sourceLevel: string;
  amount: number;
};



