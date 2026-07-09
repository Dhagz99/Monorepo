import {
  usePermissionManagement,
  useUpdateRolePermissions,
} from "@/hooks/permissions/usePermissions";
import { ShieldCheck } from "lucide-react";
import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

type PermissionState = Record<number, number[]>;

export default function PermissionsTab() {
  const { data, isLoading } = usePermissionManagement();
  const { mutateAsync, isPending } =
    useUpdateRolePermissions();

  const [permissionState, setPermissionState] =
    useState<PermissionState>({});

  useEffect(() => {
    if (!data) return;

    const initialState: PermissionState = {};

    data.roles.forEach((role) => {
      initialState[role.id] = role.permissions.map(
        (permission) => permission.id
      );
    });

    setPermissionState(initialState);
  }, [data]);

  const groupedPermissions = useMemo(() => {
    if (!data?.permissions) return {};

    return data.permissions.reduce<
      Record<string, typeof data.permissions>
    >((groups, permission) => {
      const groupName =
        permission.code.includes("AGENT")
          ? "Agent Management"
          : permission.code.includes("REACTIVATION")
          ? "Reactivation Management"
          : permission.code.includes("WITHDRAWAL") ||
            permission.code.includes("TRANSACTION")
          ? "Transaction Management"
          : permission.code.includes("REPORT")
          ? "Reports & Analytics"
          : permission.code.includes("BRANCH")
          ? "Branch Management"
          : permission.code.includes("USER") ||
            permission.code.includes("ADMIN")
          ? "User & Admin Management"
          : permission.code.includes("PROFILE")
          ? "Profile Access"
          : "System Access";

      if (!groups[groupName]) {
        groups[groupName] = [];
      }

      groups[groupName].push(permission);

      return groups;
    }, {});
  }, [data]);

  const isChecked = (
    roleId: number,
    permissionId: number
  ) => {
    return (
      permissionState[roleId]?.includes(permissionId) ??
      false
    );
  };

  const handleTogglePermission = (
    roleId: number,
    permissionId: number
  ) => {
    setPermissionState((prev) => {
      const current = prev[roleId] ?? [];

      return {
        ...prev,
        [roleId]: current.includes(permissionId)
          ? current.filter((id) => id !== permissionId)
          : [...current, permissionId],
      };
    });
  };

  const handleSaveRole = async (roleId: number) => {
    await mutateAsync({
      roleId,
      permissionIds: permissionState[roleId] ?? [],
    });
  };

  const handleSaveAll = async () => {
    if (!data?.roles) return;

    await Promise.all(
      data.roles.map((role) =>
        mutateAsync({
          roleId: role.id,
          permissionIds: permissionState[role.id] ?? [],
        })
      )
    );
  };

  if (isLoading) {
    return (
      <div className="p-custom-16 text-neutralPrimary">
        Loading permissions...
      </div>
    );
  }

  return (
    <div className="border border-neutralMed rounded-xl overflow-hidden bg-white">
      <div className="grid grid-cols-[1fr_2fr] border-b border-neutralMed">
        <div className="p-custom-16 text-center text-sm font-semibold text-neutralPrimary border-r border-neutralMed">
          All Roles{" "}
          <span className="ml-1 text-xs bg-neutralLight px-2 py-1 rounded-md">
            {data?.roles.length ?? 0}
          </span>
        </div>

        <div className="p-custom-16 text-center text-sm font-semibold text-mainPrimary">
          User Role Manager
        </div>
      </div>

      <div className="max-h-100 overflow-auto">
        <table className="w-full min-w-200 table-fixed border-collapse">
          <thead className="sticky top-0 z-20 bg-white">
            <tr className="border-b border-neutralMed">
              <th className="w-72 text-left px-custom-16 py-custom-16 text-sm font-semibold text-neutralPrimary bg-white">
                Actions
              </th>

              {data?.roles.map((role) => (
                <th
                  key={role.id}
                  className="px-custom-16 py-custom-16 text-center text-sm font-semibold text-mainPrimary bg-white"
                >
                  {role.name}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {Object.entries(groupedPermissions).map(
              ([groupName, permissions]) => (
                <React.Fragment key={groupName}>
                  <tr className="bg-neutralLight border-y border-neutralMed">
                    <td
                      colSpan={(data?.roles.length ?? 0) + 1}
                      className="px-custom-16 py-custom-16"
                    >
                      <div className="flex items-center gap-custom-8 text-sm font-bold text-mainPrimary">
                        <ShieldCheck size={16} />
                        {groupName}
                      </div>
                    </td>
                  </tr>

                  {permissions.map((permission) => (
                    <tr
                      key={permission.id}
                      className="border-b border-neutralMed hover:bg-neutralLight/60"
                    >
                      <td className="w-72 px-custom-16 py-custom-16">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-mainPrimary">
                            {permission.name}
                          </span>

                          <span className="text-xs text-neutralPrimary">
                            {permission.code}
                          </span>
                        </div>
                      </td>

                      {data?.roles.map((role) => (
                        <td
                          key={`${role.id}-${permission.id}`}
                          className="px-custom-16 py-custom-16 text-center"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked(
                              role.id,
                              permission.id
                            )}
                            onChange={() =>
                              handleTogglePermission(
                                role.id,
                                permission.id
                              )
                            }
                            className="w-4 h-4 accent-mainPrimary cursor-pointer"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </React.Fragment>
              )
            )}
          </tbody>

          <tfoot className="sticky bottom-0 z-20 bg-white">
            <tr className="border-t border-neutralMed bg-white">
              <td className="w-72 px-custom-16 py-custom-16 text-sm font-semibold text-neutralPrimary bg-white">
                Save Changes
              </td>

              {data?.roles.map((role) => (
                <td
                  key={`save-${role.id}`}
                  className="px-custom-16 py-custom-16 text-center bg-white"
                >
                  <button
                    disabled={isPending}
                    onClick={() => handleSaveRole(role.id)}
                    className="
                      px-custom-16
                      py-custom-8
                      rounded-lg
                      bg-lightPrimary
                      text-white
                      text-xs
                      font-semibold
                      hover:bg-mainPrimary
                      disabled:opacity-50
                      disabled:cursor-not-allowed
                      cursor-pointer
                    "
                  >
                    Save
                  </button>
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="p-custom-16 border-t border-neutralMed flex justify-end">
        <button
          disabled={isPending}
          onClick={handleSaveAll}
          className="
            px-custom-24
            py-custom-8
            rounded-xl
            bg-positive
            text-white
            font-semibold
            disabled:opacity-50
            disabled:cursor-not-allowed
          "
        >
          {isPending ? "Saving..." : "Save All Changes"}
        </button>
      </div>
    </div>
  );
}