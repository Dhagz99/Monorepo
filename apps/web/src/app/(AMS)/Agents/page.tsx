"use client"

import { useAgentEditDetails, useDroppedorSuspendedAgentStatus, useMasterlistAgents, useUpdateAgentDetails } from "@/hooks/agents/useAgent";
// import SweetAlert from "@/components/modal/Swal";
// import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import { usePathname,useSearchParams, useRouter } from "next/navigation";

import {
  CalendarX2,
  ChevronLeft,
  ChevronRight,
  Edit,
  Inspect,
  Trash,
  UserCheck,
  UserMinus,
  UserX,
} from "lucide-react";
import ModuleHeader from "@/components/ui/commonUi/page.header";
import QRCode from "react-qr-code";
import SweetAlert from "@/components/modal/Swal";
import Swal from "sweetalert2";
import AppsTab from "@/components/ui/commonUi/general.tab";
import { useDebounce } from "@/components/helper/useDebounse";
import MainModal from "@/components/modal/mainModal";
import Image from "next/image";
import { AgentFormState, emptyAgentForm, UpdateAgentDetailsPayload } from "@repo/shared";
import axios from "axios";



type TABKEY =
  | "ACTIVE"
  | "PROBATION"
  | "EXPIRED"
  | "DROPPED"
  | "SUSPENDED";



