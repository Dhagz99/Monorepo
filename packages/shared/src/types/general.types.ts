export interface EmployeeSummary {
    PayCode: string;
    TotalHoursWorked?: string | null;
    LateCount?: string | null;
    TotalAbsentHours?: string | null;
    TotalUndertime?: string | null;
    TotalOvertime?: string | null;
    RegularAtt?: unknown | null;
    OvertimeAtt?: unknown | null;
    NightShiftAtt?: unknown | null;
    NightShiftOtAtt?: unknown | null;
    EmpCodeId?: string;
  }
  
  export interface EmployeeSummaryPaginatedResponse {
    data: EmployeeSummary[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
  

  export interface ApiErrorResponse {
    status?: "DUPLICATE" | "ERROR";
    message: string;
  }
  export interface ArchiveSuccessResponse {
    status: "SUCCESS";
    message: string;
  }

export interface ErrorResponse {
    message: string;
  }

  
  export interface CompanyDetailsType {
    CompanyCode: string;
    CompanyCycle: string;
    CompanyName: string;
  }
  

 export type AuthUser = {
    id: number;
    username: string;
    role: string;
  };
  


  export type PayrollDateRange = {
    start_date: string;
    end_date: string;
  };


  export interface Company {
    CompanyCode: string;
    CompanyName: string | null;
    CompanyCycle: string | null;
  }
  
  export interface CompaniesResponse {
    success: boolean;
    data: Company[];
  }
  



  
export type FecthCompany = {
  CompanyCode: string;
  CompanyName: string;
};

export type LoanTypeResponse = string[];


export type BranchesType = {
  branchCode: string;
  Location: string;
  company_id: string;
  position: number;
  Company?: string
  groupId?: number 

  group:  BranchGroup
}

export type ReorderBranchesPayload = {
  company_id: string
  branchCodes: string[]
}


export type ApiResponse<T> = {
  success: boolean
  message?: string
  data: T
}

export type BranchGroup = {
  id: number;
  name: string;
  code: string;
  description: string;
  position: number;
};

export type BranchGroupType = {
  groups: BranchGroup[]
  ungrouped: BranchesType[]
}

