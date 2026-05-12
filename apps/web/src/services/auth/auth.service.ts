import api from "@/lib/axios";
import { LoginResponse, LoginSchema } from "@repo/shared";

export const loginService = async (
    params: LoginSchema  ): Promise<LoginResponse> => {
    const res = await api.post("/auth/login", params);
    return res.data;
  };
  