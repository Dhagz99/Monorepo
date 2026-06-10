


export interface ScannedAgentParams {
  agentCode: string;
  clientId: string;
}

export interface ScannedAgentBranch {
  id: string;

  branchId: string;

  branch: {
    branchCode: string;

    companyName?: string | null;

    location?: string | null;
  };
}

export interface ScannedAgentResponse {
  agent: {
    id: string;
    agentCode: string;
    accountType: string;
    fullName: string;
    level: string;
    status: string;
    branches: ScannedAgentBranch[];
  };

  client: {
    id: string;
    clientName: string;
    loanAmount: number;
    term: number;
  };

  uplines: {
    id: string;
    agentCode: string;
    fullName: string;
    level: string;
    status: string;
  }[];

  directCommission: {
    amount: number;

    rule: {
      id: string;
      formulaType: string;
      piraRate: number;
      agentStatus: string;
    };
  };

  overrideCommissions: {
    agent: {
      id: string;
      agentCode: string;
      fullName: string;
      level: string;
      status: string;
    };

    amount: number;

    blocked: boolean;

    reason: string | null;

    ruleId: string | null;
  }[];
}

export interface CreateCommissionPayload {
  clientId: string;
  agentId: string;
  branchId: string;
  scannedBy: number;
}

export interface UpdateCommissionRules {
  id: string;
  sspAmount?: number;
  piraRate?: number;
}

export interface UpdateOverrideRules{
  id:string;
  receiverLevel:string;
  sourceLevel:string;
  amount:number;
}