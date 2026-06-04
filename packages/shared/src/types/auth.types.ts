export interface LoginResponse {
    user: {
      id: number;
      username: string;
      role: string;
    };
  }

  export interface LoginSchema {
    username: string;
    password: string;
  }



export interface PermissionType {
  id: number;
  code: string
  name: string
}

export interface UserPermission  {
  id: number
  code: string
  name: string
}

export interface UserRole  {
  id: string
  name: string
  permissions: {
    permission: UserPermission
  }[]
}

export interface User  {
  id: number
  username: string
  name: string
  email?: string
  isActive: boolean
  createdAt: string
  company_id?: string
  roles: {
    role: UserRole
  }[]
}


//roles

export interface Permission  {
  id: number
  code: string
  name: string
}

export interface RolePermission  {
  permission: {
    code: string
  }
}

export interface Role  {
  id: number
  name: string
  description?: string | null
  permissions: RolePermission[]
}




  
  