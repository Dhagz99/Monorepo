"use client";

import MainModal from "@/components/modal/mainModal";
import SweetAlert from "@/components/modal/Swal";
import { OverrideCommissionRule } from "@repo/shared";
import { useState } from "react";
import Swal from "sweetalert2";

interface Props {
  rules: OverrideCommissionRule[];
}

export default function OverrideRules({
  rules,
}: Props) {

  const [openModal, setOpenModal] =
    useState(false);

  const [selectedRule, setSelectedRule] =
    useState<OverrideCommissionRule | null>(
      null
    );

  const handleSave = async () => {

    try {

      SweetAlert.loadingAlert(
        selectedRule
          ? "Updating Rule"
          : "Creating Rule"
      );

      if (selectedRule) {

        // await updateOverrideRule({
        //   id: selectedRule.id,
        //   receiverLevel,
        //   sourceLevel,
        //   amount,
        // });

      } else {

        // await createOverrideRule({
        //   receiverLevel,
        //   sourceLevel,
        //   amount,
        // });

      }

      Swal.close();

      SweetAlert.successAlertFunction(
        "Success",
        selectedRule
          ? "Override rule updated successfully."
          : "Override rule created successfully.",
        () => {},
        () => {
          setOpenModal(false);
          setSelectedRule(null);
        }
      );

    } catch (error) {

      Swal.close();

      SweetAlert.errorAlert(
        "Save Failed",
        "Unable to save override rule."
      );

      console.error(error);
    }
  };

  const handleDelete = (
    id: string
  ) => {

    SweetAlert.confirmationAlert(
      "Delete Override Rule",
      "Are you sure you want to delete this override rule?",

      async () => {

        try {

          SweetAlert.loadingAlert(
            "Deleting Rule"
          );

          // await deleteOverrideRule({
          //   id
          // });

          Swal.close();

          SweetAlert.successAlert(
            "Deleted",
            "Override rule has been deleted successfully."
          );

        } catch (error) {

          Swal.close();

          SweetAlert.errorAlert(
            "Delete Failed",
            "Unable to delete override rule."
          );

          console.error(error);
        }
      }
    );
  };

  return (
    <div>

      {/* HEADER */}
      <div className="flex justify-between items-center">

        <div>

          <h3
            className="
              font-bold
              text-mainPrimary
            "
          >
            Override Rules
          </h3>

          <p className="text-neutralPrimary">
            Define a new override amount or adjust current settings.
          </p>

        </div>

        <button
          onClick={() => {

            setSelectedRule(null);

            setOpenModal(true);

          }}
          className="
            bg-positive
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
          Add Rule
        </button>

      </div>

      {/* TABLE */}
      <table
        className="
          w-full
          border-collapse
          mt-custom-24
        "
      >

        <thead
          className="
            bg-white
            text-body
          "
        >
          <tr
            className="
              text-neutralPrimary
            "
          >

            <th
              className="
                text-left
                px-custom-24
                py-5
                font-semibold
              "
            >
              Receiver
            </th>

            <th
              className="
                text-left
                px-custom-24
                py-5
                font-semibold
              "
            >
              Source
            </th>

            <th
              className="
                text-left
                px-custom-24
                py-5
                font-semibold
              "
            >
              Commission
            </th>

            <th
              className="
                text-center
                px-custom-24
                py-5
                font-semibold
              "
            >
              Action
            </th>

          </tr>
        </thead>

        <tbody>

          {rules.map((rule) => (

            <tr
              key={rule.id}
              className="
                text-neutralPrimary
                text-body
                odd:bg-neutralLight
              "
            >

              <td
                className="
                  text-left
                  px-6
                  py-4
                  font-semibold
                "
              >
                {rule.receiverLevel}
              </td>

              <td
                className="
                  text-left
                  px-6
                  py-4
                  font-semibold
                "
              >
                {rule.sourceLevel}
              </td>

              <td
                className="
                  text-left
                  px-6
                  py-4
                  font-semibold
                "
              >
                ₱
                {Number(
                  rule.amount
                ).toLocaleString()}
              </td>

              <td
                className="
                  px-6
                  py-4
                "
              >

                <div
                  className="
                    flex
                    justify-center
                    gap-2
                  "
                >

                  <button
                    type="button"
                    onClick={() =>
                      handleSave()
                    }
                    className="
                      bg-secondary
                      px-custom-16
                      py-custom-8
                      rounded-lg
                      text-xs
                      font-semibold
                      text-white
                      cursor-pointer
                      hover:opacity-90
                    "
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(
                        rule.id
                      )
                    }
                    className="
                      bg-negative
                      px-custom-16
                      py-custom-8
                      rounded-lg
                      text-xs
                      font-semibold
                      text-white
                      cursor-pointer
                      hover:opacity-90
                    "
                  >
                    Delete
                  </button>

                </div>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

      {/* MODAL */}
      {openModal && (

        <MainModal
          size="sm"
          onClose={() => {

            setOpenModal(false);

            setSelectedRule(null);

          }}
        >

          <div
            className="
              p-custom-24
              flex
              flex-col
              gap-custom-16
            "
          >

            <h2
              className="
                text-mdHeader
                font-bold
                text-mainPrimary
              "
            >
              {selectedRule
                ? "Edit Override Rule"
                : "Add Override Rule"}
            </h2>

            <div>

              <label
                className="
                  block
                  mb-2
                  font-semibold
                "
              >
                Receiver Level
              </label>

              <select
                defaultValue={
                  selectedRule?.receiverLevel ?? ""
                }
                className="
                  w-full
                  border
                  border-neutralMed
                  rounded-lg
                  px-custom-16
                  py-3
                  bg-white
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
                className="
                  block
                  mb-2
                  font-semibold
                "
              >
                Source Level
              </label>

              <select
                defaultValue={
                  selectedRule?.sourceLevel ?? ""
                }
                className="
                  w-full
                  border
                  border-neutralMed
                  rounded-lg
                  px-custom-16
                  py-3
                  bg-white
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
                className="
                  block
                  mb-2
                  font-semibold
                "
              >
                Override Amount
              </label>

              <input
                type="number"
                defaultValue={
                  selectedRule?.amount ?? 0
                }
                className="
                  w-full
                  border
                  border-neutralMed
                  rounded-lg
                  px-custom-16
                  py-3
                "
              />

            </div>

            <button
              className="
                bg-mainPrimary
                text-white
                py-3
                rounded-lg
                font-semibold
              "
            >
              Save
            </button>

          </div>

        </MainModal>

      )}

    </div>
  );
}