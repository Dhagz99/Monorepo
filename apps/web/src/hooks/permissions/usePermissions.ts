
import SweetAlert from "@/components/modal/Swal";
import { getPermissionManagement, updateRolePermissions } from "@/services/permissions/permissions.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const usePermissionManagement = () => {
  return useQuery({
    queryKey: ["permission-management"],
    queryFn: getPermissionManagement,
  });
};

export const useUpdateRolePermissions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateRolePermissions,

    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: ["permission-management"],
      });

      await SweetAlert.successAlert(
        "Permissions Updated",
        "Role permissions have been updated successfully."
      );
    },

    onError: async () => {
      await SweetAlert.errorAlert(
        "Update Failed",
        "Failed to update role permissions."
      );
    },
  });
};