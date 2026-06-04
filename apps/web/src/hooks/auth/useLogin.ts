import { useAuth } from "@/components/context/UserContext";
import { getPermissionServices, getRoleServices, getUsersService, loginService, updateRolePermissionsService, updateUserService } from "@/services/auth/auth.service";
import { createUserService } from "@/services/user.service";
import { LoginSchema, Permission, RegisterSchema, Role, UpdateUserSchema, User } from "@repo/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";



export const useLogin = () => {
  return useMutation({
    mutationFn: (params: LoginSchema) => loginService(params),
  });
};





export const useGetRoles = () => {
  return useQuery<Role[]>({
    queryKey: ["roles"],
    queryFn: getRoleServices,
    staleTime: 1000 * 60 * 5
  })
}

export const useGetPermissions = () => {
  return useQuery<Permission[]>({
    queryKey: ["user-permissions"],
    queryFn: getPermissionServices,
    staleTime: 1000 * 60 * 5
  })
}


export function useGetUsers() {
  return useQuery<User[]>({
    queryKey: ["users"],
    queryFn: getUsersService,
    staleTime: 1000 * 60 * 5 // 5 minutes
  })
}


export const useCreateUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: RegisterSchema) =>
        createUserService(payload),
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["users"]
          })
        }
  })
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserSchema}) =>
      updateUserService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    }
  })
}



export const useUpdateRolePermissions = () => {
  const qc = useQueryClient()
  const { refreshUser } = useAuth()
  return useMutation({
    mutationFn: ({
      roleId,
      permissionIds
    }: {
      roleId: number
      permissionIds: number[]
    }) =>
      updateRolePermissionsService(roleId, permissionIds),
    onSuccess: async () => {
      qc.invalidateQueries({ queryKey: ["roles"] })
      await refreshUser()
    }
  })
}






