"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useBranches } from "@/hooks/general/useGeneral";
import { BranchOption } from "@repo/shared";


type BranchSelectProps = {
  value?: string;
  onChange: (branch: BranchOption) => void;
};

export default function BranchSelect({
  value,
  onChange,
}: BranchSelectProps) {
  const { data: branches = [], isLoading } = useBranches();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedBranch = branches.find(
    (branch) => branch.branchCode === value
  );

  const filteredBranches = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return branches.slice(0, 10);

    return branches
      .filter((branch) =>
        `${branch.branchCode} ${branch.companyName ?? ""}`
          .toLowerCase()
          .includes(keyword)
      )
      .slice(0, 10);
  }, [branches, search]);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutralPrimary" />

        <input
          type="text"
          value={open ? search : selectedBranch?.branchCode ?? ""}
          onFocus={() => {
            setOpen(true);
            setSearch("");
          }}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
          }}
          placeholder={
            isLoading ? "Loading branches..." : "Search branch..."
          }
          className="w-full bg-neutralLight border border-neutralMed py-3 pl-10 pr-custom-16 rounded-lg outline-none focus:ring-1 focus:ring-mainPrimary"
        />
      </div>

      {open && (
        <div className="absolute z-50 mt-2 w-full max-h-60 overflow-y-auto bg-white border border-neutralMed rounded-xl shadow-lg">
          {filteredBranches.length > 0 ? (
            filteredBranches.map((branch) => (
              <button
                key={branch.branchCode}
                type="button"
                onMouseDown={() => {
                  onChange(branch);
                  setSearch("");
                  setOpen(false);
                }}
                className="
                  w-full
                  text-left
                  px-custom-16
                  py-custom-8
                  hover:bg-neutralLight
                  flex
                  flex-col
                "
              >
                <span className="font-semibold text-mainPrimary">
                  {branch.branchCode}
                </span>

                <span className="text-xs text-neutralPrimary">
                  { branch.companyName ?? "-"}
                </span>
              </button>
            ))
          ) : (
            <div className="px-custom-16 py-custom-8 text-sm text-neutralPrimary">
              No branches found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}