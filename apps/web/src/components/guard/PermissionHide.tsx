"use client";

import { ReactNode } from "react";
import { useAuth } from "@/components/context/UserContext";

interface Props {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export default function Can({
  permission,
  children,
  fallback = null,
}: Props) {
  const { user, loading } = useAuth();

  if (loading) return null;

  const allowed =
    user?.permissions?.includes(permission) ?? false;

  return allowed ? <>{children}</> : <>{fallback}</>;
}