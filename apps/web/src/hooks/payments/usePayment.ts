import { createMyReactivationPayment } from "@/services/payment/payment.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateMyReactivationPayment = () => {
  const queryClient =
    useQueryClient();
  return useMutation({
    mutationFn: createMyReactivationPayment,

    onSuccess: () => {

      queryClient.invalidateQueries({
        queryKey: ["agent-details"],
        
      });

  
    },
  });
};