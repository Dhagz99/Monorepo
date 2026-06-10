import { UserSetting } from "@repo/shared";

interface Props {
  Users: UserSetting[];
}

export default function ActiveUsers({
  Users,
}: Props) {
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
              Username
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
                  {user.username ?? "-"}
                </td>

                
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}