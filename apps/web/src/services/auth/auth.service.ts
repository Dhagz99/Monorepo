import api from "@/lib/axios";
import {LoginResponse, LoginSchema, RegisterSchema, UpdateUserSchema } from "@repo/shared";

export const loginService = async (
    params: LoginSchema  ): Promise<LoginResponse> => {
    const res = await api.post("/auth/login", params);
    return res.data;
  };

  
export async function getRoleServices(){
  const res = await api.get("/auth/roles")
  return res.data
}

export async function getPermissionServices(){
  const res = await api.get("/auth/permissions")
  return res.data
}


export async function createUserService(params: RegisterSchema) {
    return api.post("/auth/signup/", params)
}

export const updateUserService = async (
  id: number,
  payload: UpdateUserSchema
) => {
  const res = await api.put(`/auth/users/${id}`, payload)
  return res.data
}


export async function getUsersService() {
  const res = await api.get("/auth/users")
  return res.data
}

export async function updateRolePermissionsService(roleId: number, permissionIds: number[]) {
    return api.put(`/auth/roles/${roleId}/permissions`, { permissionIds })
}
  