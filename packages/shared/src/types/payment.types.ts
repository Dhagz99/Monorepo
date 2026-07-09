
export interface CreatePaymentSessionPayload {
  referenceId: string;
  amount: number;
  customer: {
    id: string;
    fullName: string;
    email?: string | null;
  };
  successUrl: string;
  cancelUrl: string;
};



export interface CreateReactivationPaymentPayload {
  requestId: string;
}

export interface CreateReactivationPaymentResponse {
  requestId: string;
  paymentId: string;
  checkoutUrl: string | null;
  alreadyPaid: boolean;
  message: string;
}