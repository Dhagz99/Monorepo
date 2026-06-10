export interface LoginDTO {
  username: string;
  password: string;
}


export interface LoginResponse {
  token: string;

  user: {
    id: number;

    username: string;

    email?: string | null;

    roles: string[];

    permissions: string[];

    agent?: {
      id: string;

      fullName: string;

      agentCode: string;

      level: string;

      status: string;

      accountType: string;

      email?: string | null;
    } | null;
  };
}

export interface CreateUserInput {
  email?: string
  username: string
  password: string
  roleIds: number[]  
}




