"use client";

import {
  AgentCommissionDetailsResponse,
  CommissionDetailType,
} from "@repo/shared";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { formatMoney } from "../../helper/moneyFormat.helper";

type Props = {
  details:
    | AgentCommissionDetailsResponse
    | undefined;

  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;

  onPageChange: (page: number) => void;
};

const DETAIL_TITLE: Record<
  CommissionDetailType,
  string
> = {
  DIRECT: "Direct Commission Details",
  OVERRIDE_L2: "Downline Commission Details",
  OVERRIDE_L3: "Downline Commission Details",
};

const DETAIL_TOTAL_LABEL: Record<
  CommissionDetailType,
  string
> = {
  DIRECT: "Total Direct Commission",
  OVERRIDE_L2: "Total Override from L2",
  OVERRIDE_L3: "Total Override from L3",
};

export function CommissionDetails({
  details,
  isLoading,
  isFetching,
  isError,
  onPageChange,
}: Props) {
  if (isLoading) {
    return (
      <div className="py-custom-16 px-custom-24 text-sm text-neutralPrimary">
        Loading commission details...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-custom-16 px-custom-24 text-sm text-negative">
        Unable to load commission details.
      </div>
    );
  }

  if (!details) {
    return (
      <div className="py-custom-16 px-custom-24 text-sm text-neutralPrimary">
        No commission details available.
      </div>
    );
  }

  const {
    transactions,
    page,
    totalPages,
    total,
  } = details;

  const isDirect =
    details.detailType === "DIRECT";

  return (
    <div className="overflow-hidden rounded-lg border border-neutralMed bg-white shadow-lg">
      <div className="flex items-center justify-between px-custom-16 py-custom-16 border-b border-neutralMed">
        <div>
          <h4 className="font-semibold text-mainPrimary">
            {DETAIL_TITLE[details.detailType]}
          </h4>

          <p className="text-xs text-neutralPrimary">
            {details.fullName}
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-neutralPrimary">
            {
              DETAIL_TOTAL_LABEL[
                details.detailType
              ]
            }
          </p>

          <p className="font-bold text-mainPrimary">
            {formatMoney(
              details.totalCommission
            )}
          </p>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="py-custom-24 px-custom-24 text-sm text-neutralPrimary">
          No commission transactions found.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-240">
              <thead>
                <tr className="border-b border-neutralMed bg-neutralLight">
                  <th className="px-custom-16 py-custom-16 text-left text-xs font-semibold">
                    Date
                  </th>

                  <th className="px-custom-16 py-custom-16 text-left text-xs font-semibold">
                    {isDirect
                      ? "Client"
                      : "Received From"}
                  </th>

                  <th className="px-custom-16 py-custom-16 text-left text-xs font-semibold">
                    Reference
                  </th>

                  {!isDirect && (
                    <th className="px-custom-16 py-custom-16 text-left text-xs font-semibold">
                      Source Level
                    </th>
                  )}

                  {isDirect && (
                    <th className="px-custom-16 py-custom-16 text-left text-xs font-semibold">
                      Loan Term
                    </th>
                  )}


                  {isDirect && (
                  <>
                    <th className="px-custom-16 py-custom-16 text-right text-xs font-semibold">
                      Sale Amount
                    </th>
                  

                    <th className="px-custom-16 py-custom-16 text-right text-xs font-semibold">
                      Percentage
                    </th>
                  </>
                  )}

                  <th className="px-custom-16 py-custom-16 text-right text-xs font-semibold">
                    Commission
                  </th>
                </tr>
              </thead>

              <tbody
                className={
                  isFetching
                    ? "opacity-60"
                    : undefined
                }
              >
                {transactions.map(
                  (transaction) => (
                    <tr
                      key={
                        transaction.transactionId
                      }
                      className="border-b border-neutralMed last:border-b-0"
                    >
                      <td className="px-custom-16 py-custom-16 text-sm">
                        {transaction.scannedAt
                          ? new Date(
                              transaction.scannedAt
                            ).toLocaleDateString(
                              "en-PH"
                            )
                          : "-"}
                      </td>

                      <td className="px-custom-16 py-custom-16 text-sm font-medium">
                        {isDirect
                          ? transaction.clientName ??
                            "-"
                          : transaction.sourceAgentName ??
                            "-"}
                      </td>

                      <td className="px-custom-16 py-custom-16 text-sm">
                        {transaction.saleReference ??
                          "-"}
                      </td>

                      {!isDirect && (
                        <td className="px-custom-16 py-custom-16 text-sm">
                          {transaction.sourceLevel ??
                            "-"}
                        </td>
                      )}

                      {isDirect && (
                        <td className="px-custom-16 py-custom-16 text-sm">
                          {transaction.term ?? "-"}
                        </td>
                      )}


                      {isDirect && (
                      <>
                      <td className="px-custom-16 py-custom-16 text-sm text-right">
                        {formatMoney(
                          transaction.saleAmount
                        )}
                      </td>

                      <td className="px-custom-16 py-custom-16 text-sm text-right">
                        {transaction.percentage ==
                        null
                          ? "-"
                          : `${transaction.percentage}%`}
                      </td>
                      </>
                      )}

                      <td className="px-custom-16 py-custom-16 text-sm text-right font-semibold text-mainPrimary">
                        {formatMoney(
                          transaction.commissionAmount
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-custom-16 py-custom-16 border-t border-neutralMed bg-white">
            <div className="text-sm text-neutralPrimary">
              Showing page{" "}
              <span className="font-semibold">
                {page}
              </span>{" "}
              of{" "}
              <span className="font-semibold">
                {totalPages}
              </span>

              <span className="ml-2 text-xs">
                ({total} transaction
                {total === 1 ? "" : "s"})
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={
                  page <= 1 || isFetching
                }
                onClick={() =>
                  onPageChange(
                    Math.max(page - 1, 1)
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

              <div className="px-custom-16 py-1 rounded-lg bg-mainPrimary text-white font-semibold">
                {page}
              </div>

              <button
                type="button"
                disabled={
                  page >= totalPages ||
                  isFetching
                }
                onClick={() =>
                  onPageChange(
                    Math.min(
                      page + 1,
                      totalPages
                    )
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
        </>
      )}
    </div>
  );
}