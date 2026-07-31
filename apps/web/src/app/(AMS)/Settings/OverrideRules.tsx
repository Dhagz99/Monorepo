"use client";

import MainModal from "@/components/modal/mainModal";
import SweetAlert from "@/components/modal/Swal";
import { useCreateOverrideRule, useDeleteOverrideRule, useUpdateOverrideRule } from "@/hooks/general/useGeneral";

import {
  OverrideCommissionRule,
} from "@repo/shared";
import axios from "axios";

import {
  FormEvent,
  useState,
} from "react";

import Swal from "sweetalert2";

interface Props {
  rules: OverrideCommissionRule[];
}

type RuleFormState = {
  receiverLevel: string;
  sourceLevel: string;
  amount: string;
};

const emptyForm: RuleFormState = {
  receiverLevel: "",
  sourceLevel: "",
  amount: "",
};

export default function OverrideRules({
  rules,
}: Props) {
  const [
    openModal,
    setOpenModal,
  ] = useState(false);

  const [
    selectedRule,
    setSelectedRule,
  ] =
    useState<OverrideCommissionRule | null>(
      null
    );

  const [
    form,
    setForm,
  ] =
    useState<RuleFormState>(
      emptyForm
    );

  const {
    mutateAsync:
      createRule,
    isPending:
      isCreating,
  } =
    useCreateOverrideRule();

  const {
    mutateAsync:
      updateRule,
    isPending:
      isUpdating,
  } =
    useUpdateOverrideRule();

  const {
    mutateAsync:
      deleteRule,
    isPending:
      isDeleting,
  } =
    useDeleteOverrideRule();

  const isSaving =
    isCreating ||
    isUpdating;

  const closeModal = () => {
    if (isSaving) {
      return;
    }

    setOpenModal(false);
    setSelectedRule(null);
    setForm(emptyForm);
  };

  const handleAdd = () => {
    setSelectedRule(null);
    setForm(emptyForm);
    setOpenModal(true);
  };

  const handleEdit = (
    rule: OverrideCommissionRule
  ) => {
    setSelectedRule(rule);

    setForm({
      receiverLevel:
        rule.receiverLevel,

      sourceLevel:
        rule.sourceLevel,

      amount:
        String(rule.amount),
    });

    setOpenModal(true);
  };

  const handleSave = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const amount =
      Number(form.amount);

    if (
      !form.receiverLevel ||
      !form.sourceLevel
    ) {
      SweetAlert.errorAlert(
        "Invalid Form",
        "Receiver level and source level are required."
      );

      return;
    }

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      SweetAlert.errorAlert(
        "Invalid Amount",
        "Override amount must be greater than zero."
      );

      return;
    }

    try {
      SweetAlert.loadingAlert(
        selectedRule
          ? "Updating Rule"
          : "Creating Rule"
      );

      if (selectedRule) {
        await updateRule({
          id:
            selectedRule.id,

          receiverLevel:
            form.receiverLevel,

          sourceLevel:
            form.sourceLevel,

          amount,
        });
      } else {
        await createRule({
          receiverLevel:
            form.receiverLevel,

          sourceLevel:
            form.sourceLevel,

          amount,
        });
      }

      Swal.close();

      SweetAlert.successAlertFunction(
        "Success",
        selectedRule
          ? "Override rule updated successfully."
          : "Override rule created successfully.",
        () => {},
        closeModal
      );
    } catch (error: unknown) {
      Swal.close();

      let message =
        "Unable to save override rule.";

      if (axios.isAxiosError(error)) {
        message =
          error.response?.data?.message ??
          message;
      } else if (error instanceof Error) {
        message = error.message;
      }

      SweetAlert.errorAlert(
        "Save Failed",
        message
      );

    }
  };

  const handleDelete = (
    rule: OverrideCommissionRule
  ) => {
    SweetAlert.confirmationAlert(
      "Delete Override Rule",
      `Delete the ${rule.receiverLevel} override from ${rule.sourceLevel}?`,

      async () => {
        try {
          SweetAlert.loadingAlert(
            "Deleting Rule"
          );

          await deleteRule(
            rule.id
          );

          Swal.close();

          SweetAlert.successAlert(
            "Deleted",
            "Override rule has been deleted successfully."
          );
        } catch (error: unknown) {
            Swal.close();

            let message =
              "Unable to delete override rule.";

            if (axios.isAxiosError(error)) {
              message =
                error.response?.data?.message ??
                message;
            } else if (error instanceof Error) {
              message = error.message;
            }

            SweetAlert.errorAlert(
              "Delete Failed",
              message
            );

            console.error(error);
          }
      }
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-mainPrimary">
            Override Rules
          </h3>

          <p className="text-neutralPrimary">
            Define a new override amount or adjust current settings.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="
            rounded-lg
            bg-positive
            px-custom-16
            py-custom-8
            text-white
            cursor-pointer
            transition
            duration-150
            ease-in-out
            hover:scale-105
          "
        >
          Add Rule
        </button>
      </div>

      <div className="mt-custom-24 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-white text-body">
            <tr className="text-neutralPrimary">
              <th className="px-custom-24 py-5 text-left font-semibold">
                Receiver
              </th>

              <th className="px-custom-24 py-5 text-left font-semibold">
                Source
              </th>

              <th className="px-custom-24 py-5 text-left font-semibold">
                Commission
              </th>

              <th className="px-custom-24 py-5 text-center font-semibold">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {rules.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="
                    px-6
                    py-10
                    text-center
                    text-neutralPrimary
                  "
                >
                  No override rules found.
                </td>
              </tr>
            ) : (
              rules.map(
                (rule) => (
                  <tr
                    key={
                      rule.id
                    }
                    className="
                      text-body
                      text-neutralPrimary
                      odd:bg-neutralLight
                    "
                  >
                    <td className="px-6 py-4 text-left font-semibold">
                      {
                        rule.receiverLevel
                      }
                    </td>

                    <td className="px-6 py-4 text-left font-semibold">
                      {
                        rule.sourceLevel
                      }
                    </td>

                    <td className="px-6 py-4 text-left font-semibold">
                      ₱
                      {Number(
                        rule.amount
                      ).toLocaleString(
                        "en-PH",
                        {
                          minimumFractionDigits:
                            2,

                          maximumFractionDigits:
                            2,
                        }
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(
                              rule
                            )
                          }
                          disabled={
                            isDeleting
                          }
                          className="
                            rounded-lg
                            bg-secondary
                            px-custom-16
                            py-custom-8
                            text-xs
                            font-semibold
                            text-white
                            cursor-pointer
                            hover:opacity-90
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                          "
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              rule
                            )
                          }
                          disabled={
                            isDeleting
                          }
                          className="
                            rounded-lg
                            bg-negative
                            px-custom-16
                            py-custom-8
                            text-xs
                            font-semibold
                            text-white
                            cursor-pointer
                            hover:opacity-90
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                          "
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>

      {openModal && (
        <MainModal
          size="sm"
          onClose={
            closeModal
          }
        >
          <form
            onSubmit={
              handleSave
            }
            className="
              flex
              flex-col
              gap-custom-16
              p-custom-24
            "
          >
            <h2 className="text-mdHeader font-bold text-mainPrimary">
              {selectedRule
                ? "Edit Override Rule"
                : "Add Override Rule"}
            </h2>

            <div>
              <label
                htmlFor="receiverLevel"
                className="mb-2 block font-semibold"
              >
                Receiver Level
              </label>

              <select
                id="receiverLevel"
                value={
                  form.receiverLevel
                }
                onChange={(
                  event
                ) =>
                  setForm(
                    (
                      current
                    ) => ({
                      ...current,

                      receiverLevel:
                        event
                          .target
                          .value,
                    })
                  )
                }
                className="
                  w-full
                  rounded-lg
                  border
                  border-neutralMed
                  bg-white
                  px-custom-16
                  py-3
                "
              >
                <option value="">
                  Select Receiver Level
                </option>

                <option value="L1">
                  L1
                </option>

                <option value="L2">
                  L2
                </option>

                <option value="L3">
                  L3
                </option>
              </select>
            </div>

            <div>
              <label
                htmlFor="sourceLevel"
                className="mb-2 block font-semibold"
              >
                Source Level
              </label>

              <select
                id="sourceLevel"
                value={
                  form.sourceLevel
                }
                onChange={(
                  event
                ) =>
                  setForm(
                    (
                      current
                    ) => ({
                      ...current,

                      sourceLevel:
                        event
                          .target
                          .value,
                    })
                  )
                }
                className="
                  w-full
                  rounded-lg
                  border
                  border-neutralMed
                  bg-white
                  px-custom-16
                  py-3
                "
              >
                <option value="">
                  Select Source Level
                </option>

                <option value="L1">
                  L1
                </option>

                <option value="L2">
                  L2
                </option>

                <option value="L3">
                  L3
                </option>
              </select>
            </div>

            <div>
              <label
                htmlFor="amount"
                className="mb-2 block font-semibold"
              >
                Override Amount
              </label>

              <input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                value={
                  form.amount
                }
                onChange={(
                  event
                ) =>
                  setForm(
                    (
                      current
                    ) => ({
                      ...current,

                      amount:
                        event
                          .target
                          .value,
                    })
                  )
                }
                placeholder="Enter override amount"
                className="
                  w-full
                  rounded-lg
                  border
                  border-neutralMed
                  px-custom-16
                  py-3
                "
              />
            </div>

            <div className="mt-2 flex gap-3">
              <button
                type="button"
                onClick={
                  closeModal
                }
                disabled={
                  isSaving
                }
                className="
                  flex-1
                  rounded-lg
                  border
                  border-neutralMed
                  py-3
                  font-semibold
                  text-neutralPrimary
                  cursor-pointer
                  hover:bg-neutralLight
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  isSaving
                }
                className="
                  flex-1
                  rounded-lg
                  bg-mainPrimary
                  py-3
                  font-semibold
                  text-white
                  cursor-pointer
                  hover:opacity-90
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {isSaving
                  ? "Saving..."
                  : selectedRule
                    ? "Update"
                    : "Save"}
              </button>
            </div>
          </form>
        </MainModal>
      )}
    </div>
  );
}