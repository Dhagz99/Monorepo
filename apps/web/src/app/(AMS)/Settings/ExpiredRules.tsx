"use client";

import { useState } from "react";
import MainModal from "@/components/modal/mainModal";

import {
  updateExpiredRules,
  ExpiredSchema,
} from "@repo/shared";

import { CommissionRule } from "@repo/shared";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateCommissionRule } from "@/hooks/commission/useCommission";

interface Props {
  rules: CommissionRule[];
}

export default function ExpiredRules({
  rules,
}: Props) {
  const [openModal, setOpenModal] =
    useState(false);

  const expiredRule =
    rules.find(
      (rule) =>
        rule.agentStatus === "EXPIRED"
    );

  const form =
    useForm<ExpiredSchema>({
      resolver: zodResolver(
        updateExpiredRules
      ),

      defaultValues: {
        id: expiredRule?.id ?? "",
        piraRate:
          expiredRule?.piraRate ?? 0,
      },
    });

  const {
    mutateAsync: updateRule,
    isPending,
  } =
    useUpdateCommissionRule();

  const onSubmit = async (
    data: ExpiredSchema
  ) => {
    try {

      await updateRule({
        id: data.id,
        piraRate:
          data.piraRate,
      });

      setOpenModal(false);

    } catch (error) {
      console.error(error);
    }
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
            Expired Rules
          </h3>

          <p className="text-neutralPrimary">
            Configure expired agent
            commissions.
          </p>
        </div>

        <button
          onClick={() => {

            form.reset({
              id: expiredRule?.id ?? "",
              piraRate:
                expiredRule?.piraRate ?? 0,
            });

            setOpenModal(true);
          }}
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

      {expiredRule && (
        <div
          className="
            mt-custom-24
            border
            rounded-lg
            p-custom-16
          "
        >

          <div>
            PIRA Rate:
            {" "}
            {expiredRule.piraRate}%
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
              Update Expired Rule
            </h2>


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
              {
                isPending
                  ? "Saving..."
                  : "Save Changes"
              }
            </button>
          </form>
        </MainModal>
      )}
    </>
  );
}