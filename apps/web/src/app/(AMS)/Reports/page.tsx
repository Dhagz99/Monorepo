"use client";

import ModuleHeader from "@/components/ui/commonUi/page.header";
import SummaryCard from "./components/summaryCard";
import {
  useAgentsNearMaintenanceExpiry,
  useReportsAnalytics,
  useTopEarningAgents,
} from "@/hooks/reports/userReports";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import TopEarningAgentsTable from "./components/topAgent";
import { CardSim, Coins, CreditCard, PiggyBank, Wallet } from "lucide-react";
import MaintenanceNearExpiryTable from "./components/expireryAgent";
import { useState } from "react";

const formatMoney = (value?: number | string | null) => {
  return `₱${Number(value ?? 0).toLocaleString()}`;
};

export default function ReportsAnalytics() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") ?? 1);
  const expiryPage = Number(searchParams.get("expiryPage") ?? 1);


  const limit = 5;

  const now = new Date();

  const defaultMonth = `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}`;

  const selectedMonth =
    searchParams.get("month") ?? defaultMonth;
  const {
    data,
    isLoading: isReportsLoading,
  } = useReportsAnalytics({
    month: selectedMonth,
  });
  const {
    data: top,
    isLoading: isTopLoading,
  } = useTopEarningAgents({
    page,
    limit,
    month: selectedMonth,
  });

  const {
    data: nearExpiry,
    isLoading: isNearExpiryLoading,
  } = useAgentsNearMaintenanceExpiry({
    page: expiryPage,
    limit: 10,
    month: selectedMonth,
  });

  const updateQueryParams = (
    key: string,
    value: string | number
  ) => {
    const params = new URLSearchParams(
      searchParams.toString()
    );

    params.set(key, String(value));

    router.push(`${pathname}?${params.toString()}`);
  };

  if (isReportsLoading) {
    return <div>Loading reports...</div>;
  }

  return (
    <div className="w-full flex flex-col gap-y-custom-24 px-custom-32 py-custom-48">
      <div className="flex justify-between items-center">
        <ModuleHeader
          title="Reports &"
          subtitle="Analytics"
        />

        <input
          type="month"
          value={selectedMonth}
          onChange={(event) => {
            const params = new URLSearchParams(
              searchParams.toString()
            );

            params.set("month", event.target.value);
            params.set("page", "1");
            params.set("expiryPage", "1");

            router.push(`${pathname}?${params.toString()}`);
          }}
          className="
            border
            border-neutralMed
            rounded-xl
            px-custom-16
            py-custom-8
            text-sm
            text-mainPrimary
            bg-white
          "
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-custom-16">
        <SummaryCard
          title="Commission Generated"
          value={formatMoney(
            data?.summary.totalCommissionGenerated
          )}
          icon={Coins}
          iconBg="bg-positive"
        />

        <SummaryCard
          title="Withdrawn This Month"
          value={formatMoney(
            data?.summary.totalCompletedWithdrawals
          )}
          icon={Wallet}
          iconBg="bg-lightPrimary"
        />

        <div className="md:col-span-2 lg:col-span-1">
          <SummaryCard
            title="Available Agent Credits"
            value={formatMoney(
              data?.summary.totalAvailableCredits
            )}
            icon={PiggyBank}
            iconBg="bg-secondary"
          />
        </div>

      </div>

      <div className="flex flex-col gap-custom-24">
        <div
          className="
            w-full
            grid
            grid-cols-1
            lg:grid-cols-[55%_43%]
            gap-custom-24
            relative
          "
        >
          <div className="flex flex-col gap-custom-16">
            <div className="border border-neutralMed rounded-xl shadow-sm">
                <div className="p-custom-16 border-b border-neutralMed">
                  <h3 className="font-semibold text-mainPrimary">
                    Top Earning Agents
                  </h3>
                </div>
                <TopEarningAgentsTable
                  data={top?.data ?? []}
                  isLoading={isTopLoading}
                  page={top?.page ?? page}
                  totalPages={top?.totalPages ?? 1}
                  onPageChange={(nextPage) =>
                    updateQueryParams("page", nextPage)
                  }
                />
            </div>
            <div className="border border-neutralMed rounded-xl shadow-sm">
                <div className="p-custom-16 border-b border-neutralMed">
                  <h3 className="font-semibold text-mainPrimary">
                    Agent Unfinished Monthly Cycle
                  </h3>
                </div>
                <MaintenanceNearExpiryTable
                  data={nearExpiry?.data ?? []}
                  isLoading={isNearExpiryLoading}
                  page={nearExpiry?.page ?? expiryPage}
                  totalPages={nearExpiry?.totalPages ?? 1}
                  onPageChange={(nextPage) =>
                    updateQueryParams("expiryPage", nextPage)
                  }
                />
            </div>
            
          </div>

          <div className="flex flex-col gap-custom-16">


            <div className="border border-neutralMed rounded-xl shadow-sm">
              <div className="p-custom-16 border-b border-neutralMed">
                <h3 className="font-semibold text-mainPrimary">
                  Activity Feeds
                </h3>
              </div>

              <div className="divide-y divide-neutralMed max-h-120 overflow-y-auto">
                {data?.activityFeeds?.length ? (
                  data.activityFeeds.map((feed) => (
                    <div
                      key={`${feed.type}-${feed.id}`}
                      className="p-custom-16 flex items-start justify-between gap-custom-16"
                    >
                      <div className="flex flex-col gap-1">
                        <h4 className="font-semibold text-mainPrimary">
                          {feed.title}
                        </h4>

                        <p className="text-xs text-neutralPrimary">
                          {feed.description}
                        </p>

                        <p className="text-xs text-neutralPrimary">
                          {new Date(feed.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-mainPrimary">
                          ₱{Number(feed.amount).toLocaleString()}
                        </p>

                        <span
                          className={`
                            inline-flex
                            mt-1
                            px-custom-16
                            py-1
                            rounded-lg
                            text-xs
                            font-semibold
                            text-white
                            ${
                              feed.status === "PAID" ||
                              feed.status === "COMPLETED"
                                ? "bg-positive"
                                : feed.status === "FAILED" ||
                                  feed.status === "REJECTED" ||
                                  feed.status === "EXPIRED"
                                ? "bg-negative"
                                : "bg-secondary"
                            }
                          `}
                        >
                          {feed.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-custom-16 text-sm text-neutralPrimary">
                    No activity feeds found.
                  </div>
                )}
              </div>

              <div className="p-custom-16 border-t border-neutralMed">
                <button
                  onClick={() => router.push("/Transaction?tab=PAYMENTS")}
                  className="
                    w-full
                    rounded-xl
                    bg-mainPrimary
                    text-white
                    py-custom-8
                    font-semibold
                    hover:bg-lightPrimary
                    transition
                    cursor-pointer
                  "
                >
                  View All Transactions
                </button>
              </div>
            </div>

            <div className="border border-neutralMed rounded-xl shadow-sm">
              <div className="p-custom-16 border-b border-neutralMed">
                <h3 className="font-semibold text-mainPrimary">
                  Company Expenses
                </h3>
              </div>

              <div className="divide-y divide-neutralMed">
                {data?.monthlyExpenses.length ? (
                  data.monthlyExpenses.map((expense) => (
                    <div
                      key={expense.type}
                      className="flex items-center justify-between px-custom-16 py-custom-16"
                    >
                      <div className="inline-flex gap-custom-16 items-center">
                        <div className="p-custom-8 bg-negative text-white
                         rounded-full"><CreditCard/></div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-mainPrimary">
                            {expense.type
                              .replaceAll("_", " ")
                              .toUpperCase()}
                          </span>
                          <span className="text-sm text-neutralPrimary">
                            {expense.count} transaction
                            {expense.count > 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>

                      <span className="font-bold text-darkPrimary">
                        ₱{expense.total.toLocaleString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-custom-24 text-center text-neutralPrimary">
                    No company expenses this month.
                  </div>
                )}
              </div>

              <div className="border-t bg-lightPrimary/10 border-neutralMed px-custom-16 py-custom-16 flex justify-between">
                <span className="font-semibold text-lightPrimary">
                  Total Expenses
                </span>

                <span className="font-bold text-darkPrimary">
                  ₱
                  {(
                    data?.monthlyExpenses.reduce(
                      (sum, item) => sum + item.total,
                      0
                    ) ?? 0
                  ).toLocaleString()}
                </span>
              </div>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
}