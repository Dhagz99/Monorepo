"use client"

import { useDroppedorSuspendedAgentStatus, useMasterlistAgents } from "@/hooks/agents/useAgent";
// import SweetAlert from "@/components/modal/Swal";
// import Swal from "sweetalert2";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Inspect,
  Trash,
} from "lucide-react";
import ModuleHeader from "@/components/ui/commonUi/page.header";
import QRCode from "react-qr-code";
import SweetAlert from "@/components/modal/Swal";
import Swal from "sweetalert2";

export default function Masterlist() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page =
    Number(searchParams.get("page")) || 1;

  const search =
    searchParams.get("search") || "";

  const {
    data,
    isLoading,
  } = useMasterlistAgents({
    page,
    search,
    status: "PENDING",
  });

  const updateQueryParams = (
    key: string,
    value: string | number
  ) => {

    const params =
      new URLSearchParams(
        searchParams.toString()
      );

    params.set(key, String(value));

    router.replace(
      `/Agents?${params.toString()}`
    );
  };



  const [openDropdown, setOpenDropdown] =
  useState<string | null>(null);
  const updateStatusMutation = useDroppedorSuspendedAgentStatus();
const handleRemoveAgent = async (
  agentId: string,
  status: "DROPPED" | "SUSPENDED"
) => {

  const action =
    status === "DROPPED"
      ? "Drop"
      : "Suspend";

  SweetAlert.confirmationAlert(
    `${action} Agent`,
    `Are you sure you want to ${action.toLowerCase()} this agent?`,
    async () => {

      try {

        SweetAlert.loadingAlert(
          `${action}ing Agent`,
          "Please wait..."
        );

        await updateStatusMutation.mutateAsync({
          agentId,
          status,
        });

        Swal.close();

        await SweetAlert.successAlert(
          `${action} Successful`,
          `Agent ${action.toLowerCase()}d successfully`
        );

      } catch (error) {

        console.error(error);

        Swal.close();

        SweetAlert.errorAlert(
          `${action} Failed`,
          "Something went wrong."
        );
      }
    }
  );
};


    
  return (
     <div className="w-full flex flex-col gap-y-custom-32 px-custom-32 py-custom-48">
    
          <div className="flex justify-between">
              <ModuleHeader
                title="Agent"
                subtitle="Masterlist"
              />
              <div className="w-full flex justify-end">

              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => {

                  const value = e.target.value;

                  const params =
                    new URLSearchParams(
                      searchParams.toString()
                    );

                  params.set("search", value);
                  params.set("page", "1");

                  router.replace(
                    `/Agents?${params.toString()}`
                  );
                }}
                className="
                  max-w-80
                  min-w-80
                  h-custom-48
                  rounded-md
                  border
                  border-slate-300
                  px-4
                  outline-none
                  focus:ring-1
                  focus:ring-mainPrimary
                  focus:border-mainPrimary
                  transition
                  shadow-sm
                "
              />

            </div>
        </div>

    <div
      className="
        w-full
        flex
        flex-col
        gap-y-custom-32
      "
    >



      {/* TABLE */}
      <div className="bg-white shadow-sm rounded-xl overflow-hidden">

        <table className="w-full border-collapse">

          <thead className="bg-white text-tertiaryHeader">

            <tr className="text-neutralPrimary">

              <th className="text-left px-custom-24 py-5 font-semibold">
                QR-ID
              </th>

              <th className="text-left px-custom-24 py-5 font-semibold">
                Fullname
              </th>

              <th className="text-left px-custom-24 py-5 font-semibold">
                Level
              </th>

              <th className="text-left px-custom-24 py-5 font-semibold">
                Status
              </th>

              <th className="text-left px-custom-24 py-5 font-semibold">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {/* LOADING */}
            {isLoading && (
              <tr>

                <td
                  colSpan={5}
                  className="text-center py-10"
                >
                  Loading...
                </td>

              </tr>
            )}

            {/* EMPTY */}
            {!isLoading &&
              data?.data.length === 0 && (
                <tr>

                  <td
                    colSpan={5}
                    className="
                      text-center
                      py-10
                      text-neutralPrimary
                    "
                  >
                    No pending agents found.
                  </td>

                </tr>
              )}

            {/* DATA */}
            {!isLoading &&
              data?.data.map(
                (agent, index) => (

                  <tr
                    key={index}
                    className="
                      text-neutralPrimary
                      text-body
                      odd:bg-neutralLight
                    "
                  >

                    {/* DATE */}
                    <td className="text-left px-6 py-4 font-semibold">

                      <QRCode
                        value={agent.agentCode || ""}
                        size={50}
                      />
                     
                    
                    </td>

                    {/* NAME */}
                    <td className="text-left px-6 py-4 font-semibold">

                      {agent.fullName}

                    </td>

                    {/* LEVEL */}
                    <td className="text-left px-6 py-4 font-semibold">

                      {agent.level}

                    </td>

                       
                    <td className="text-left px-6 py-4">
                      <span
                        className={`
                          inline-flex items-center justify-center
                          w-fit
                          rounded-md
                          px-custom-16 py-1
                          text-xs font-semibold text-white
                          ${
                            agent.status === "ACTIVE"
                              ? "bg-positive"
                              : agent.status === "EXPIRED"
                              ? "bg-negative"
                              : agent.status === "DROPPED"
                              ? "bg-darkPrimary"
                              : agent.status === "SUSPENDED"
                              ? "bg-secondary"
                             
                              : "bg-mainPrimary"



                          }
                        `}
                      >
                        {agent.status}
                      </span>
                    </td>

                    <td className="text-left px-6 py-4">

                    <div className="flex items-center gap-3">


                        <button
                        title="Edit Details"
                        onClick={() =>
                            console.log(agent.id)
                        }
                        className="
                            px-custom-8
                            py-custom-8
                            rounded-xl
                            bg-secondary
                            hover:bg-amber-500
                            cursor-pointer
                            text-white
                            inline-flex
                            items-end
                            gap-custom-8
                            text-xs
                            font-semibold
                            transition
                        "
                        >
                        <Edit size={20}/>
                        </button>


                        <button
                          title="View Details"
                          onClick={() =>
                            router.push(`/Agents/profile/${agent.id}`)
                          }
                          className="
                            px-custom-8
                            py-custom-8
                            rounded-xl
                            bg-lightPrimary
                            hover:bg-mainPrimary
                            cursor-pointer
                            text-white
                            inline-flex
                            items-end
                            gap-custom-8
                            text-xs
                            font-semibold
                            transition
                          "
                        >
                          <Inspect size={20}/>
                        </button>


                        <div className="relative">
                          <button
                            title="Agent Action"
                            onClick={() =>
                              setOpenDropdown(
                                openDropdown === agent.id
                                  ? null
                                  : agent.id
                              )
                            }
                            className="
                              px-custom-8
                              py-custom-8
                              rounded-xl
                              bg-negative
                              hover:bg-red-900
                              text-white
                              inline-flex
                              items-center
                              gap-custom-8
                              text-xs
                              font-semibold
                              transition
                            "
                          >
                            <Trash size={20} />
                          </button>

                          {openDropdown === agent.id && (
                            <div
                              className="
                                absolute
                                right-0
                                mt-2
                                w-40
                                bg-white
                                border
                                border-neutralMed
                                rounded-lg
                                shadow-lg
                                z-50
                              "
                            >
                              <button
                                onClick={() => {
                                  handleRemoveAgent(
                                    agent.id,
                                    "DROPPED"
                                  );
                                  setOpenDropdown(null);
                                }}
                                className="
                                  w-full
                                  cursor-pointer
                                  text-left
                                  font-bold
                                  px-4
                                  py-2
                                  hover:bg-red-50
                                  text-negative
                                "
                              >
                                Drop Agent
                              </button>

                              <button
                                onClick={() => {
                                  handleRemoveAgent(
                                    agent.id,
                                    "SUSPENDED"
                                  );
                                  setOpenDropdown(null);
                                }}
                                className="
                                  w-full
                                  cursor-pointer
                                  text-left
                                  font-bold
                                  px-4
                                  py-2
                                  hover:bg-yellow-50
                                  text-secondary
                                "
                              >
                                Suspend Agent
                              </button>
                            </div>
                          )}
                        </div>

                    </div>

                    </td>

                  </tr>
                )
              )}

          </tbody>

        </table>

        {/* PAGINATION */}
        <div
          className="
            flex
            items-center
            justify-between
            px-custom-32
            py-4
            border-t
            border-neutralMed
            bg-white
          "
        >

          <div className="text-sm text-neutralPrimary">

            Showing page{" "}

            <span className="font-semibold">
              {data?.page || 1}
            </span>{" "}

            of{" "}

            <span className="font-semibold">
              {data?.totalPages || 1}
            </span>

          </div>

          <div className="flex items-center gap-3">

            {/* PREVIOUS */}
            <button
              disabled={page === 1}
              onClick={() =>
                updateQueryParams(
                  "page",
                  page - 1
                )
              }
              className="
                inline-flex
                items-center
                gap-2
                px-4
                py-2
                rounded-lg
                border
                border-neutralMed
                hover:bg-neutralLight
                disabled:opacity-50
                disabled:cursor-not-allowed
                transition
              "
            >

              <ChevronLeft className="w-4 h-4" />

              Previous

            </button>

            {/* PAGE */}
            <div
              className="
                w-full
                px-custom-16
                py-1
                rounded-lg
                bg-mainPrimary
                text-white
                flex
                items-center
                justify-center
                font-semibold
              "
            >
              {page}
            </div>

            {/* NEXT */}
            <button
              disabled={
                page ===
                data?.totalPages
              }
              onClick={() =>
                updateQueryParams(
                  "page",
                  page + 1
                )
              }
              className="
                inline-flex
                items-center
                gap-2
                px-4
                py-2
                rounded-lg
                border
                border-neutralMed
                hover:bg-neutralLight
                disabled:opacity-50
                disabled:cursor-not-allowed
                transition
              "
            >

              Next

              <ChevronRight className="w-4 h-4" />

            </button>

          </div>

        </div>

      </div>

    </div>

    </div>
  );
}