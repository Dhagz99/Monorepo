import SweetAlert from "@/components/modal/Swal";
import { useDeleteUser } from "@/hooks/general/useGeneral";
import { UserSetting } from "@repo/shared";
import axios from "axios";

interface Props {
  Users: UserSetting[];
}

export default function ActiveUsers({
  Users,
}: Props) {
  const deleteUserMutation =
      useDeleteUser();
  
  const handleDelete = (
    user: UserSetting
  ) => {
    SweetAlert.confirmationAlert(
      "Delete User",
      `Are you sure you want to delete ${user.username}?`,
      async () => {
        try {
          await deleteUserMutation.mutateAsync({
            userId:
              user.id,
          });

          await SweetAlert.successAlert(
            "Deleted",
            "User Permanently deleted successfully."
          );

        } catch (
          error: unknown
        ) {
          let message =
            "Unable to delete user.";

          if (
            axios.isAxiosError<{
              message?: string;
            }>(error)
          ) {
            message =
              error.response?.data
                ?.message ??
              message;
          } else if (
            error instanceof Error
          ) {
            message =
              error.message;
          }

          SweetAlert.errorAlert(
            "Delete Failed",
            message
          );
        }
      }
    );
  };
  return (
    <div
      className="
        h-82
        overflow-y-auto
        border
        border-neutralMed
        rounded-xl
      "
    >
      <table className="w-full">
        <thead
          className="
            sticky
            top-0
            bg-white
            z-10
            border-b
            border-neutralMed
          "
        >
          <tr className="text-neutralPrimary">
            <th className="text-left px-custom-24 py-custom-16 font-semibold">
              User
            </th>

            <th className="text-left px-custom-24 py-custom-16 font-semibold">
              Email
            </th>

            <th className="text-left px-custom-24 py-custom-16 font-semibold">
              Action
            </th>

          </tr>
        </thead>

        <tbody>
          {Users.length === 0 ? (
            <tr>
              <td
                colSpan={4}
                className="
                  text-center
                  py-custom-32
                  text-neutralPrimary
                "
              >
                No users found
              </td>
            </tr>
          ) : (
            Users.map((user) => (
              <tr
                key={user.id}
                className="
                  border-b
                  border-neutralLight
                  hover:bg-neutralLight
                  transition-colors
                "
              >
                <td className="px-custom-24 py-custom-16 font-medium">
                  {user.name ?? "-"}
                </td>


                <td className="px-custom-24 py-custom-16">
                  {user.email ?? "-"}
                </td>

                <td className="px-custom-24 py-custom-16">
                    <button
                        type="button"
                        disabled={
                            deleteUserMutation.isPending
                          }
                          onClick={() =>
                            handleDelete(
                              user
                            )
                          }
                        className="
                            bg-neutralPrimary
                            cursor-pointer
                            hover:scale-105
                            ease-in-out
                            duration-150
                            text-white
                            px-custom-24
                            py-custom-8
                            text-xs
                            rounded-lg
                        "
                        >
                        Deactivate User
                    </button>
                </td>

                
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}