"use client";

import { useAssignBranchGroup, useBranchGroups } from "@/hooks/useBranchGroup";
import { BranchesType } from "@repo/shared";
import { useState, useEffect } from "react";

type Props = {
  selectedBranch: BranchesType | null;
  onClose: () => void;
};

export default function AssignBranchModal({ selectedBranch, onClose }: Props) {
  const { data } = useBranchGroups(); // to get groups
  const assignGroup = useAssignBranchGroup();

  const [groupId, setGroupId] = useState<number | "">("");

  useEffect(() => {
    if (selectedBranch) {
      setGroupId(selectedBranch.groupId ?? "");
    }
  }, [selectedBranch]);

  if (!selectedBranch) return null;

  const handleSubmit = () => {
    assignGroup.mutate(
      {
        branchCode: selectedBranch.branchCode,
        groupId: groupId === "" ? null : Number(groupId),
      },
      {
        onSuccess: () => {
          onClose(); // close modal after success
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-4">

      {/* HEADER */}
      <div>
        <p className="text-sm text-gray-500">
          Assign a group to this branch
        </p>
      </div>

      {/* BRANCH INFO */}
      <div className="border rounded-md p-3 bg-gray-50 text-sm">
        <span className="text-gray-500">Branch:</span>{" "}
        <span className="font-medium text-gray-800">
          {selectedBranch.branchCode}
        </span>
      </div>

      {/* SELECT GROUP */}
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-600">Select Group</label>

        <select
          value={groupId}
          onChange={(e) =>
            setGroupId(e.target.value === "" ? "" : Number(e.target.value))
          }
          className="border px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Ungrouped</option>

          {data?.groups?.map((g: any) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      {/* ACTIONS */}
      <div className="flex justify-end gap-2 mt-2">

        <button
          onClick={onClose}
          className="px-4 py-2 text-sm bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Cancel
        </button>

        <button
          onClick={handleSubmit}
          disabled={assignGroup.isPending}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {assignGroup.isPending ? "Saving..." : "Save"}
        </button>

      </div>

    </div>
  );
}