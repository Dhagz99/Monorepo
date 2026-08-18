"use client";

import {
  BranchCommissionReportResponse,
  ReportType,
} from "@repo/shared";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import { useCommissionReport } from "@/hooks/reports/userReports";
import { formatMoney } from "../helper/moneyFormat.helper";

type Props = {
  reportType: ReportType;
  startPeriod: string;
  endPeriod: string;
  searchName?: string;
};

export default function BranchCommissionReport({
  reportType,
  startPeriod,
  endPeriod,
  searchName,
}: Props) {
  const [page, setPage] = useState(1);
  const limit = 10;

  const {
    data,
    isLoading,
    isFetching,
    isError,
  } = useCommissionReport({
    reportType,
    startPeriod,
    endPeriod,
    searchName,
    page,
    limit,
  });

  useEffect(() => {
    setPage(1);
  }, [
    reportType,
    startPeriod,
    endPeriod,
    searchName,
  ]);

  const branchData =
    data?.reportType === "BRANCH"
      ? data
      : undefined;

  const rows =
    branchData?.data ?? [];

  const currentPage =
    branchData?.page ?? page;

  const totalPages =
    branchData?.totalPages ?? 1;

  if (isLoading) {
    return (
      <div className="p-custom-16 text-sm text-neutralPrimary">
        Loading branch report...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-custom-16 text-sm text-negative">
        Unable to load branch report.
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="p-custom-16 text-sm text-neutralPrimary">
        No branch report data found for the selected
        period.
      </div>
    );
  }

  return (
    <div className="bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-240 border-collapse">
          <thead>
            <tr className="border-b border-neutralMed text-left">
              <th className="px-custom-24 py-5 text-sm font-semibold">
                Branch
              </th>

              <th className="px-custom-24 py-5 text-sm font-semibold">
                Location
              </th>

              <th className="px-custom-24 py-5 text-sm font-semibold text-left">
                Transactions
              </th>

              <th className="px-custom-24 py-5 text-sm font-semibold text-left">
                Sales
              </th>

              <th className="px-custom-24 py-5 text-sm font-semibold text-left">
                Direct Comm.
              </th>

              <th className="px-custom-24 py-5 text-sm font-semibold text-left">
                Downline Comm.
              </th>

              <th className="px-custom-24 py-5 text-sm font-semibold text-left">
                Total Comm.
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.map((branch) => (
              <tr
                key={branch.branchCode}
                className="odd:bg-neutralLight text-neutralPrimary"
              >
                <td className="px-custom-24 py-custom-16">
                  <div className="flex flex-col">
                    <span className="font-semibold text-mainPrimary">
                      {branch.companyName ??
                        branch.branchCode}
                    </span>

                    <span className="text-xs text-neutralPrimary">
                      {branch.branchCode}
                    </span>
                  </div>
                </td>

                <td className="px-custom-24 py-custom-16">
                  {branch.location ?? "-"}
                </td>

                <td className="px-custom-24 py-custom-16 text-left font-semibold">
                  {branch.transactions}
                </td>

                <td className="px-custom-24 py-custom-16 text-left font-semibold text-mainPrimary">
                  {formatMoney(
                    branch.totalSales
                  )}
                </td>

                <td className="px-custom-24 py-custom-16 text-left font-semibold text-mainPrimary">
                  {formatMoney(
                    branch.totalDirectCommission
                  )}
                </td>

                <td className="px-custom-24 py-custom-16 text-left font-semibold text-mainPrimary">
                  {formatMoney(
                    branch.totalDownlineCommission
                  )}
                </td>

                <td className="px-custom-24 py-custom-16 text-left font-bold text-mainPrimary">
                  {formatMoney(
                    branch.totalCommission
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-custom-32 py-4 border-t border-neutralMed">
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
              currentPage === 1 ||
              isFetching
            }
            onClick={() =>
              setPage((current) =>
                Math.max(current - 1, 1)
              )
            }
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-neutralMed disabled:opacity-50"
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
            onClick={() =>
              setPage((current) =>
                Math.min(
                  current + 1,
                  totalPages
                )
              )
            }
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-neutralMed disabled:opacity-50"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}