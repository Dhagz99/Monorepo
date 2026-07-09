import { TransactionHist } from "@repo/shared";

export const renderTransactionItem = (
  transaction: TransactionHist
) => {
  const isWithdrawal =
    transaction.type === "WITHDRAWAL";

  return (
    <div
      key={transaction.id}
      className="
        w-full
        border-y
        border-white/10
        rounded-xl
        p-custom-16
        flex
        flex-col
        gap-y-custom-8
        hover:bg-white/15
        transition
        cursor-pointer
      "
    >
      <div
        className="
          flex
          justify-between
          items-start
          gap-custom-16
        "
      >
        <div className="flex flex-col gap-y-1">
          <h1 className="text-body font-bold">
            {isWithdrawal ? "- " : "+ "}
            ₱
            {transaction.amount.toLocaleString()}
          </h1>

          <p className="text-xs text-white/70">
            {isWithdrawal
              ? transaction.payoutChannel
              : transaction.sourceAgent?.fullName}
          </p>
        </div>

        <div className="text-right flex flex-col gap-y-1">
          <p className="text-xs font-semibold">
            {transaction.transactionType}
          </p>

          {isWithdrawal && (
            <span className="text-[10px] bg-white/20 rounded px-2 py-1">
              {transaction.status}
            </span>
          )}

          <p className="text-[11px] text-white/70">
            {new Date(
              transaction.createdAt
            ).toLocaleDateString()}
          </p>
        </div>
      </div>

      {transaction.remarks && (
        <p
          className="
            text-xs
            text-white/80
            border-t
            border-white/10
            pt-2
          "
        >
          {transaction.remarks}
        </p>
      )}
    </div>
  );
};