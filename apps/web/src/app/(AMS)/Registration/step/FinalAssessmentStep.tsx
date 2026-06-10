"use client";

import {
  RegisterAgentSchema,
} from "@repo/shared";

import QRCode from "react-qr-code";

import Swal from "sweetalert2";
import SweetAlert from "@/components/modal/Swal";

import {
  UseFormHandleSubmit,
} from "react-hook-form";

import { useRegisterAgent } from "@/hooks/agents/useAgent";
import { getErrorMessage } from "@/components/helper/errorHelper";

type Props = {
  watchedValues:
    Partial<RegisterAgentSchema>;

  handleSubmit:
    UseFormHandleSubmit<RegisterAgentSchema>;
};

export default function FinalAssessmentStep({
  watchedValues,
  handleSubmit,
}: Props) {

  const registerMutation =
    useRegisterAgent();


  const onSubmit = async (
    data: RegisterAgentSchema
  ) => {

    try {

      SweetAlert.loadingAlert(
        "Registering Agent",
        "Please wait..."
      );

      const result =
        await registerMutation.mutateAsync(
          data
        );

      console.log(result);

      Swal.close();

      await SweetAlert.successAlert(
        "Success",
        "Agent registered successfully"
      );

    } catch (error: unknown) {

      console.log(error);

      Swal.close();

      SweetAlert.errorAlert(
        "Registration Failed",
        getErrorMessage(error)
      );
    }
  };


  return (
    <form
         onSubmit={handleSubmit(
        onSubmit
      )}
        className="flex flex-col gap-custom-32"
      >

        
        {/* HEADER */}
        <div className="flex flex-col gap-2">
          <h1 className="text-mdHeader font-bold text-darkPrimary">
            Final Assessment
          </h1>

          <p className="text-neutralPrimary text-sm">
            Review all information before
            submitting the application.
          </p>
        </div>

        {/* MAIN CONTAINER */}
        <div
          className="
            bg-white
            border
            border-neutralMed
            rounded-2xl
            p-custom-24
            md:p-custom-32
            flex
            flex-col
            gap-custom-32
            shadow-sm
          "
        >

          {/* TOP SECTION */}
          <div
            className="
              grid
              grid-cols-1
              xl:grid-cols-4
              gap-custom-24
            "
          >

            {/* QR CARD */}
            <div
              className="
                bg-neutralLight
                rounded-2xl
                border
                border-neutralMed
                p-custom-24
                flex
                flex-col
                items-center
                justify-center
                gap-custom-16
              "
            >
              {/* {watchedValues.agentAccType === "CODED" ? ( */}
              <QRCode
                value={
                  watchedValues.agentQrCode || ""
                }
                size={180}
              />
              {/* ):(
                  <h1
                  className="
                    text-mdHeader
                    font-bold
                    text-neutralPrimary
                    uppercase
                    tracking-widest
                  "
                >
                  Uncoded
                </h1>

              )} */}
              <div className="text-center">

                <p className="text-xs text-neutralPrimary">
                  Agent QR Code
                </p>

                <p
                  className="
                    text-sm
                    font-semibold
                    text-mainPrimary
                    break-all
                    mt-2
                  "
                >
                  {
                    watchedValues.agentQrCode
                  }
                </p>

              </div>
            </div>
            

            {/* PROFILE INFO */}
            <div
              className="
                xl:col-span-3
                grid
                grid-cols-1
                md:grid-cols-2
                gap-custom-24
              "
            >

              {/* NAME */}
              <div
                className="
                  bg-neutralLight
                  rounded-xl
                  border
                  border-neutralMed
                  p-custom-24
                  flex
                  flex-col
                  justify-center
                  min-h-16
                "
              >

                <p className="text-sm text-neutralPrimary capitalize">
                  Name
                </p>

                <h2
                  className="
                    text-tertiaryHeader
                    md:text-mdHeader
                    font-semibold
                    text-mainPrimary
                    mt-2
                  "
                >
                  {watchedValues.agentName || "-"}
                </h2>

              </div>

              {/* GENDER */}
              <div
                className="
                  bg-neutralLight
                  rounded-xl
                  border
                  border-neutralMed
                  p-custom-24
                  flex
                  flex-col
                  justify-center
                  min-h-16
                "
              >

                <p className="text-sm text-neutralPrimary">
                  Gender
                </p>

                <h2
                  className="
                    text-tertiaryHeader
                    md:text-mdHeader
                    font-semibold
                    text-mainPrimary
                    mt-2
                  "
                >
                  {
                    watchedValues.agentGender ||
                    "-"
                  }
                </h2>

              </div>

              {/* DOB */}
              <div
                className="
                  md:col-span-2
                  bg-neutralLight
                  rounded-xl
                  border
                  border-neutralMed
                  p-custom-24
                  flex
                  flex-col
                  justify-center
                  min-h-16
                "
              >

                <p className="text-sm text-neutralPrimary">
                  Date of Birth
                </p>

                <h2
                  className="
                    text-tertiaryHeader
                    md:text-mdHeader
                    font-semibold
                    text-mainPrimary
                    mt-2
                  "
                >
                  {watchedValues.dateBirth
                    ? new Date(
                        watchedValues.dateBirth
                      ).toLocaleDateString()
                    : "-"}
                </h2>

              </div>

            </div>
          </div>


          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              xl:grid-cols-3
              gap-custom-24
            "
          >

            {/* EMAIL */}
            <div
              className="
                bg-neutralLight
                border
                border-neutralMed
                rounded-xl
                p-custom-16
              "
            >

              <p className="text-sm text-neutralPrimary">
                Email
              </p>

              <h2
                className="
                  text-tertiaryHeader
                  font-semibold
                  text-mainPrimary
                  mt-2
                  break-all
                "
              >
                {watchedValues.email || "-"}
              </h2>

            </div>

            {/* CONTACT */}
            <div
              className="
                bg-neutralLight
                border
                border-neutralMed
                rounded-xl
                p-custom-16
              "
            >

              <p className="text-sm text-neutralPrimary">
                Contact
              </p>

              <h2
                className="
                  text-tertiaryHeader
                  font-semibold
                  text-mainPrimary
                  mt-2
                "
              >
                {watchedValues.agentTel || "-"}
              </h2>

            </div>

            {/* USERNAME */}
            <div
              className="
                xl:col-span-1
                sm:col-span-2
                bg-neutralLight
                border
                border-neutralMed
                rounded-xl
                p-custom-16
              "
            >

              <p className="text-sm text-neutralPrimary">
                Username
              </p>

              <h2
                className="
                  text-tertiaryHeader
                  font-semibold
                  text-mainPrimary
                  mt-2
                "
              >
                {watchedValues.username || "-"}
              </h2>

            </div>

          </div>

          {/* UPLINE */}
          {watchedValues.parentAgentId && (
            <div
              className="
                grid
                grid-cols-1
                md:grid-cols-3
                gap-custom-24
              "
            >

              {/* UPLINE AGENT */}
              <div
                className="
                  md:col-span-2
                  bg-neutralLight
                  border
                  border-neutralMed
                  rounded-xl
                  p-custom-16
                "
              >

                <p className="text-sm text-neutralPrimary">
                  Upline Agent
                </p>

                <h2
                  className="
                    text-tertiaryHeader
                    font-semibold
                    text-mainPrimary
                    mt-2
                  "
                >
                  {
                    watchedValues.parentAgentName
                  }
                </h2>

              </div>

              {/* UPLINE LEVEL */}
              <div
                className="
                  bg-neutralLight
                  border
                  border-neutralMed
                  rounded-xl
                  p-custom-16
                "
              >

                <p className="text-sm text-neutralPrimary">
                  Upline Level
                </p>

                <h2
                  className="
                    text-tertiaryHeader
                    font-semibold
                    text-mainPrimary
                    mt-2
                  "
                >
                  {
                    watchedValues.uplineLevel
                  }
                </h2>

              </div>

            </div>
          )}

          {/* BRANCHES + LEVEL */}
          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-3
              gap-custom-24
            "
          >

            {/* BRANCHES */}
            <div
              className="
                md:col-span-2
                bg-neutralLight
                border
                border-neutralMed
                rounded-xl
                p-custom-16
                flex
                flex-col
                gap-4
              "
            >

              <p className="text-sm text-neutralPrimary">
                Assigned Branches
              </p>

              <div className="flex flex-wrap gap-3">

                {watchedValues.branches &&
                watchedValues.branches.length >
                  0 ? (
                  watchedValues.branches.map(
                    (branch) => (
                      <div
                        key={
                          branch.branchCode
                        }
                        className="
                          px-4
                          py-2
                          rounded-full
                          bg-positive
                          text-white
                          text-sm
                          font-medium
                        "
                      >
                        {
                          branch.companyName
                        }
                      </div>
                    )
                  )
                ) : (
                  <span className="text-neutralPrimary">
                    -
                  </span>
                )}

              </div>
            </div>

            {/* LEVEL */}
            <div
              className="
                bg-neutralLight
                border
                border-neutralMed
                rounded-xl
                p-custom-16
              "
            >

              <p className="text-sm text-neutralPrimary">
                Assigned Level
              </p>

              <h2
                className="
                  text-tertiaryHeader
                  font-semibold
                  text-mainPrimary
                  mt-2
                "
              >
                {
                  watchedValues.selectedAgentLevel
                }
              </h2>

            </div>

          </div>

        </div>

        {/* SUBMIT */}
       <div className="sticky bottom-0 bg-neutralLight p-custom-16 rounded-lg w-full flex justify-end">

                <button
                  type="submit"
                  disabled={
                    registerMutation.isPending
                  }
                  className="
                    px-custom-32
                    py-custom-16
                    bg-mainPrimary
                    text-white
                    rounded-xl
                    hover:bg-lightPrimary
                    transition-all
                    font-semibold
                    shadow-sm
                    disabled:opacity-50
                    cursor-pointer
                    hover:scale-105
                    duration-150
                    ease-in-out
                  "
                >

                  {registerMutation.isPending
                    ? "Submitting..."
                    : "Submit Application"}

                </button>

              </div>
      </form>
  );
}