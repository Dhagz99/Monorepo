"use client"

import api from "@/lib/axios"
import { createContext, useContext, useEffect, useState } from "react"


type User = {
  id: number
  username: string
  name: string
  roles: string[]
  permissions: string[]
  company_id:string;
}

type AuthContextType = {
  user: User | null
  loading: boolean
  setUser: (user: User | null) => void
  logout: () => Promise<void>
  hasRole: (role: string) => boolean
  refreshUser: () => Promise<void>
  hasPermission: (permission: string) => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get("/auth/me")
      .then(res => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const logout = async () => {
    await api.post("/auth/logout")
    setUser(null)
    window.location.href = "/login"
  }

  const refreshUser = async () => {
    try {
      const res = await api.get("/auth/me")
      setUser(res.data)
    } catch {
      setUser(null)
    }
  }
  

  const hasRole = (role: string) =>
    user?.roles?.includes(role) ?? false

  const hasPermission = (permission: string) =>
    user?.permissions?.includes(permission) ?? false

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        setUser,
        logout,
        hasRole,
        refreshUser,
        hasPermission
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}
