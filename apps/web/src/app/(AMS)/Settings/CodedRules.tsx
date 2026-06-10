"use client";

import { useState } from "react";
import MainModal from "@/components/modal/mainModal";

import {
  CodedSchema,
  updateCodedRules,
} from "@repo/shared";

import { CommissionRule } from "@repo/shared";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateCommissionRule } from "@/hooks/commission/useCommission";

interface Props {
  rules: CommissionRule[];
}

export default function CodedRules({
  rules,
}: Props) {
  const [openModal, setOpenModal] =
    useState(false);

  const CodedRule =
    rules.find(
      (rule) =>
        rule.agentStatus === "ACTIVE"
    );

  const form =
    useForm<CodedSchema>({
      resolver: zodResolver(
        updateCodedRules
      ),

      defaultValues: {
        id: CodedRule?.id,
        sspAmount: Number(
          CodedRule?.sspAmount ?? 0
        ),

        piraRate:
          CodedRule?.piraRate ?? 0,
      },
    });

    const {
        mutateAsync:
          updateRule,
        isPending,
      } =
        useUpdateCommissionRule();

  const onSubmit = async (
    data: CodedSchema
  ) => {

    await updateRule({
      id: data.id,

      sspAmount:
        data.sspAmount,

      piraRate:
        data.piraRate,
    });

    setOpenModal(false);
  };

  return (
    <>
      <div className="flex justify-between items-center">

        <div>
          <h3
            className="
              font-bold
              text-mainPrimary
            "
          >
            Coded Rules
          </h3>

          <p className="text-neutralPrimary">
            Configure Coded agent
            commissions.
          </p>
        </div>

        <button
          onClick={() =>
            setOpenModal(true)
          }
          className="
            bg-secondary
            cursor-pointer
            hover:scale-105
            ease-in-out
            duration-150
            text-white
            px-custom-16
            py-custom-8
            rounded-lg
          "
        >
          Edit Rule
        </button>

      </div>

      {CodedRule && (
        <div
          className="
            mt-custom-24
            border
            rounded-lg
            p-custom-16
          "
        >
          <div>
            SSP Amount:
            {" "}
            ₱
            {Number(
              CodedRule.sspAmount
            ).toLocaleString()}
          </div>

          <div>
            PIRA Rate:
            {" "}
            {CodedRule.piraRate}%
          </div>
        </div>
      )}

      {openModal && (
        <MainModal
          size="md"
          onClose={() =>
            setOpenModal(false)
          }
        >
          <form
            onSubmit={form.handleSubmit(
              onSubmit
            )}
            className="
              flex
              flex-col
              gap-custom-16
              p-custom-24
            "
          >
            <h2
              className="
                text-mdHeader
                font-bold
                text-mainPrimary
              "
            >
              Update Coded Rule
            </h2>

            <div className="flex flex-col gap-y-custom-8">
              <label className="font-bold text-xs">
                SSP Amount
              </label>

              <input
                type="number"
                step="0.01"
                className="
                  bg-neutralLight
                  border
                  border-neutralMed
                  py-3
                  px-custom-16
                  rounded-lg
                "
                {...form.register("sspAmount", {
                  valueAsNumber: true,
                })}
              />
            </div>

            <div className="flex flex-col gap-y-custom-8">
              <label className="font-bold text-xs">
                PIRA Rate (%)
              </label>

              <input
                type="number"
                className="
                  bg-neutralLight
                  border
                  border-neutralMed
                  py-3
                  px-custom-16
                  rounded-lg
                "
                {...form.register("piraRate", {
                  valueAsNumber: true,
                })}
              />
            </div>

        <button
            type="submit"
            disabled={isPending}
            className="
              bg-mainPrimary
              text-white
              py-3
              rounded-lg
              font-bold
              disabled:opacity-50
            "
          >
            {isPending ? "Saving..." : "Save Changes"}
          </button>
          </form>
        </MainModal>
      )}
    </>
  );
}