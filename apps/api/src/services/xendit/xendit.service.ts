import { CreatePaymentSessionPayload } from "@repo/shared";
import { xenditConfig } from "../../config/xendit.config";

export const createXenditPaymentSession = async (
  payload: CreatePaymentSessionPayload
) => {
  const response = await fetch(`${xenditConfig.apiUrl}/sessions`, {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(`${xenditConfig.secretKey}:`).toString("base64"),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      reference_id: payload.referenceId,
      session_type: "PAY",
      mode: "PAYMENT_LINK",
      amount: payload.amount,
      currency: "PHP",
      country: "PH",

      customer: {
        // important: unique per payment session to avoid Xendit duplicate customer reference error
        reference_id: `customer_${payload.referenceId}`,
        type: "INDIVIDUAL",
        email: payload.customer.email ?? undefined,
        individual_detail: {
          given_names: payload.customer.fullName,
        },
      },

      success_return_url: payload.successUrl,
      cancel_return_url: payload.cancelUrl,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Xendit create payment session error:", data);

    throw new Error(
      data?.message ?? "Failed to create Xendit payment session."
    );
  }

  return data;
};



export const createXenditDisbursement = async (payload: {
  externalId: string;
  amount: number;
  channelCode: string;
  accountName: string;
  accountNumber: string;
  description: string;
}) => {
  const body = {
    reference_id: payload.externalId,
    channel_code: payload.channelCode,
    currency: "PHP",
    amount: payload.amount,
    description: payload.description,
    channel_properties: {
      account_holder_name: payload.accountName,
      account_number: payload.accountNumber,
    },
  };

  console.log("Xendit payout request:", body);

  const response = await fetch(
    `${xenditConfig.apiUrl}/v2/payouts`,
    {
      method: "POST",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(`${xenditConfig.secretKey}:`).toString("base64"),
        "Content-Type": "application/json",
        "Idempotency-key": payload.externalId,
      },
      body: JSON.stringify(body),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error(
      "Xendit payout error:",
      JSON.stringify(data, null, 2)
    );

    const errorMessages =
      data?.errors
        ?.map((err: any) =>
          `${err.field?.join(".")}: ${err.messages?.join(", ")}`
        )
        .join(" | ");

    throw new Error(
      errorMessages ||
        data?.message ||
        "Failed to create Xendit payout."
    );
  }

  return data;
};