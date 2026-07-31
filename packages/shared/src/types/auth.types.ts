export interface LoginResponse {
  user: {
    id: number;
    username: string;
    positionId: string;
    role: string;
  };
}

