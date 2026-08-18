import { formatMoney } from "@/app/(AMS)/Reports/helper/moneyFormat.helper";
import { BranchCommissionReportResponse } from "@repo/shared";

export default function BranchReportTable({
  rows,
}: {
  rows: BranchCommissionReportResponse[];
}) {
  return (
    <table className="w-full border-collapse text-xs">
      <thead>
        <tr className="text-darkPrimary">
          <th className="border border-darkPrimary p-2 text-left">
            Branch
          </th>

          <th className="border border-darkPrimary p-2 text-left">
            Location
          </th>

          <th className="border border-darkPrimary p-2">
            Transactions
          </th>

          <th className="border border-darkPrimary p-2 text-right">
            Sales
          </th>

          <th className="border border-darkPrimary p-2 text-right">
            Direct Comm.
          </th>

          <th className="border border-darkPrimary p-2 text-right">
            Downline Comm.
          </th>

          <th className="border border-darkPrimary p-2 text-right">
            Total Comm.
          </th>
        </tr>
      </thead>

      <tbody>
        {rows.map((branch) => (
          <tr key={branch.branchCode}>
            <td className="border border-darkPrimary p-2">
              {branch.companyName ??
                branch.branchCode}
            </td>

            <td className="border border-darkPrimary p-2">
              {branch.location ?? "-"}
            </td>

            <td className="border border-darkPrimary p-2 text-center">
              {branch.transactions}
            </td>

            <td className="border border-darkPrimary p-2 text-right">
              {formatMoney(
                branch.totalSales
              )}
            </td>

            <td className="border border-darkPrimary p-2 text-right">
              {formatMoney(
                branch.totalDirectCommission
              )}
            </td>

            <td className="border border-darkPrimary p-2 text-right">
              {formatMoney(
                branch.totalDownlineCommission
              )}
            </td>

            <td className="border border-darkPrimary p-2 text-right font-bold">
              {formatMoney(
                branch.totalCommission
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}