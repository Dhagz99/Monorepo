"use client"

import { useMutation } from "@tanstack/react-query"

import { createUserService } from "@/services/user.service"

export function useCreateUser() {
  return useMutation({
    mutationFn: createUserService
  })
}