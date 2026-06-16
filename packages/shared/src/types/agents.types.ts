export interface SearchAgentsParams {
  search?: string
  branchCodes?: string[]
}

export interface AgentSearchResult {

  id: string;

  fullName: string;

  level: string;

  status: string;

  agentCode: string;

  saleMaintenance: number;

  l2DownlineCount: number;

  l3DownlineCount: number;

  parentAgent?: {
    id: string;
    fullName: string;
    level: string;
    agentCode: string;
  } | null;
}

export type SearchAgentsResponse =
  AgentSearchResult[];


export interface SearchBranchParams {
  search?: string;
}

/* =========================================
   GLOBAL UPLINE AVAILABILITY
========================================= */
export interface BranchUplineAvailability {
  id: string;

  fullName: string;

  level: "L1" | "L2";

  agentCode: string;

  /* GLOBAL DOWNLINE COUNTS */
  l2Count: number;

  l3Count: number;

  /* GLOBAL SLOT AVAILABILITY */
  availableL2Slots: number;

  availableL3Slots: number;

  hasVacancy: boolean;
}

/* =========================================
   BRANCH CAPACITY
   ONLY L1 IS BRANCH-BASED
========================================= */
export interface BranchCapacity {

  /* BRANCH COUNTS */
  totalL1: number;

  totalL2: number;

  totalL3: number;

  /* ONLY VALID BRANCH SLOT */
  availableL1Slots: number;
}

/* =========================================
   BRANCH RESULT
========================================= */
export interface BranchSearchResult {
  branchCode: string;

  companyName: string | null;

  capacity: BranchCapacity;

  /* GLOBAL MLM UPLINES */
  availableUplines:
    BranchUplineAvailability[];
}

export type SearchBranchResponse =
  BranchSearchResult[];


export interface GetPendingAgentParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface PendingAgentBranch {
  branch: {
    branchCode: string;
    companyName?: string;
  };
}

export interface PendingAgents {
  id:string
  createdAt: string;

  fullName: string;

  level: string;

  status: string;

  branches: PendingAgentBranch[];
}

export interface GetPendingAgentResponse {
  data: PendingAgents[];

  total: number;

  page: number;

  limit: number;

  totalPages: number;
}






export interface GetMasterlistParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface MasterlistBranch {
  branch: {
    branchCode: string;
    companyName?: string;
  };
}

export interface Masterlists {
  id:string
  agentCode: string;

  accountType: string;

  fullName: string;

  level: string;

  status: string;

  branches: MasterlistBranch[];
}

export interface GetMasterlistResponse {
  data: Masterlists[];

  total: number;

  page: number;

  limit: number;

  totalPages: number;
}




export interface GetTransactionParams {
  agentId: string;
  page?: number;
  limit?: number;
}


export interface AgentTransaction {
  id: string;

  saleReference?: string | null;

  saleAmount: string;

  commissionAmount: string;

  percentage?: string | null;

  sourceLevel: string;

  commissionType: string

  remarks?: string | null;

  createdAt: string;

  sourceAgent: {
    id: string;

    fullName: string;

    level: string;

    agentCode: string;
  };

  receiverAgent: {
    id: string;

    fullName: string;

    level: string;

    agentCode: string;
  };
}

export interface GetTransactionResponse {
  data: AgentTransaction[];

  total: number;

  page: number;

  limit: number;

  totalPages: number;
}



export interface TransactionHistParams {
  agentId: string;
  limit?: number;

  month?: number;
  year?: number;
}

export interface TransactionHist {
  id: string;

  saleReference?: string | null;

  saleAmount: string;

  commissionAmount: string;

  percentage?: string | null;

  sourceLevel: string;

  commissionType: string

  remarks?: string | null;

  createdAt: string;

  sourceAgent: {
    id: string;

    fullName: string;

    level: string;

    agentCode: string;
  };

