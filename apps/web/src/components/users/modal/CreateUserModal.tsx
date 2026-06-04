"use client"



import { useState } from "react"
import { ZodFormattedError } from "zod"

import { createUserSchema, RegisterSchema, updateUserSchema, User } from "@repo/shared"
import { useCreateUser } from "@/hooks/user/useCreateUser"
import { useGetRoles, useUpdateUser } from "@/hooks/auth/useLogin"
import { InputField } from "@/components/FormInputs"

type Props = {
  onClose: () => void
  mode: "create" | "edit"
  initialData?: User | null
}

export default function CreateUserModal({
  onClose,
  mode,
  initialData
}: Props) {
  const isEdit = mode === "edit"

  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const { data: roles } = useGetRoles()


  const [form, setForm] = useState<RegisterSchema>({
    email: initialData?.email ?? "",
    name: initialData?.name ?? "",
    username: initialData?.username ?? "",
    password: "",
    roleIds: initialData
    ? initialData.roles.map(r => r.role.id)
    : []
  })

  const [errors, setErrors] =
    useState<ZodFormattedError<RegisterSchema> | null>(null)

    function handleChange(
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) {
      const { name, value, type, checked } = e.target as HTMLInputElement
    
      setForm(prev => ({
        ...prev,
        [name]:
          type === "checkbox"
            ? checked
            : type === "number"
              ? value === "" ? 0 : Number(value)
              : value === ""
                ? null
                : value
      }))
    }

    function handleSubmit() {
      if (isEdit && initialData) {
        const parsed = updateUserSchema.safeParse({
          ...form,
          ...(form.password ? {} : { password: undefined }),
        });
    
        if (!parsed.success) {
          setErrors(parsed.error.format());
          return;
        }
    
        updateUser.mutate(
          {
            id: initialData.id,
            data: parsed.data,
          },
          {
            onSuccess: onClose,
          }
        );
    
        return;
      }
    
      const parsed = createUserSchema.safeParse(form);
    
      if (!parsed.success) {
        setErrors(parsed.error.format());
        return;
      }
    
      createUser.mutate(parsed.data, {
        onSuccess: onClose,
      });
    }


  return (
    <div className="space-y-5">

      {/* Header */}
      <p className="text-sm text-gray-500">
        {isEdit
          ? "Update user account and roles"
          : "Create a new user account"}
      </p>

      <InputField
        label="Email"
        name="email"
        value={form.email ?? ""}
        error={errors?.email?._errors?.[0]}
        onChange={handleChange}
      />

      <InputField
        label="Full Name"
        name="name"
        value={form.name}
        error={errors?.name?._errors?.[0]}
        onChange={handleChange}
      />

      <InputField
        label="Username"
        name="username"
        value={form.username}
        error={errors?.username?._errors?.[0]}
        onChange={handleChange}
        disabled={isEdit}
      />

      <InputField
        label="Password"
        name="password"
        type="password"
        value={form.password}
        error={errors?.password?._errors?.[0]}
        onChange={handleChange}
        placeholder={
          isEdit ? "Leave blank to keep current password" : ""
        }
      />

            {/* Roles */}
            <div>
        <label className="block text-sm font-medium mb-1">
          Roles
        </label>

        <select
          multiple
          value={form.roleIds.map(String)}
          onChange={e => {
            const selected = Array.from(
              e.target.selectedOptions
            ).map(opt => opt.value);
          
            setForm(prev => ({
              ...prev,
              roleIds: selected,
            }));
          }}
          className="w-full rounded-md border px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {roles?.map(role => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>

        {errors?.roleIds && (
          <p className="text-xs text-red-600">
            {errors.roleIds._errors[0]}
          </p>
        )}
      </div>
       

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm border rounded-md"
        >
          Cancel
        </button>

        <button
          onClick={handleSubmit}
          disabled={createUser.isPending || updateUser.isPending}
          className="px-4 py-2 text-sm font-semibold text-white bg-blue-600
                     rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isEdit ? "Update User" : "Create User"}
        </button>
      </div>
    </div>
  )
}
