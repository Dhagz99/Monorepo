"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { BranchesType } from "@repo/shared"

type Props = {
  branch: BranchesType & {
    group?: {
      name: string
    } | null
  }
  onDoubleClick: () => void
}

export default function BranchRow({ branch, onDoubleClick }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: branch.branchCode })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onDoubleClick={onDoubleClick}
      {...attributes}
      {...listeners}
      className="flex items-center justify-between px-3 py-2 border mb-2 border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-all"
    >
      {/* LEFT SIDE */}
      <div className="flex items-center gap-3">
        <span className="text-gray-400 cursor-grab">☰</span>
        <span className="font-medium text-gray-800">
          {branch.branchCode}
        </span>
      </div>

      {/* RIGHT SIDE (GROUP BADGE) */}
      <div>
        {branch.group?.name ? (
          <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
            {branch.group.name}
          </span>
        ) : (
          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500">
            Ungrouped
          </span>
        )}
      </div>
    </div>
  )
}