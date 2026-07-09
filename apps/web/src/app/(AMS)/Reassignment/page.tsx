"use client";

import MainModal from "@/components/modal/mainModal";
import ModuleHeader from "@/components/ui/commonUi/page.header";
import {
  useAvailableReassignmentUplines,
  useDroppedAgentDownlines,
  useDroppedAgents,
  useReassignDownlines,
} from "@/hooks/reassignment/useReassignment";
import Image from "next/image";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
} from "react";

export default function ReassignmentPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPage = Number(
    searchParams.get("page") || "1"
  );

  const searchParam =
    searchParams.get("search") || "";

  const [search, setSearch] =
    useState(searchParam);

  const [debouncedSearch, setDebouncedSearch] =
    useState(searchParam);

  const [
    selectedDroppedAgentId,
    setSelectedDroppedAgentId,
  ] = useState<string | null>(null);

  const [
    selectedDownlineIds,
    setSelectedDownlineIds,
  ] = useState<string[]>([]);

  const [newUplineId, setNewUplineId] =
    useState("");

  const [uplineSearch, setUplineSearch] =
    useState("");

  const [
    showUplineOptions,
    setShowUplineOptions,
  ] = useState(false);

  const uplineDropdownRef =
    useRef<HTMLDivElement>(null);

  const {
    data: downlineData,
    isLoading: isLoadingDownlines,
  } = useDroppedAgentDownlines(
    selectedDroppedAgentId
  );

  const {
    data: uplineData,
    isLoading: isLoadingUplines,
  } = useAvailableReassignmentUplines(
    selectedDroppedAgentId,
    selectedDownlineIds
  );

  const reassignMutation =
    useReassignDownlines();

  const downlines =
    downlineData?.downlines ?? [];

  const availableUplines =
    uplineData?.data ?? [];

  const { data, isLoading, isError } =
    useDroppedAgents({
      page: currentPage,
      limit: 10,
      search: debouncedSearch || undefined,
    });

  const droppedAgents = data?.data ?? [];
  const meta = data?.meta;

  const filteredUplines =
    availableUplines.filter((upline) => {
      const keyword =
        uplineSearch.toLowerCase();

      return (
        upline.fullName
          .toLowerCase()
          .includes(keyword) ||
        upline.agentCode
          .toLowerCase()
          .includes(keyword)
      );
    });

  const selectedUpline =
    availableUplines.find(
      (upline) => upline.id === newUplineId
    );

  const handleOpenReassignment = (
    droppedAgentId: string
  ) => {
    setSelectedDroppedAgentId(droppedAgentId);
    setSelectedDownlineIds([]);
    setNewUplineId("");
    setUplineSearch("");
    setShowUplineOptions(false);
  };

  const handleCloseReassignment = () => {
    setSelectedDroppedAgentId(null);
    setSelectedDownlineIds([]);
    setNewUplineId("");
    setUplineSearch("");
    setShowUplineOptions(false);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 500);

    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    const params = new URLSearchParams(
      searchParams.toString()
    );

    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    } else {
      params.delete("search");
    }

    params.set("page", "1");

    router.replace(
      `${pathname}?${params.toString()}`
    );
  }, [debouncedSearch, pathname, router]);

  useEffect(() => {
    setNewUplineId("");
    setUplineSearch("");
    setShowUplineOptions(false);
  }, [selectedDownlineIds]);

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent
    ) => {
      if (
        uplineDropdownRef.current &&
        !uplineDropdownRef.current.contains(
          event.target as Node
        )
      ) {
        setShowUplineOptions(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const updateQueryParams = (
    nextPage: number
  ) => {
    const params = new URLSearchParams(
      searchParams.toString()
    );

    params.set("page", String(nextPage));

    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    } else {
      params.delete("search");
    }

    router.replace(
      `${pathname}?${params.toString()}`
    );
  };

  const toggleDownline = (
    downlineId: string,
    checked: boolean
  ) => {
    if (checked) {
      setSelectedDownlineIds((prev) => [
        ...prev,
        downlineId,
      ]);
    } else {
      setSelectedDownlineIds((prev) =>
        prev.filter((id) => id !== downlineId)
      );
    }
  };

  return (
    <div className="w-full flex flex-col gap-y-custom-32 px-custom-32 py-custom-48">
      <div className="flex justify-between">
        <ModuleHeader
          title="Reassignment"
          subtitle="Process"
        />

        <div className="w-full flex justify-end">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="
              max-w-80 min-w-80 h-custom-48 rounded-md border
              border-slate-300 px-4 outline-none focus:ring-1
              focus:ring-mainPrimary focus:border-mainPrimary
              transition shadow-sm
            "
          />
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-xl overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-white text-tertiaryHeader">
            <tr className="text-neutralPrimary">
              <th className="text-left px-custom-24 py-5 font-semibold">
                Agent Code
              </th>
              <th className="text-left px-custom-24 py-5 font-semibold">
                Full Name
              </th>
              <th className="text-left px-custom-24 py-5 font-semibold">
                Level
              </th>
              <th className="text-left px-custom-24 py-5 font-semibold">
                Status
              </th>
              <th className="text-left px-custom-24 py-5 font-semibold">
                Downlines
              </th>
              <th className="text-left px-custom-24 py-5 font-semibold">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-sm text-slate-500"
                >
                  Loading dropped agents...
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-sm text-red-500"
                >
                  Failed to load dropped agents.
                </td>
              </tr>
            ) : droppedAgents.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-sm text-slate-500"
                >
                  {debouncedSearch
                    ? `No dropped agents found for "${debouncedSearch}".`
                    : "No dropped agents found."}
                </td>
              </tr>
            ) : (
              droppedAgents.map((agent) => (
                <tr
                  key={agent.id}
                  className="
                    border-t border-slate-100 hover:bg-slate-50
                    text-neutralPrimary text-body odd:bg-neutralLight
                  "
                >
                  <td className="text-left px-6 py-4 font-semibold">
                    {agent.agentCode}
                  </td>

                  <td className="text-left px-6 py-4 font-semibold capitalize">
                    {agent.fullName}
                  </td>

                  <td className="text-left px-6 py-4 font-semibold">
                    {agent.level}
                  </td>

                  <td className="text-left px-6 py-4 font-semibold text-negative">
                    {agent.status}
                  </td>

                  <td className="text-left px-6 py-4 font-semibold">
                    {agent.downlinesCount}
                  </td>

                  <td className="text-left px-6 py-4">
                    <button
                      type="button"
                      onClick={() =>
                        handleOpenReassignment(
                          agent.id
                        )
                      }
                      className="
                        inline-flex items-center justify-center w-fit
                        rounded-md px-custom-16 py-custom-8 text-xs
                        font-semibold bg-mainPrimary text-white
                        hover:opacity-90 transition
                      "
                    >
                      Reassign
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() =>
            updateQueryParams(currentPage - 1)
          }
          className="
            rounded-md border border-slate-300 px-4 py-2 text-sm
            disabled:cursor-not-allowed disabled:opacity-50
          "
        >
          Previous
        </button>

        <span className="text-sm text-slate-600">
          Page {meta?.page ?? currentPage} of{" "}
          {meta?.totalPages ?? 1}
        </span>

        <button
          type="button"
          disabled={
            currentPage >=
            (meta?.totalPages ?? 1)
          }
          onClick={() =>
            updateQueryParams(currentPage + 1)
          }
          className="
            rounded-md border border-slate-300 px-4 py-2 text-sm
            disabled:cursor-not-allowed disabled:opacity-50
          "
        >
          Next
        </button>
      </div>

      {selectedDroppedAgentId && (
        <MainModal
          size="lg"
          onClose={handleCloseReassignment}
        >
          <div className="flex flex-col gap-custom-16">
            <div className="w-full flex items-start justify-start bg-mainPrimary py-custom-16 px-custom-32 rounded-t-xl">
              <Image
                src="/images/AMSLOGO.svg"
                alt="JameroGroupOfCompanies"
                width={160}
                height={160}
                priority
              />
            </div>

            <div className="px-custom-32 flex flex-col gap-y-custom-8">
              <h1 className="text-mdHeader font-bold text-mainPrimary">
                Reassign Downline Agents
              </h1>

              <p className="text-sm text-neutralPrimary">
                Select affected downlines first, then choose a valid new upline.
              </p>
            </div>

            <div className="px-custom-32 flex flex-col gap-y-custom-16">
              <div
                ref={uplineDropdownRef}
                className="relative flex flex-col gap-y-custom-8"
              >
                <label className="text-sm font-semibold text-neutralPrimary">
                  New Upline
                </label>

                <input
                  type="text"
                  value={uplineSearch}
                  disabled={
                    selectedDownlineIds.length === 0
                  }
                  placeholder={
                    selectedDownlineIds.length === 0
                      ? "Select downline first..."
                      : "Search or select new upline..."
                  }
                  onClick={() => {
                    if (
                      selectedDownlineIds.length === 0
                    ) {
                      return;
                    }

                    setShowUplineOptions(
                      (prev) => !prev
                    );
                  }}
                  onChange={(e) => {
                    setUplineSearch(e.target.value);
                    setShowUplineOptions(true);
                    setNewUplineId("");
                  }}
                  className="
                    h-custom-48
                    rounded-md
                    border
                    border-slate-300
                    px-4
                    outline-none
                    focus:ring-1
                    focus:ring-mainPrimary
                    disabled:bg-slate-100
                    disabled:cursor-not-allowed
                  "
                />


                {showUplineOptions && (
                  <div
                    className="
                      absolute
                      top-19
                      z-50
                      w-full
                      max-h-64
                      overflow-y-auto
                      rounded-md
                      border
                      border-slate-200
                      bg-white
                      shadow-lg
                    "
                  >
                    {isLoadingUplines ? (
                      <div className="px-4 py-3 text-sm text-slate-500">
                        Loading uplines...
                      </div>
                    ) : filteredUplines.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-slate-500">
                        No valid uplines found for the selected downlines.
                      </div>
                    ) : (
                      filteredUplines.map((upline) => (
                        <button
                          key={upline.id}
                          type="button"
                          onClick={() => {
                            setNewUplineId(upline.id);
                            setUplineSearch(
                              `${upline.fullName} - ${upline.agentCode}`
                            );
                            setShowUplineOptions(false);
                          }}
                          className="
                            w-full
                            px-4
                            py-3
                            text-left
                            hover:bg-slate-50
                            border-b
                            border-slate-100
                          "
                        >
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-neutralPrimary">
                              {upline.fullName}
                            </span>

                            <span className="text-xs text-slate-500">
                              {upline.agentCode} •{" "}
                              {upline.level} •{" "}
                              {upline.status}
                            </span>

                            <span className="text-xs text-slate-400">
                              L2 slots:{" "}
                              {upline.availableL2Slots} •
                              L3 slots:{" "}
                              {upline.availableL3Slots}
                            </span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-y-custom-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-neutralPrimary">
                    Affected Downlines
                  </h2>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedDownlineIds(
                        downlines.map(
                          (downline) => downline.id
                        )
                      )
                    }
                    className="text-xs font-semibold text-mainPrimary"
                  >
                    Select All
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto rounded-md border border-slate-200">
                  {isLoadingDownlines ? (
                    <div className="px-4 py-6 text-center text-sm text-slate-500">
                      Loading downlines...
                    </div>
                  ) : downlines.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-slate-500">
                      No affected downlines found.
                    </div>
                  ) : (
                    downlines.map((downline) => {
                      const checked =
                        selectedDownlineIds.includes(
                          downline.id
                        );

                      return (
                        <label
                          key={downline.id}
                          className="
                            flex
                            items-center
                            gap-x-3
                            px-4
                            py-3
                            border-b
                            border-slate-100
                            cursor-pointer
                            hover:bg-slate-50
                          "
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) =>
                              toggleDownline(
                                downline.id,
                                e.target.checked
                              )
                            }
                          />

                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-neutralPrimary">
                              {downline.fullName}
                            </span>

                            <span className="text-xs text-slate-500">
                              {downline.agentCode} •{" "}
                              {downline.level} •{" "}
                              {downline.status}
                            </span>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="px-custom-32 pb-custom-24 flex justify-end gap-x-custom-16">
              <button
                type="button"
                onClick={handleCloseReassignment}
                className="
                  rounded-md
                  border
                  border-slate-300
                  px-custom-16
                  py-custom-8
                  text-sm
                  font-semibold
                "
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  !newUplineId ||
                  selectedDownlineIds.length === 0 ||
                  reassignMutation.isPending
                }
                onClick={async () => {
                  await reassignMutation.mutateAsync({
                    droppedAgentId:
                      selectedDroppedAgentId,
                    newUplineId,
                    downlineAgentIds:
                      selectedDownlineIds,
                  });

                  handleCloseReassignment();
                }}
                className="
                  rounded-md
                  bg-positive
                  px-custom-16
                  py-custom-8
                  text-sm
                  font-semibold
                  text-white
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {reassignMutation.isPending
                  ? "Reassigning..."
                  : "Confirm Reassignment"}
              </button>
            </div>
          </div>
        </MainModal>
      )}
    </div>
  );
}