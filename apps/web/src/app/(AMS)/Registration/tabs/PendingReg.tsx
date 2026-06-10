"use client";

import { useGetPendingAgents, useUpdatePendingAgentStatus } from "@/hooks/agents/useAgent";
import SweetAlert from "@/components/modal/Swal";
import Swal from "sweetalert2";
import { useState } from "react";

import {
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Trash,
} from "lucide-react";

export default function PendingRegistration() {

  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(1);

  const {
    data,
    isLoading,
  } = useGetPendingAgents({
    page,
    search,
    status: "PENDING",
  });

  const updateStatusMutation = useUpdatePendingAgentStatus();


  const handleUpdateStatus = async (
    agentId: string,
    status: "ACTIVE" | "REJECTED"
    ) => {

    const isApprove =
        status === "ACTIVE";

    SweetAlert.confirmationAlert(
        isApprove
        ? "Approve Agent"
        : "Reject Agent",

        isApprove
        ? "Are you sure you want to approve this agent?"
        : "Are you sure you want to reject this agent?",

        async () => {

        try {

            SweetAlert.loadingAlert(
            isApprove
                ? "Approving Agent"
                : "Rejecting Agent",

            "Please wait..."
            );

            await updateStatusMutation.mutateAsync({
            agentId,
            status,
            });

            Swal.close();

            await SweetAlert.successAlert(
            isApprove
                ? "Approved"
                : "Rejected",

            isApprove
                ? "Agent approved successfully"
                : "Agent rejected successfully"
            );

        } catch (error) {

            console.log(error);

            Swal.close();

            SweetAlert.errorAlert(
            isApprove
                ? "Approval Failed"
                : "Rejection Failed",

            "Something went wrong."
            );
        }
        }
    );
    };

  return (
    <div
      className="
        w-full
        flex
        flex-col
        gap-y-custom-32
      "
    >

        <div className="w-full flex justify-end">
            {search !== undefined && setSearch && (
                <input
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);

                        if (setPage) {
                            setPage(1);
                        }
                    }}
                    className="
                        max-w-80 min-w-80 h-custom-48
                        rounded-md border border-slate-300
                        px-4 outline-none
                        focus:ring-1
                        focus:ring-mainPrimary
                        focus:border-mainPrimary
                        transition shadow-sm
                    "
                />
            )}
        </div>

      {/* TABLE */}
      <div className="bg-white shadow-sm rounded-xl overflow-hidden">

        <table className="w-full border-collapse">

          <thead className="bg-white text-tertiaryHeader">

            <tr className="text-neutralPrimary">

              <th className="text-left px-custom-24 py-5 font-semibold">
                Registration Date
              </th>

              <th className="text-left px-custom-24 py-5 font-semibold">
                Fullname
              </th>

              <th className="text-left px-custom-24 py-5 font-semibold">
                Level
              </th>

              <th className="text-left px-custom-24 py-5 font-semibold">
                Branch
              </th>

              <th className="text-left px-custom-24 py-5 font-semibold">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {/* LOADING */}
            {isLoading && (
              <tr>

                <td
                  colSpan={5}
                  className="text-center py-10"
                >
                  Loading...
                </td>

              </tr>
            )}

            {/* EMPTY */}
            {!isLoading &&
              data?.data.length === 0 && (
                <tr>

                  <td
                    colSpan={5}
                    className="
                      text-center
                      py-10
                      text-neutralPrimary
                    "
                  >
                    No pending agents found.
                  </td>

                </tr>
              )}

            {/* DATA */}
            {!isLoading &&
              data?.data.map(
                (agent, index) => (

                  <tr
                    key={index}
                    className="
                      text-neutralPrimary
                      text-body
                      odd:bg-neutralLight
                    "
                  >

                    {/* DATE */}
                    <td className="text-left px-6 py-4 font-semibold">

                      {new Date(
                        agent.createdAt
                      ).toLocaleDateString()}

                    </td>

                    {/* NAME */}
                    <td className="text-left px-6 py-4 font-semibold">

                      {agent.fullName}

                    </td>

                    {/* LEVEL */}
                    <td className="text-left px-6 py-4 font-semibold">

                      {agent.level}

                    </td>

                    <td className="text-left px-6 py-4">

                    <div className="flex flex-wrap gap-2">

                        {agent.branches.length > 0 ? (

                        agent.branches.map(
                            (item) => (

                            <span
                                key={
                                item.branch.branchCode
                                }
                                className="text-left px-custom-16 py-custom-8 font-semibold rounded-full text-xs bg-positive text-white"
                            >
                                {
                                item.branch.companyName
                                }
                            </span>
                            )
                        )

                        ) : (

                        <span>
                            No Branch
                        </span>

                        )}

                    </div>

                    </td>

                    <td className="text-left px-6 py-4">

                    <div className="flex items-center gap-3">

                        {/* APPROVE */}
                        <button
                        title="Approve Agent"
                        onClick={() =>
                            handleUpdateStatus(
                            agent.id,
                            "ACTIVE"
                            )
                        }
                          className="
                            px-custom-8
                            py-custom-8
                            rounded-xl
                            bg-lightPrimary
                           hover:bg-mainPrimary
                            cursor-pointer
                            text-white
                            inline-flex
                            items-end
                            gap-custom-8
                            text-xs
                            font-semibold
                            transition
                        "
                        >
                        <CheckCheck size={20}/>
                        </button>

                        {/* REJECT */}
                        <button
                        title="Reject Agent"
                        onClick={() =>
                            handleUpdateStatus(
                            agent.id,
                            "REJECTED"
                            )
                        }
                            className="
                            px-custom-8
                            py-custom-8
                            rounded-xl
                            bg-negative
                           hover:bg-red-900
                            cursor-pointer
                            text-white
                            inline-flex
                            items-end
                            gap-custom-8
                            text-xs
                            font-semibold
                            transition
                        "
                        >
                        <Trash size={20}/>
                        </button>

                    </div>

                    </td>

                  </tr>
                )
              )}

          </tbody>

        </table>

        {/* PAGINATION */}
        <div
          className="
            flex
            items-center
            justify-between
            px-custom-32
            py-4
            border-t
            border-neutralMed
            bg-white
          "
        >

          <div className="text-sm text-neutralPrimary">

            Showing page{" "}

            <span className="font-semibold">
              {data?.page || 1}
            </span>{" "}

            of{" "}

            <span className="font-semibold">
              {data?.totalPages || 1}
            </span>

          </div>

          <div className="flex items-center gap-3">

            {/* PREVIOUS */}
            <button
              disabled={page === 1}
              onClick={() =>
                setPage(
                  (prev) => prev - 1
                )
              }
              className="
                inline-flex
                items-center
                gap-2
                px-4
                py-2
                rounded-lg
                border
                border-neutralMed
                hover:bg-neutralLight
                disabled:opacity-50
                disabled:cursor-not-allowed
                transition
              "
            >

              <ChevronLeft className="w-4 h-4" />

              Previous

            </button>

            {/* PAGE */}
            <div
              className="
                w-full
                px-custom-16
                py-1
                rounded-lg
                bg-mainPrimary
                text-white
                flex
                items-center
                justify-center
                font-semibold
              "
            >
              {page}
            </div>

            {/* NEXT */}
            <button
              disabled={
                page ===
                data?.totalPages
              }
              onClick={() =>
                setPage(
                  (prev) => prev + 1
                )
              }
              className="
                inline-flex
                items-center
                gap-2
                px-4
                py-2
                rounded-lg
                border
                border-neutralMed
                hover:bg-neutralLight
                disabled:opacity-50
                disabled:cursor-not-allowed
                transition
              "
            >

              Next

              <ChevronRight className="w-4 h-4" />

            </button>

          </div>

        </div>

      </div>

    </div>
  );
}