export default function Masterlist() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentTab =
    (searchParams.get("tab") as TABKEY) ?? "ACTIVE";

  const page = Number(searchParams.get("page") ?? 1);
  const searchParam = searchParams.get("search") ?? "";

  const [search, setSearch] = useState(searchParam);

  const [
    isEditModalOpen,
    setIsEditModalOpen,
  ] =
    useState(false);

  const [
    selectedAgentId,
    setSelectedAgentId,
  ] =
    useState<string | null>(
      null
    );

  const debouncedSearch = useDebounce(search, 500);

  const [activeTab, setActiveTab] = useState<TABKEY>(currentTab);

  useEffect(() => {
    const currentSearch =
      searchParams.get("search") ?? "";

    const nextSearch = debouncedSearch.trim();

    if (currentSearch === nextSearch) return;

    const params = new URLSearchParams(
      searchParams.toString()
    );

    if (nextSearch === "") {
      params.delete("search");
    } else {
      params.set("search", nextSearch);
    }

    params.set("page", "1");

    router.replace(`${pathname}?${params.toString()}`, {
      scroll: false,
    });
  }, [debouncedSearch, pathname, router]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      const currentSearch = searchParams.get("search") ?? "";
      const nextSearch = search.trim();

      if (currentSearch === nextSearch) return;

      if (nextSearch === "") {
        params.delete("search");
      } else {
        params.set("search", nextSearch);
      }

      params.set("page", "1");

      const nextUrl = `${pathname}?${params.toString()}`;

      router.replace(nextUrl, {
        scroll: false,
      });
    }, 500);

    return () => clearTimeout(timeout);
  }, [search, pathname, router]);
  

  const {
    data,
    isLoading,
  } = useMasterlistAgents({
    page,
    search,
    status: activeTab,
  });


  const {
    data:
      selectedAgentDetails,

    isLoading:
      isLoadingAgentDetails,

    isError:
      isAgentDetailsError,
  } =
    useAgentEditDetails(
      selectedAgentId
    );

  const {
    mutateAsync:
      updateAgent,

    isPending:
      isUpdatingAgent,
  } =
    useUpdateAgentDetails();

  const [
    agentForm,
    setAgentForm,
  ] =
    useState<AgentFormState>(
      emptyAgentForm
    );


  const updateQueryParams = (
    key: string,
    value: string | number
  ) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "") {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }

    const nextUrl = `${pathname}?${params.toString()}`;

    router.replace(nextUrl, {
      scroll: false,
    });
  };

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

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

  const handleEditAgent = (
    agentId: string
  ) => {
    setSelectedAgentId(
      agentId
    );

    setIsEditModalOpen(
      true
    );
  };

  const handleCloseEditAgent = () => {
    setIsEditModalOpen(
      false
    );

    setSelectedAgentId(
      null
    );
  };

  const TABS: {
    key: TABKEY;
    label: string;
    icon: React.ElementType;
  }[] = [
    {
      key: "ACTIVE",
      label: "Active",
      icon: UserCheck,
    },
    {
      key: "PROBATION",
      label: "Probation",
      icon: CalendarX2,
    },
    {
      key: "EXPIRED",
      label: "Expired",
      icon: CalendarX2,
    },
    {
      key: "SUSPENDED",
      label: "Suspended",
      icon: UserX,
    },
     {
      key: "DROPPED",
      label: "Dropped",
      icon: UserMinus,
    },
  ];

  const changeTab = (tab: TABKEY) => {
    if (tab === activeTab) return;

    setActiveTab(tab);

    const params = new URLSearchParams(searchParams.toString());

    params.set("tab", tab);
    params.set("page", "1");

    router.replace(`${pathname}?${params.toString()}`, {
      scroll: false,
    });
  };

  const handleUpdateAgent =
  async (
    event:
      React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!selectedAgentId) {
      return;
    }

    if (
      !agentForm.fullName.trim()
    ) {
      SweetAlert.errorAlert(
        "Validation Error",
        "Agent full name is required."
      );

      return;
    }

    const payload: UpdateAgentDetailsPayload = {
      fullName:
        agentForm.fullName.trim(),

      username:
        agentForm.username.trim() ||
        null,

      level:
        agentForm.level as UpdateAgentDetailsPayload["level"],

      status:
        agentForm.status as UpdateAgentDetailsPayload["status"],

      gender:
        agentForm.gender
          ? agentForm.gender as UpdateAgentDetailsPayload["gender"]
          : null,

      birthDate:
        agentForm.birthDate ||
        null,

      address:
        agentForm.address.trim() ||
        null,

      email:
        agentForm.email.trim() ||
        null,

      telephone:
        agentForm.telephone.trim() ||
        null,

      secondaryTel:
        agentForm.secondaryTel.trim() ||
        null,
    };

    try {
      SweetAlert.loadingAlert(
        "Updating Agent",
        "Please wait..."
      );

      await updateAgent({
        agentId:
          selectedAgentId,

        payload,
      });

      Swal.close();

      await SweetAlert.successAlert(
        "Update Successful",
        "Agent information updated successfully."
      );

      handleCloseEditAgent();
    } catch (
      error: unknown
    ) {
      Swal.close();

      let errorMessage =
        "Unable to update agent information.";

      if (
        axios.isAxiosError<{
          message?: string;
        }>(error)
      ) {
        errorMessage =
          error.response?.data?.message ??
          errorMessage;
      } else if (
        error instanceof Error
      ) {
        errorMessage =
          error.message;
      }

      SweetAlert.errorAlert(
        "Update Failed",
        errorMessage
      );
    }
  };


  useEffect(() => {
      if (
        !selectedAgentDetails
      ) {
        return;
      }

      setAgentForm({
        fullName:
          selectedAgentDetails.fullName,

        username:
          selectedAgentDetails.username ??
          "",

        level:
          selectedAgentDetails.level,

        status:
          selectedAgentDetails.status,

        gender:
          selectedAgentDetails.gender ??
          "",

        birthDate:
          selectedAgentDetails.birthDate ??
          "",

        address:
          selectedAgentDetails.address ??
          "",

        email:
          selectedAgentDetails.email ??
          "",

        telephone:
          selectedAgentDetails.telephone ??
          "",

        secondaryTel:
          selectedAgentDetails.secondaryTel ??
          "",
      });
    }, [
      selectedAgentDetails,
    ]);
    
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
            onChange={(e) =>
                setSearch(e.target.value)
              }
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


              <AppsTab
                tabs={TABS}
                activeTab={activeTab}
                changeTab={(key) =>
                  changeTab(
                    key as TABKEY
                  )
                }
              />

    <div
      className="
        w-full
        flex
        flex-col
        gap-y-custom-32
      "
    >


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
                    NO {activeTab} AGENTS FOUND.
                  </td>

                </tr>
              )}


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

            
                    <td className="text-left px-6 py-4 font-semibold">

                      <QRCode
                        value={agent.agentCode || ""}
                        size={50}
                      />
                     
                    
                    </td>

                  
                    <td className="text-left px-6 py-4 font-semibold capitalize">

                      {agent.fullName}

                    </td>

                
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
                             
                              : "bg-neutralPrimary"



                          }
                        `}
                      >
                        {agent.status}
                      </span>
                    </td>

                    <td className="text-left px-6 py-4">

                    <div className="flex items-center gap-3">


                      <button
                        type="button"
                        title="Edit Details"
                        onClick={() =>
                          handleEditAgent(
                            agent.id
                          )
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
                        <Edit size={20} />
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

            <button
              disabled={page >= (data?.totalPages || 1)}
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

   {isEditModalOpen && (
  <MainModal
    size="lg"
    onClose={
      handleCloseEditAgent
    }
  >
    <div className="flex flex-col gap-custom-16">
      <div
        className="
          flex
          w-full
          items-start
          justify-start
          rounded-t-xl
          bg-mainPrimary
          px-custom-32
          py-custom-16
        "
      >
        <Image
          src="/images/AMSLOGO.svg"
          alt="JameroGroupOfCompanies"
          width={160}
          height={160}
          priority
        />
      </div>

      <div className="flex flex-col gap-y-custom-8 px-custom-32">
        <h1 className="text-mdHeader font-bold text-mainPrimary">
          Agent Information
        </h1>

        <p className="text-sm text-neutralPrimary">
          Update or configure the selected agent&apos;s information.
        </p>
      </div>

      {isLoadingAgentDetails && (
        <div className="px-custom-32 pb-custom-32">
          <div className="flex items-center gap-3 text-mainPrimary">
            <div
              className="
                h-5
                w-5
                animate-spin
                rounded-full
                border-2
                border-mainPrimary
                border-t-transparent
              "
            />

            <span>
              Loading agent information...
            </span>
          </div>
        </div>
      )}

      {isAgentDetailsError && (
        <div className="px-custom-32 pb-custom-32">
          <div
            className="
              rounded-lg
              bg-red-50
              px-custom-16
              py-custom-16
              text-negative
            "
          >
            Unable to load agent information.
          </div>
        </div>
      )}

      {!isLoadingAgentDetails &&
        selectedAgentDetails && (
          <form
            onSubmit={
              handleUpdateAgent
            }
            className="
              flex
              max-h-[65vh]
              flex-col
              gap-y-custom-20
              overflow-y-auto
              px-custom-32
              pb-custom-32
            "
          >
            <div className="grid grid-cols-1 gap-custom-16 md:grid-cols-2">
              <div className="flex flex-col gap-y-custom-8">
                <label
                  htmlFor="agentFullName"
                  className="text-xs font-bold"
                >
                  Full Name
                </label>

                <input
                  id="agentFullName"
                  type="text"
                  value={
                    agentForm.fullName
                  }
                  onChange={(
                    event
                  ) =>
                    setAgentForm(
                      (
                        current
                      ) => ({
                        ...current,

                        fullName:
                          event.target.value,
                      })
                    )
                  }
                  className="
                    rounded-lg
                    border
                    border-neutralMed
                    bg-neutralLight
                    px-custom-16
                    py-3
                  "
                />
              </div>

              <div className="flex flex-col gap-y-custom-8">
                <label
                  htmlFor="agentCode"
                  className="text-xs font-bold"
                >
                  Agent Code
                </label>

                <input
                  id="agentCode"
                  type="text"
                  readOnly
                  value={
                    selectedAgentDetails.agentCode
                  }
                  className="
                    cursor-not-allowed
                    rounded-lg
                    border
                    border-neutralMed
                    bg-gray-100
                    px-custom-16
                    py-3
                    opacity-70
                  "
                />
              </div>

              <div className="flex flex-col gap-y-custom-8">
                <label
                  htmlFor="agentUsername"
                  className="text-xs font-bold"
                >
                  Username
                </label>

                <input
                  id="agentUsername"
                  type="text"
                  value={
                    agentForm.username
                  }
                  onChange={(
                    event
                  ) =>
                    setAgentForm(
                      (
                        current
                      ) => ({
                        ...current,

                        username:
                          event.target.value,
                      })
                    )
                  }
                  className="
                    rounded-lg
                    border
                    border-neutralMed
                    bg-neutralLight
                    px-custom-16
                    py-3
                  "
                />
              </div>

              <div className="flex flex-col gap-y-custom-8">
                <label
                  htmlFor="agentLevel"
                  className="text-xs font-bold"
                >
                  Level
                </label>

                <select
                  id="agentLevel"
                  value={
                    agentForm.level
                  }
                  onChange={(
                    event
                  ) =>
                    setAgentForm(
                      (
                        current
                      ) => ({
                        ...current,

                        level:
                          event.target.value,
                      })
                    )
                  }
                  className="
                    rounded-lg
                    border
                    border-neutralMed
                    bg-neutralLight
                    px-custom-16
                    py-3
                  "
                >
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

              <div className="flex flex-col gap-y-custom-8">
                <label
                  htmlFor="agentStatus"
                  className="text-xs font-bold"
                >
                  Status
                </label>

                <select
                  id="agentStatus"
                  value={
                    agentForm.status
                  }
                  onChange={(
                    event
                  ) =>
                    setAgentForm(
                      (
                        current
                      ) => ({
                        ...current,

                        status:
                          event.target.value,
                      })
                    )
                  }
                  className="
                    rounded-lg
                    border
                    border-neutralMed
                    bg-neutralLight
                    px-custom-16
                    py-3
                  "
                >
                  <option value="ACTIVE">
                    Active
                  </option>

                  <option value="PROBATION">
                    Probation
                  </option>

                  <option value="EXPIRED">
                    Expired
                  </option>

                  <option value="SUSPENDED">
                    Suspended
                  </option>

                  <option value="DROPPED">
                    Dropped
                  </option>
                </select>
              </div>

              <div className="flex flex-col gap-y-custom-8">
                <label
                  htmlFor="agentGender"
                  className="text-xs font-bold"
                >
                  Gender
                </label>

                <select
                  id="agentGender"
                  value={
                    agentForm.gender
                  }
                  onChange={(
                    event
                  ) =>
                    setAgentForm(
                      (
                        current
                      ) => ({
                        ...current,

                        gender:
                          event.target.value,
                      })
                    )
                  }
                  className="
                    rounded-lg
                    border
                    border-neutralMed
                    bg-neutralLight
                    px-custom-16
                    py-3
                  "
                >
                  <option value="">
                    Select gender
                  </option>

                  <option value="MALE">
                    Male
                  </option>

                  <option value="FEMALE">
                    Female
                  </option>

                
                </select>
              </div>

              <div className="flex flex-col gap-y-custom-8">
                <label
                  htmlFor="agentBirthDate"
                  className="text-xs font-bold"
                >
                  Birth Date
                </label>

                <input
                  id="agentBirthDate"
                  type="date"
                  value={
                    agentForm.birthDate
                  }
                  onChange={(
                    event
                  ) =>
                    setAgentForm(
                      (
                        current
                      ) => ({
                        ...current,

                        birthDate:
                          event.target.value,
                      })
                    )
                  }
                  className="
                    rounded-lg
                    border
                    border-neutralMed
                    bg-neutralLight
                    px-custom-16
                    py-3
                  "
                />
              </div>

              <div className="flex flex-col gap-y-custom-8">
                <label
                  htmlFor="agentEmail"
                  className="text-xs font-bold"
                >
                  Email
                </label>

                <input
                  id="agentEmail"
                  type="email"
                  value={
                    agentForm.email
                  }
                  onChange={(
                    event
                  ) =>
                    setAgentForm(
                      (
                        current
                      ) => ({
                        ...current,

                        email:
                          event.target.value,
                      })
                    )
                  }
                  className="
                    rounded-lg
                    border
                    border-neutralMed
                    bg-neutralLight
                    px-custom-16
                    py-3
                  "
                />
              </div>

              <div className="flex flex-col gap-y-custom-8">
                <label
                  htmlFor="agentTelephone"
                  className="text-xs font-bold"
                >
                  Primary Telephone
                </label>

                <input
                  id="agentTelephone"
                  type="tel"
                  value={
                    agentForm.telephone
                  }
                  onChange={(
                    event
                  ) =>
                    setAgentForm(
                      (
                        current
                      ) => ({
                        ...current,

                        telephone:
                          event.target.value,
                      })
                    )
                  }
                  className="
                    rounded-lg
                    border
                    border-neutralMed
                    bg-neutralLight
                    px-custom-16
                    py-3
                  "
                />
              </div>

              <div className="flex flex-col gap-y-custom-8">
                <label
                  htmlFor="agentSecondaryTel"
                  className="text-xs font-bold"
                >
                  Secondary Telephone
                </label>

                <input
                  id="agentSecondaryTel"
                  type="tel"
                  value={
                    agentForm.secondaryTel
                  }
                  onChange={(
                    event
                  ) =>
                    setAgentForm(
                      (
                        current
                      ) => ({
                        ...current,

                        secondaryTel:
                          event.target.value,
                      })
                    )
                  }
                  className="
                    rounded-lg
                    border
                    border-neutralMed
                    bg-neutralLight
                    px-custom-16
                    py-3
                  "
                />
              </div>

              <div className="flex flex-col gap-y-custom-8 md:col-span-2">
                <label
                  htmlFor="agentAddress"
                  className="text-xs font-bold"
                >
                  Address
                </label>

                <textarea
                  id="agentAddress"
                  rows={3}
                  value={
                    agentForm.address
                  }
                  onChange={(
                    event
                  ) =>
                    setAgentForm(
                      (
                        current
                      ) => ({
                        ...current,

                        address:
                          event.target.value,
                      })
                    )
                  }
                  className="
                    resize-none
                    rounded-lg
                    border
                    border-neutralMed
                    bg-neutralLight
                    px-custom-16
                    py-3
                  "
                />
              </div>
            </div>

            <div className="flex justify-end gap-custom-16 border-t border-neutralMed pt-custom-16">
              <button
                type="button"
                onClick={
                  handleCloseEditAgent
                }
                disabled={
                  isUpdatingAgent
                }
                className="
                  rounded-lg
                  border
                  border-neutralMed
                  px-custom-24
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
                  isUpdatingAgent
                }
                className="
                  rounded-lg
                  bg-mainPrimary
                  px-custom-24
                  py-3
                  font-semibold
                  text-white
                  cursor-pointer
                  hover:bg-lightPrimary
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {isUpdatingAgent
                  ? "Updating Agent..."
                  : "Save Changes"}
              </button>
            </div>
          </form>
        )}
    </div>
  </MainModal>
)}

    </div>
  );
}