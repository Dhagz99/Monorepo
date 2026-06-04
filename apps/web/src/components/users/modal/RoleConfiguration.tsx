"use client"

import { useGetPermissions, useGetRoles, useUpdateRolePermissions } from "@/hooks/auth/useLogin"
import { Role } from "@repo/shared"
import { useState } from "react"
import { toast } from "sonner"

export default function RoleConfigurationModal() {
  const { data: roles, isLoading } = useGetRoles()
  const { data: permissions } = useGetPermissions()
  const updatePermissions = useUpdateRolePermissions()

  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([])

  function selectRole(role: Role) {
    setSelectedRole(role)

    const ids =
      role.permissions?.map(p =>
        permissions?.find(x => x.code === p.permission.code)?.id
      ).filter(Boolean) as number[]

    setSelectedPermissionIds(ids)
  }

  function togglePermission(id: number) {
    setSelectedPermissionIds(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    )
  }

  function handleSave() {
    if (!selectedRole) return
    updatePermissions.mutate({
      roleId: selectedRole.id,
      permissionIds: selectedPermissionIds
    },{
      onSuccess: () => {
        toast.success("Permissions updated successfully.", {
          position: "top-center",
        });
      }
    }
  )
  }

  if (isLoading) {
    return <p className="text-sm text-gray-500">Loading roles…</p>
  }

  return (
    <div className="grid grid-cols-12 gap-6">

      {/* ROLES LIST */}
      <div className="col-span-4 border rounded-lg p-4 bg-gray-50">
        <h3 className="font-semibold mb-3">Roles</h3>

        <ul className="space-y-2">
          {roles?.map(role => (
            <li
              key={role.id}
              onClick={() => selectRole(role)}
              className={`cursor-pointer rounded px-3 py-2 text-sm
                ${selectedRole?.id === role.id
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-100"
                }`}
            >
              {role.name}
            </li>
          ))}
        </ul>
      </div>

      {/* PERMISSIONS */}
      <div className="col-span-8 border rounded-lg p-4">
        {!selectedRole && (
          <p className="text-sm text-gray-500">
            Select a role to manage permissions
          </p>
        )}

        {selectedRole && permissions && (
          <>
            <h3 className="font-semibold mb-4">
              Permissions — {selectedRole.name}
            </h3>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {permissions.map(permission => (
                <label
                  key={permission.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={selectedPermissionIds.includes(permission.id)}
                    onChange={() => togglePermission(permission.id)}
                  />
                  {permission.name}
                </label>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm
                           hover:bg-blue-700 disabled:opacity-50"
                disabled={updatePermissions.isPending}
              >
                Save Changes
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
