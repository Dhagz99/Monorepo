"use client"

import { useState, useEffect, useRef } from "react"


import { DndContext, closestCenter } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable"
import BranchRow from "./BranchRow"
import RequestModal from "../Modal"
import { BranchesType } from "@repo/shared"
import { useGetBranches, useReorderBranches } from "@/hooks/useGeneral"
import { groupBranches } from "@/utils/groupBranches"
import AssignBranchModal from "../branch-groups/AssignBranchModal"


type GroupedBranches = Record<string, BranchesType[]>

export default function BranchList() {
  const { data } = useGetBranches()
  const { mutate } = useReorderBranches()
  const [isOpenAssignModal, setIsOpenAssignModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<BranchesType | null>(null)
  const [grouped, setGrouped] = useState<GroupedBranches>({})
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (data) {
      setGrouped(groupBranches(data))
    }
  }, [data])

  const handleDragEnd = (companyId: string, event: any) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const items = grouped[companyId];

    const oldIndex = items.findIndex(i => i.branchCode === active.id);
    const newIndex = items.findIndex(i => i.branchCode === over.id);

    const reordered = arrayMove(items, oldIndex, newIndex);

    setGrouped(prev => ({
      ...prev,
      [companyId]: reordered
    }))

    // debounce auto-save
    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(() => {
      mutate({
        company_id: companyId,
        branchCodes: reordered.map(b => b.branchCode)
      })
    }, 400)
  }

    const handleEdit = (branch: BranchesType) => {
      setSelectedBranch(branch)
      setIsOpenAssignModal(true)
  }

  return (
    <div style={{ maxWidth: 600, margin: "auto" }}>
      {Object.entries(grouped).map(([companyId, branches]) => (
        <div key={companyId} style={{ marginBottom: 40 }}>
          <h2>{companyId}</h2>

          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={(event) => handleDragEnd(companyId, event)}
          >
            <SortableContext
              items={branches.map(b => b.branchCode)}
              strategy={verticalListSortingStrategy}
            >
              {branches.map(branch => (
                <BranchRow   onDoubleClick={() => handleEdit(branch)} key={branch.branchCode} branch={branch} />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      ))}

      {(selectedBranch && isOpenAssignModal ) && (
        <RequestModal title="Assign Branch Group" size="md" onClose={() => {
          setIsOpenAssignModal(false);
          setSelectedBranch(null);
        }}>
           <AssignBranchModal onClose={() => {
          setIsOpenAssignModal(false);
          setSelectedBranch(null);
        }}  selectedBranch={selectedBranch}/>
       </RequestModal>
      )}
      
    </div>
  )
}