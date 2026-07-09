export interface CreateWithdrawalRequestPayload {
  amount: number;
  payoutChannel: "GCASH" | "MAYA" | "BANK";
  accountName: string;
  accountNumber: string;
}
export interface RejectFailedWithdrawalPayload {
  withdrawalId: string;
  remarks?: string;
}

export interface CreateWithdrawalRequestResponse {
  id: string;
  amount: number;
  payoutChannel: string;
  accountName: string;
  accountNumber: string;
  status: string;
  requestedAt: string;
}