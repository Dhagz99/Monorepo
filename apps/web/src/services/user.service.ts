import { api } from "@/lib/axios"

import type {
  RegisterSchema
} from "@repo/shared"

export async function createUserService(
  payload: RegisterSchema
) {
  const response = await api.post(
    "/auth/signup",
    payload
  )

  return response.data
}