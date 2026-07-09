// app/(AGENT)/reactivation/payment-success/page.tsx

"use client";

import { useSearchParams, useRouter } from "next/navigation";

export default function ReactivationPaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const requestId = searchParams.get("requestId");

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-custom-24">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-custom-24 flex flex-col gap-y-custom-16 text-center">
        <h1 className="text-tertiaryHeader font-bold text-positive">
          Payment Successful
        </h1>

        <p className="text-neutralPrimary text-sm">
          Your payment was received by Xendit. Please wait while your account is confirmed through the webhook.
        </p>

        {requestId && (
          <p className="text-xs text-neutralPrimary break-all">
            Request ID: {requestId}
          </p>
        )}

        <button
          onClick={() => router.push("/Profile")}
          className="w-full bg-mainPrimary text-white py-custom-8 rounded-lg font-bold cursor-pointer hover:bg-lightPrimary"
        >
          Back to Profile
        </button>
      </div>
    </div>
  );
}