  receiverAgent: {
    id: string;

    fullName: string;

    level: string;

    agentCode: string;
  };
}

export interface GetTransactionHistResponse {
  data: TransactionHist[];

  total: number;

  limit: number;

}





// export interface ScannedAgentParams {
//   agentCode: string;
//   clientId: string;
// }

// export interface ScannedAgentBranch {
//   id: string;

//   branchId: string;

//   branch: {
//     branchCode: string;

//     companyName?: string | null;

//     location?: string | null;
//   };
// }

// export interface ScannedAgentResponse {
//   agent: {
//     id: string;
//     agentCode: string;
//     accountType: string;
//     fullName: string;
//     level: string;
//     status: string;
//     branches: ScannedAgentBranch[];
//   };

//   client: {
//     id: string;
//     clientName: string;
//     loanAmount: number;
//     term: number;
//   };

//   uplines: {
//     id: string;
//     agentCode: string;
//     fullName: string;
//     level: string;
//     status: string;
//   }[];

//   directCommission: {
//     amount: number;

//     rule: {
//       id: string;
//       formulaType: string;
//       piraRate: number;
//       agentStatus: string;
//     };
//   };

//   overrideCommissions: {
//     agent: {
//       id: string;
//       agentCode: string;
//       fullName: string;
//       level: string;
//       status: string;
//     };

//     amount: number;

//     blocked: boolean;

//     reason: string | null;

//     ruleId: string | null;
//   }[];
// }

export interface AgentMaintenanceCycle {

  id: string;

  cycleMonth: number;

  cycleYear: number;

  cycleStartDate: string;

  cycleEndDate: string;

  requiredSales: number;

  completedSales: number;

  remainingSales: number;

  isCompleted: boolean;

  isFirstCycle: boolean;

  completedAt?: string | null;

  expiredAt?: string | null;

  status: string;

  createdAt: string;
}

export interface AgentNotification {

  id: string;

  type: string;

  title: string;

  message: string;

  isRead: boolean;

  createdAt: string;
}



export interface GetAgentDetailsParams {
  agentId: string;
}

export interface AgentDetailsBranch {
  id: string;

  branchId: string;

  branch: {
    branchCode: string;

    companyName?: string | null;

    location?: string | null;
  };
}


export interface AgentDetailsParent {
  id: string;

  fullName: string;

  level: string;

  agentCode: string;
}


export interface AgentDetailsDownline {
  id: string;

  fullName: string;

  level: string;

  status: string;
}


export interface AgentCommission {
  id: string;

  saleAmount: string;

  commissionAmount: string;

  sourceLevel: string;

  createdAt: string;

  sourceAgent: {
    fullName: string;

    level: string;
  };
}

export interface GetAgentDetailsResponse {

  id: string;

  agentCode: string;

  username: string;

  fullName: string;

  gender?: string | null;

  birthDate?: string | null;

  address?: string | null;

  email?: string | null;

  telephone?: string | null;

  creditScore: number;

  status: string;

  accountType: string;

  level: string;

  parentAgent?: AgentDetailsParent | null;

  branches: AgentDetailsBranch[];

  downlines: AgentDetailsDownline[];

  commissionsEarned: AgentCommission[];

  maintenanceCycles: AgentMaintenanceCycle[];

  notifications: AgentNotification[];

  createdAt: string;
}



export interface CheckUniqueInfoParams {
  username?: string;
  email?: string;
  telephone?: string;
}

export interface CheckUniqueInfoResponse {
  usernameExists: boolean;
  emailExists: boolean;
  telephoneExists: boolean;
}

export interface UpdateAgentAccountResponse {
  message: string;
}


export interface DirectCommissionParams {
    treshold:number;
    formulaType:string;
    installmentAmount:number;
    term:number;
    piraRate:number;
}


export interface GetRemainingSalesParams {
  agentId: string;
}

export interface GetRemainingSalesResponse {
  status: string;
  remainingSales: number;
}