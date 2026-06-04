import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { assignBranchGroupService, createBranchGroup, deleteBranchGroup, getBranchGroups } from "../services/general.services";
import { BranchGroupType } from "@repo/shared";


// GET
export const useBranchGroups = () =>{
  return useQuery<BranchGroupType>({
    queryKey: ["branch-groups"],
    queryFn: getBranchGroups,
    staleTime: 1000 * 60 * 10
  });
}

// CREATE
export const useCreateGroup = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createBranchGroup,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["branch-groups"] });
    },
  });
};

// DELETE
export const useDeleteGroup = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteBranchGroup,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["branch-groups"] });
    },
  });
};

export const useAssignBranchGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: assignBranchGroupService,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["branch-groups"] });
      qc.invalidateQueries({ queryKey: ["branches"] });
    },
  });
};