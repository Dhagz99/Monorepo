"use client";


import CreateGroupForm from "./CreateGroupForm";
import GroupList from "./GroupList";
import { useBranchGroups, useCreateGroup, useDeleteGroup } from "@/hooks/useBranchGroup";

export default function BranchGroupManager() {
  const { data, isLoading } = useBranchGroups();
  const createGroup = useCreateGroup();
  const deleteGroup = useDeleteGroup();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col gap-4 h-full">

      {/* HEADER */}
      <div className="border-b pb-3">
        <h2 className="text-lg font-semibold text-gray-800">
          Branch Groups
        </h2>
        <p className="text-sm text-gray-500">
          Create and manage branch groupings
        </p>
      </div>

      {/* CREATE */}
      <CreateGroupForm onCreate={(name) => createGroup.mutate(name)} />

      {/* LIST */}
      <GroupList
        groups={data?.groups ?? []}
        onDelete={(id) => deleteGroup.mutate(id)}
      />

    </div>
  );
}