import { formatMoney } from "@/app/(AMS)/Reports/helper/moneyFormat.helper";
import { AgentCommissionReportResponse } from "@repo/shared";

export default function AgentReportTable({
  rows,
}: {
  rows: AgentCommissionReportResponse[];
}) {
  return (
    <table className="w-full border-collapse text-xs">
      <thead>
        <tr  className="text-darkPrimary">
          <th className="border border-darkPrimary p-2 text-left">
            Agent
          </th>

          <th className="border border-darkPrimary p-2">
            Level
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
            Override L2
          </th>

          <th className="border border-darkPrimary p-2 text-right">
            Override L3
          </th>

          <th className="border border-darkPrimary p-2 text-right">
            Total Comm.
          </th>
        </tr>
      </thead>

      <tbody>
        {rows.map((agent) => (
          <tr key={agent.agentId}>
            <td className="border border-darkPrimary p-2">
              {agent.fullName}
            </td>

            <td className="border border-darkPrimary p-2 text-center">
              {agent.level}
            </td>

            <td className="border border-darkPrimary p-2 text-center">
              {agent.transactions}
            </td>

            <td className="border border-darkPrimary p-2 text-right">
              {formatMoney(
                agent.personalSales
              )}
            </td>

            <td className="border border-darkPrimary p-2 text-right">
              {formatMoney(
                agent.directComm
              )}
            </td>

            <td className="border border-darkPrimary p-2 text-right">
              {formatMoney(
                agent.overrideFromL2
              )}
            </td>

            <td className="border border-darkPrimary p-2 text-right">
              {formatMoney(
                agent.overrideFromL3
              )}
            </td>

            <td className="border border-darkPrimary p-2 text-right font-bold">
              {formatMoney(
                agent.totalComm
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}