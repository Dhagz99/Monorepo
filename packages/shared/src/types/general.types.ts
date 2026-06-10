



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