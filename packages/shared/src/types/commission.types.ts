


export interface ScannedAgentParams {
  agentCode: string;
  clientId: string;
}



export interface ScannedAgentResponse {
  agent: {
    id: string;
    agentCode: string;
    accountType: string;
    fullName: string;
    level: string;
    status: string;
    telephone: string;
    SecondaryTel : string;
    profilePicture: string;
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

export type CommissionPayoutChannel =
  | "GCASH"
  | "CHECK";

export interface CreateCommissionPayload {
  clientId: string;
  agentId: string;
  branchId: string;
  scannedBy: number;

  payoutChannel:
    CommissionPayoutChannel;

  checkNumber?: string;
  gcashNumber?: string;
}

export interface ProcessDirectCommissionPayoutPayload {
  payoutRequestId: string;
  agentFullName: string;
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