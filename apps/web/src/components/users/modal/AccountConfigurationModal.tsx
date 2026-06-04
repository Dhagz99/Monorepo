"use client"

import { useState } from "react"
import { Plus, Settings, Shield, UserCog } from "lucide-react"
import CreateUserModal from "./CreateUserModal"
import RequestModal from "../../Modal"
import RoleConfigurationModal from "./RoleConfiguration"
import { useGetUsers } from "@/hooks/auth/useLogin"
import { User } from "@repo/shared"

type Props = {
    onClose?: () => void
  }
export default function AccountConfigurationModal({ onClose}: Props) {
  const [openCreate, setOpenCreate] = useState(false)
  const { data: users, isLoading } = useGetUsers()
  const [openRoleModal, setOpenRoleModal] = useState(false)
  const [mode, setMode] = useState<"create" | "edit">("create")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const handleEdit = (users: User)=> {
    setSelectedUser(users)
    setMode("edit")
    setOpenCreate(true)
  }



  return (
    <div className="flex flex-col gap-6">
 
      {/* Header */}
      <div className="flex items-center justify-between">
        
        <div>

        <h2 className="text-lg font-semibold text-gray-800">
                      User Management
                    </h2>
          <p className="text-sm text-gray-500">
            Manage system users, roles, and permissions
          </p>
        </div>
<div className="flex gap-2">
      <button
          onClick={() => setOpenCreate(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md
                     bg-blue-600 text-white text-sm font-medium
                     hover:bg-blue-700"
        >
          <Plus size={16} />
          Register User
        </button> 
      <button  
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md
                bg-gray-600 text-white text-sm font-medium
                hover:bg-gray-700"
          onClick={()=>setOpenRoleModal(true)}
          >
            <Settings size={16} />
            Configure Roles
      </button>
     
</div>
   
      </div>

      {/* Table */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        
      <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr className="text-left text-gray-600">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Username</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Roles</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                  Loading users…
                </td>
              </tr>
            )}

            {users?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            )}

            {users?.map(user => (
              <tr key={user.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">
                  {user.name}
                </td>
                <td className="px-4 py-3 font-medium text-gray-800">
                  {user.username}
                </td>

                <td className="px-4 py-3 text-gray-600">
                  {user.email ?? "—"}
                </td>

                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {user.roles.map(role => (
                      <span
                        key={role.role.id}
                        className="inline-flex items-center gap-1
                                   px-2 py-1 rounded-full text-xs
                                   bg-indigo-50 text-indigo-700"
                      >
                        <Shield size={12} />
                        {role.role.name}
                      </span>
                    ))}
                  </div>
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium
                      ${user.isActive
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"}
                    `}
                  >
                    {user.isActive ? "Active" : "Disabled"}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-gray-800">
                  {user.company_id}
                </td>

                <td className="px-4 py-3 text-right">
                  <button
                    className="inline-flex items-center gap-1
                               px-3 py-1.5 rounded-md text-xs
                               border border-gray-300
                               hover:bg-gray-100"
                    onClick={()=>handleEdit(user)}
                    
                  >
                    <UserCog size={14} />
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
         </div>
       
      </div>

      {openRoleModal && (
        <RequestModal 
          size="xl" 
          title="User Roles Configuration"
          onClose={()=>setOpenRoleModal(false)}>
            <RoleConfigurationModal />

        </RequestModal>
      )}


      {/* Create User Modal */}
      {openCreate && (
        <RequestModal
          title="Register New User"
          size="md"
          onClose={() => {
            setOpenCreate(false)
            setSelectedUser(null)
           }
          }
        >
          <CreateUserModal onClose={() => setOpenCreate(false)} initialData={selectedUser ?? undefined} mode={mode} />
        </RequestModal>
      )}


   



    </div>
  )
}
