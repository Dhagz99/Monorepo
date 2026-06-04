import { BranchesType } from "@repo/shared"

export const groupBranches = (branches: BranchesType[]) => {

  const grouped: Record<string, BranchesType[]> = {}

  branches.forEach((branch) => {

    const key = branch.company_id ?? "UNKNOWN"

    if (!grouped[key]) {
      grouped[key] = []
    }

    grouped[key].push(branch)

  })

  return grouped

}