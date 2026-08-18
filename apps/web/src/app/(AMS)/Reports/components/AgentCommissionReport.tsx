"use client";

import {
  useAgentCommissionDetails,
  useCommissionReport,
} from "@/hooks/reports/userReports";

import { CommissionDetailType, ReportType } from "@repo/shared";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from "lucide-react";

import {
  Fragment,
  useEffect,
  useState,
} from "react";

import { formatMoney } from "../helper/moneyFormat.helper";
import { CommissionDetails } from "./subcomponents/commissionDetails";


type Props = {
  reportType: ReportType;
  startPeriod: string;
  endPeriod: string;
  searchName: string;
};

export default function AgentCommissionReport({
  reportType,
  startPeriod,
  endPeriod,
  searchName
}: Props) {
  const [page, setPage] = useState(1);

  const [detailPage, setDetailPage] = useState(1);
  const detailLimit = 5;


  type ExpandedCommission = {
    agentId: string;
    detailType: CommissionDetailType;
  } | null;

  const [
    expandedCommission,
    setExpandedCommission,
  ] = useState<ExpandedCommission>(null);

  const limit = 10;

  const [debouncedSearchName, setDebouncedSearchName] =
  useState(searchName);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearchName(searchName.trim());
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [searchName]);

  const {
    data,
    isLoading,
    isFetching,
    isError,
  } = useCommissionReport({
    reportType,
    startPeriod,
    endPeriod,
    searchName: debouncedSearchName,
    page,
    limit,
  });

  const {
    data: commissionDetails,
    isLoading: isDetailsLoading,
    isFetching: isDetailsFetching,
    isError: isDetailsError,
  } = useAgentCommissionDetails({
    agentId:
      expandedCommission?.agentId ?? null,

    detailType:
      expandedCommission?.detailType ?? null,

    startPeriod,
    endPeriod,

    page: detailPage,
    limit: detailLimit,

    enabled: expandedCommission !== null,
  });
  /*
   * All hooks must be called before conditional returns.
   */
  useEffect(() => {
    setPage(1);
    setDetailPage(1);
    setExpandedCommission(null);
  }, [
    reportType,
    startPeriod,
    endPeriod,
    debouncedSearchName,
  ]);

  const agentReport =
    data?.reportType === "AGENT"
      ? data
      : undefined;

  const rows = agentReport?.data ?? [];
  const currentPage = agentReport?.page ?? page;
  const totalPages = agentReport?.totalPages ?? 1;

  const handleCommissionClick = (
    agentId: string,
    detailType: CommissionDetailType
  ) => {
    const isSameSelection =
      expandedCommission?.agentId === agentId &&
      expandedCommission?.detailType === detailType;

    setDetailPage(1);

    setExpandedCommission(
      isSameSelection
        ? null
        : {
            agentId,
            detailType,
          }
    );
  };


  if (isLoading) {
    return (
      <div className="py-custom-16 px-custom-24 text-sm text-neutralPrimary">
        Loading commission report...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-custom-16 px-custom-24 text-sm text-negative">
        Unable to load report.
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="py-custom-16 px-custom-24 text-sm text-neutralPrimary">
        No commission report data found for the selected
        period.
      </div>
    );
  }


  const handleGenerateCommissionDetailReport = (
    agentId: string
  ) => {
    if (!expandedCommission) {
      return;
    }

    const params = new URLSearchParams({
      agentId,
      detailType:
        expandedCommission.detailType,
      startPeriod,
      endPeriod,
    });

    const width = 1100;
    const height = 800;

    const left =
      window.screenX +
      (window.outerWidth - width) / 2;

    const top =
      window.screenY +
      (window.outerHeight - height) / 2;

    window.open(
      `/print/commission-details?${params.toString()}`,
      "CommissionDetailsReport",
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
  };

  return (
    <div>
      <div className="bg-white rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-275 border-collapse">
            <thead>
              <tr className="border-b border-neutralMed text-left">
                <th className="text-sm px-custom-24 py-5 font-semibold">
                  Agent
                </th>

                <th className="text-sm px-custom-24 py-5 font-semibold">
                  Level
                </th>

                <th className="text-sm px-custom-24 py-5 font-semibold">
                  Transactions
                </th>

                <th className="text-sm px-custom-24 py-5 font-semibold">
                  Sales
                </th>

                <th className="text-sm px-custom-24 py-5 font-semibold">
                  Direct Comm.
                </th>

                <th className="text-sm px-custom-24 py-5 font-semibold">
                  Override L2
                </th>

                <th className="text-sm px-custom-24 py-5 font-semibold">
                  Override L3
                </th>

                <th className="text-sm px-custom-24 py-5 font-semibold">
                  Total Comm.
                </th>
              </tr>
            </thead>

            <tbody>
              {rows.map((agentComm) => {
                const isDirectExpanded =
                  expandedCommission?.agentId === agentComm.agentId &&
                  expandedCommission.detailType === "DIRECT";

                const isOverrideL2Expanded =
                  expandedCommission?.agentId === agentComm.agentId &&
                  expandedCommission.detailType === "OVERRIDE_L2";

                const isOverrideL3Expanded =
                  expandedCommission?.agentId === agentComm.agentId &&
                  expandedCommission.detailType === "OVERRIDE_L3";

                const isAnyExpanded =
                  expandedCommission?.agentId === agentComm.agentId;

                return (
                  <Fragment key={agentComm.agentId}>
                    <tr className="text-neutralPrimary text-body odd:bg-neutralLight">
                      <td className="text-left px-6 py-4 font-semibold">
                        {agentComm.fullName ??
                          "Unknown Agent"}
                      </td>

                      <td className="text-left px-6 py-4 font-semibold">
                        {agentComm.level}
                      </td>

                      <td className="text-left px-6 py-4 font-semibold">
                        {agentComm.transactions}
                      </td>

                      <td className="text-left px-6 py-4">
                        <strong className="text-mainPrimary">
                          {formatMoney(
                            agentComm.personalSales
                          )}
                        </strong>
                      </td>

                      <td className="text-left px-6 py-4">
                        <button
                          type="button"
                          onClick={() =>
                            handleCommissionClick(
                              agentComm.agentId,
                              "DIRECT"
                            )
                          }
                          aria-expanded={isDirectExpanded}
                          className="
                            inline-flex
                            items-center
                            gap-2
                            rounded
                            font-semibold
                            text-mainPrimary
                            hover:underline
                            focus:outline-none
                            focus-visible:ring-2
                            focus-visible:ring-mainPrimary
                            cursor-pointer
                          "
                        >
                          {formatMoney(
                            agentComm.directComm
                          )}

                          {isDirectExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                          ) : (
                              <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      <td className="text-left px-6 py-4">
                        {agentComm.overrideFromL2 === null ? (
                          <strong className="text-mainPrimary">
                            -
                          </strong>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              handleCommissionClick(
                                agentComm.agentId,
                                "OVERRIDE_L2"
                              )
                            }
                            aria-expanded={isOverrideL2Expanded}
                            className="
                              inline-flex
                              items-center
                              gap-2
                              rounded
                              font-semibold
                              text-mainPrimary
                              hover:underline
                              cursor-pointer
                            "
                          >
                            {formatMoney(agentComm.overrideFromL2)}

                            {isOverrideL2Expanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </td>

                      <td className="text-left px-6 py-4">
                        {agentComm.overrideFromL3 === null ? (
                          <strong className="text-mainPrimary">
                            -
                          </strong>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              handleCommissionClick(
                                agentComm.agentId,
                                "OVERRIDE_L3"
                              )
                            }
                            aria-expanded={isOverrideL3Expanded}
                            className="
                              inline-flex
                              items-center
                              gap-2
                              rounded
                              font-semibold
                              text-mainPrimary
                              hover:underline
                              cursor-pointer
                            "
                          >
                            {formatMoney(agentComm.overrideFromL3)}

                            {isOverrideL3Expanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </td>

                      <td className="text-left px-6 py-4">
                        <strong className="text-mainPrimary">
                          {formatMoney(
                            agentComm.totalComm
                          )}
                        </strong>
                      </td>
                    </tr>

                  {isAnyExpanded && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-custom-16 py-custom-24 bg-neutralMed"
                      >
                        <div className="flex justify-end mb-custom-16">
                          <button
                            type="button"
                            onClick={() =>
                              handleGenerateCommissionDetailReport(
                                agentComm.agentId
                              )
                            }
                            className="
                              bg-lightPrimary
                              text-white
                              px-custom-24
                              py-custom-8
                              rounded-lg
                              text-sm
                              cursor-pointer
                            "
                          >
                            Generate Commission Ledger
                          </button>
                        </div>

                        <CommissionDetails
                          details={commissionDetails}
                          isLoading={isDetailsLoading}
                          isFetching={isDetailsFetching}
                          isError={isDetailsError}
                          onPageChange={setDetailPage}
                        />
                      </td>
                    </tr>
                  )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-custom-32 py-4 border-t border-neutralMed bg-white">
          <div className="text-sm text-neutralPrimary">
            Showing page{" "}
            <span className="font-semibold">
              {currentPage}
            </span>{" "}
            of{" "}
            <span className="font-semibold">
              {totalPages}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={
                currentPage === 1 || isFetching
              }
              onClick={() => {
                setExpandedCommission(null);

                setPage((current) =>
                  Math.max(current - 1, 1)
                );
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-neutralMed hover:bg-neutralLight disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="px-custom-16 py-1 rounded-lg bg-mainPrimary text-white font-semibold">
              {currentPage}
            </div>

            <button
              type="button"
              disabled={
                currentPage >= totalPages ||
                isFetching
              }
              onClick={() => {
                setExpandedCommission(null);

                setPage((current) =>
                  Math.min(
                    current + 1,
                    totalPages
                  )
                );
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-neutralMed hover:bg-neutralLight disabled:opacity-50 disabled:cursor-not-allowed transition"
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