export interface LoginResponse {
  token: string;

  user: {
    id: number;

    username: string;

    branch?: {
      branchCode: string
      companyName?: string | null
      location?: string | null
    } | null;

    roles: string[];

    email?: string | null;

    permissions: string[];

    agent?: {
      id: string;

      fullName: string;

      agentCode: string;

      level: string;

      status: string;

      accountType: string;

      email?: string | null;

      telephone?: string | null;
    } | null;
  };
}