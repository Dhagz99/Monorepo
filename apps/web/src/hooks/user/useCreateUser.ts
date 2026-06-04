"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { createUserService } from "@/services/user.service"

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createUserService,
    onSuccess: ()=> {
      qc.invalidateQueries({queryKey: ["users"]})
    }
    
  })
}