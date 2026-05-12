import { loginService } from "@/services/auth/auth.service";
import { LoginSchema } from "@repo/shared";
import { useMutation } from "@tanstack/react-query";



export const useLogin = () => {
  return useMutation({
    mutationFn: (params: LoginSchema) => loginService(params),
  });
};




