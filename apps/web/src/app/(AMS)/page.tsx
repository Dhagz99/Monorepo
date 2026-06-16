"use client";

import dynamic from "next/dynamic";

import {
  useMemo,
  useState,
} from "react";

import {
  Users,
  Clock3,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  QrCodeIcon,
  ViewIcon,
} from "lucide-react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import { useGetClients, useGetCommissionDetails } from "../../hooks/clients/useClients";

import { Client } from "@repo/shared";

import MainModal from "@/components/modal/mainModal";
import ModuleHeader from "@/components/ui/commonUi/page.header";
import AppsTab from "@/components/ui/commonUi/general.tab";
import { useCreateCommissionScan, useScannedAgent } from "@/hooks/commission/useCommission";
import QRCode from "react-qr-code";
import { useAuth } from "@/components/context/UserContext";
import SweetAlert from "@/components/modal/Swal";

/* =========================================
   QR SCANNER
========================================= */

const QRScanner = dynamic(
  () => import("@/components/qrComp/qrScanner"),
  {
    ssr: false,
  }
);

/* =========================================
   TYPES
========================================= */

type TABKEY =
  | "daily-client"
  | "pending-commission"
  | "paid-commission";

/* =========================================
   COMPONENT
========================================= */

export default function ClientsPage() {
  const router = useRouter();

  const { user } = useAuth();

  const searchParams = useSearchParams();

  const initialTab =
    (searchParams.get("tab") as TABKEY) ??
    "daily-client";

  const [activeTab, setActiveTab] =
    useState<TABKEY>(initialTab);

  /* =========================================
     STATES
  ========================================= */

  const [openModal, setOpenModal] =
    useState(false);

  const [viewCommission, setViewCommission] = 
    useState(false);

  const [scanMode, setScanMode] =
    useState<"scan-qr" | "enter-code">(
      "scan-qr"
    );

  const [qrResult, setQrResult] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [selectClient, setSelectedClient] = useState("");

  const [selectedScanClientId, setSelectedScanClientId] =
  useState("");

  /* =========================================
     FETCH CLIENTS
  ========================================= */

  const {
    data,
    isLoading,
  } = useGetClients({
    page,
    search,
  });

  const {
    mutate: createCommission,
    isPending,
  } = useCreateCommissionScan();

  /* =========================================
     TABS
  ========================================= */

  const TABS: {
    key: TABKEY;
    label: string;
    icon: React.ElementType;
  }[] = [
    {
      key: "daily-client",
      label: "Daily Clients",
      icon: Users,
    },
    {
      key: "pending-commission",
      label: "Pending Commissions",
      icon: Clock3,
    },
    {
      key: "paid-commission",
      label: "Paid Commissions",
      icon: BadgeCheck,
    },
  ];

  /* =========================================
     CHANGE TAB
  ========================================= */

  const changeTab = (tab: TABKEY) => {
    setActiveTab(tab);

    setPage(1);

    const params =
      new URLSearchParams(
        searchParams.toString()
      );

    params.set("tab", tab);

    router.replace(
      `?${params.toString()}`,
      {
        scroll: false,
      }
    );
  };

  /* =========================================
     FILTERED CLIENTS
  ========================================= */

  const filteredClients = useMemo(() => {
    if (!data?.data) return [];

    switch (activeTab) {
      case "daily-client":
        return data.data.filter(
          (client: Client) =>
            client.clientStatus ===
            "NEW"
        );

      case "pending-commission":
        return data.data.filter(
          (client: Client) =>
            client.clientStatus ===
            "PENDING"
        );

      case "paid-commission":
        return data.data.filter(
          (client: Client) =>
            client.clientStatus ===
            "SCANNED"
        );

      default:
        return [];
    }
  }, [activeTab, data]);


  const handleCloseModal = () => {

    // close modal
    setOpenModal(false);

    // clear qr result
    setQrResult("");

    // reset mode
    setScanMode("scan-qr");

    setViewCommission(false);
  };

  const handleSelectedClient = (id:string) => {
      setSelectedClient(id)
      setViewCommission(true);

  }

  const handleScanningQr = (id:string) => {
      setSelectedScanClientId(id)
      setOpenModal(true);
  }

  const {
    data: commissionDetails,
  } = useGetCommissionDetails(
    selectClient
  );

  const directTransaction =
    commissionDetails?.commissionTransactions.find(
      (t) => t.commissionType === "DIRECT"
    );

  const downlineTransactions =
    commissionDetails?.commissionTransactions.filter(
      (t) => t.commissionType !== "DIRECT"
    ) ?? [];


    const {
      data: scannedAgent,
      isLoading: isScanningAgent,
      error: scannedAgentError,
    } = useScannedAgent({
      agentCode: qrResult,
      clientId:selectedScanClientId,
    });


  const handleConfirmCommission = () => {

    if (!scannedAgent || !user?.id) {
      return;
    }

    SweetAlert.confirmationAlert(
      "Confirm Commission",
      "Are you sure you want to credit this commission?",
      () => {

        createCommission(
          {
            clientId:
              scannedAgent.client.id,

            agentId:
              scannedAgent.agent.id,

            branchId:
              scannedAgent.agent.branches[0]
                .branchId,

            scannedBy:
              user.id,
          },
          {
            onSuccess: () => {

              SweetAlert.successAlertFunction(
                "Success",
                "Commission successfully credited.",
                () => {
                  // optional refresh logic
                },
                () => {
                  handleCloseModal();
                }
              );

            },

            onError: () => {

              SweetAlert.errorAlert(
                "Error",
                "Failed to create commission."
              );

            },
          }
        );

      }
    );
  };
  /* =========================================
     RENDER
  ========================================= */

  return (
    <div className="w-full flex flex-col gap-y-custom-32 px-custom-32 py-custom-48 ">

      {/* HEADER */}
      <ModuleHeader
          title="Client"
          subtitle="Master List"
          search={search}
          setSearch={setSearch}
          setPage={setPage}
      />

      {/* TABS */}

      <AppsTab
        tabs={TABS}
        activeTab={activeTab}
        changeTab={(key) =>
          changeTab(key as TABKEY)
        }
      />

      {/* LOADING */}
      {isLoading && (
        <div className="flex items-center gap-3 text-mainPrimary">

          <div className="w-5 h-5 border-2 border-mainPrimary border-t-transparent rounded-full animate-spin" />

          <span>
            Fetching clients...
          </span>
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white shadow-sm">

        <table className="w-full border-collapse">

          <thead className="bg-white text-tertiaryHeader">
            <tr className="text-neutralPrimary">

              <th className="text-left px-custom-24 py-5 font-semibold">
                Client Name
              </th>

              <th className="text-left px-custom-24 py-5 font-semibold">
                Transaction Date
              </th>

              <th className="text-left px-custom-24 py-5 font-semibold">
                Loan Amount
              </th>

              <th className="text-left px-custom-24 py-5 font-semibold">
                Status
              </th>

              <th className="text-center px-custom-24 py-5 font-semibold">
                Action
              </th>
            </tr>
          </thead>

          <tbody>

            {!isLoading &&
              filteredClients.length ===
                0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-10 text-neutralPrimary"
                  >
                    No clients found.
                  </td>
                </tr>
              )}

            {filteredClients.map(
              (
                client: Client,
                index: number
              ) => (
                <tr
                  key={index}
                  className="text-neutralPrimary text-body odd:bg-neutralLight"
                >
                  <td className="text-left px-6 py-4 font-semibold">
                    {
                      client.clientName
                    }
                  </td>

                  <td className="text-left px-6 py-4 font-semibold">
                    {
                      client.createdAt
                    }
                  </td>

                  <td className="text-left px-6 py-4 font-semibold">
                    ₱
                    {client.loanAmount.toLocaleString()}
                  </td>

                  <td>
                    <span
                      className={`text-left px-custom-16 py-custom-8 font-semibold rounded-full text-xs  text-white ${
                        client.clientStatus ===
                        "NEW"
                          ? "bg-positive"
                          : client.clientStatus ===
                            "PENDING"
                          ? "bg-secondary"
                          : "bg-mainPrimary"
                      }`}
                    >
                      {
                        client.clientStatus
                      }
                    </span>
                  </td>

                  <td className="text-center px-custom-24 py-4 font-semibold">

                    
                    {client.clientStatus === "SCANNED" ?(
                        <button
                          title="View Commission Details"
                          className="
                            px-custom-16
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
                            onClick={()=>{
                              handleSelectedClient(client.id);
                            }}
                        >
                          <ViewIcon size={20}/>
                        </button>
                    ):(
                      <button
                      title="Credit Commission"
                      className="
                            px-custom-16
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
                       onClick={()=>{
                              handleScanningQr(client.id);
                            }}
                    >
                      <QrCodeIcon size={20}/>
                    </button>

                    )}
                    


                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>

        {/* PAGINATION */}
        <div
          className="
            flex items-center justify-between
            px-custom-32 py-4 border-t border-neutralMed
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
                setPage(
                  (prev) =>
                    prev - 1
                )
              }
              className="
                inline-flex items-center gap-2
                px-4 py-2 rounded-lg
                border border-neutralMed
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
                w-full px-custom-16 py-1
                rounded-lg
                bg-mainPrimary
                text-white
                flex items-center justify-center
                font-semibold
              "
            >
              {page}
            </div>

            {/* NEXT */}
            <button
              disabled={
                page ===
                  data?.totalPages ||
                filteredClients.length ===
                  0
              }
              onClick={() =>
                setPage(
                  (prev) =>
                    prev + 1
                )
              }
              className="
                inline-flex items-center gap-2
                px-4 py-2 rounded-lg
                border border-neutralMed
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


        {/* MODAL */}
        {openModal && (
          <MainModal
            size={scannedAgent ? "xxl" : "sm"}
            
            onClose={handleCloseModal}
          >

            <div>

              
                 {/* TOP PROMPT */}
            {(isScanningAgent || scannedAgentError) && (
              <div
                className="
                  absolute
                  top-0
                  z-50
                  w-full
                  flex
                  justify-start
                  items-start
                  pointer-events-none
                "
              >
                {/* LOADING */}
                {isScanningAgent && (
                  <div
                    className="
                      bg-white
                      px-custom-16
                      py-1
                      rounded-tl-lg
                      rounded-br-lg
                      shadow-xl
                      flex
                      items-center
                      gap-3
                      border
                      border-mainPrimary/20
                      pointer-events-auto
                    "
                  >
                    <div className="w-5 h-5 border-2 border-mainPrimary border-t-transparent rounded-full animate-spin" />

                    <p className="text-mainPrimary font-medium">
                      Fetching agent...
                    </p>
                  </div>
                )}

                {/* ERROR */}
                {!isScanningAgent && scannedAgentError && (
                  <div
                    className="
                      bg-negative
                      text-white
                      px-custom-16
                      py-1
                      rounded-tl-lg
                      rounded-br-lg
                      shadow-xl
                      font-semibold
                      pointer-events-auto
                      text-xs
                    "
                  >
                    Agent not found
                  </div>
                )}
              </div>
            )}


              <div
                className={`
                  w-full
                  transition-all
                  duration-500
                  ease-in-out
                  ${scannedAgent ? "0" : "py-custom-8"}
                  ${
                    scannedAgent
                      ? "grid grid-cols-2 gap-custom-32"
                      : "flex flex-col"
                  }
                `}
              >
              
                {/* =========================================
                    LEFT SIDE
                ========================================= */}
              <div className="w-full flex flex-col gap-custom-32 py-custom-32 justify-center items-start">
                  {/* HEADER */}
                  <div className="w-full flex flex-col gap-custom-8 items-center">
                    <h1 className="text-secondaryHeader text-mainPrimary font-bold">
                      Scan QR Code
                    </h1>
                    <p className="text-neutralPrimary font-normal text-body">
                      Place QR inside the frame to scan
                    </p>
                  </div>
                  {/* QR / INPUT */}
                  <div className="w-full flex justify-center items-center">
                    {scanMode === "scan-qr" ? (
                      <div className="w-full flex flex-col items-center gap-4">
                        <QRScanner
                          onScan={(text: string) => {
                            const cleaned =
                              text.trim();
                            setQrResult(cleaned);
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-full flex justify-center">
                        <input
                          type="text"
                          placeholder="Enter Code"
                          value={qrResult}
                          onChange={(e) =>
                            setQrResult(
                              e.target.value
                            )
                          }
                          className="
                            w-full
                            max-w-[320px]
                            border
                            border-neutralMed
                            rounded-xl
                            px-4 py-3
                            outline-none
                            focus:border-mainPrimary
                          "
                        />
                      </div>
                    )}
                  </div>
                  {/* SWITCH */}
                  <div className="w-full px-custom-64">
                    <ul className="bg-neutralMed rounded-xl w-full p-2 flex justify-between gap-2">
                      {/* SCAN QR */}
                      <li
                        onClick={() =>
                          setScanMode(
                            "scan-qr"
                          )
                        }
                        className={`
                          flex-1 text-center py-3 rounded-lg cursor-pointer transition-all
                          ${
                            scanMode === "scan-qr"
                              ? "bg-white text-neutralPrimary font-semibold shadow-sm"
                              : "text-white"
                          }
                        `}
                      >
                        Scan QR
                      </li>
                      {/* ENTER CODE */}
                      <li
                        onClick={() =>
                          setScanMode(
                            "enter-code"
                          )
                        }
                        className={`
                          flex-1 text-center py-3 rounded-lg cursor-pointer transition-all
                          ${
                            scanMode === "enter-code"
                              ? "bg-white text-neutralPrimary font-semibold shadow-sm"
                              : "text-white"
                          }
                        `}
                      >
                        Enter Code
                      </li>
                    </ul>
                  </div>
                </div>
              
                {/* =========================================
                    RIGHT SIDE
                ========================================= */}
                {scannedAgent && (
                  <div
                    className="
                      w-full
                      bg-mainPrimary
                      bg-[radial-gradient(circle_at_top_right,rgba(30,64,175,0.45),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(30,64,175,0.25),transparent_35%)
                      p-custom-32
                      rounded-tr-lg
                      rounded-br-lg
                      text-white
                      animate-in
                      fade-in
                      slide-in-from-left-5
                      duration-500
                      min-h-125
                      max-h-145
                      overflow-y-auto
                    "
                  >
                    {/* SUCCESS */}
                    {!isScanningAgent &&
                      scannedAgent && (
                        <div className="relative flex flex-col gap-6 h-full">
                          {/* TITLE */}
                          <div className="">
                            <h2 className="text-secondaryHeader">
                              Agent Details
                            </h2>
                          </div>
                          {/* INFO */}
                          <div className="flex gap-6">
                            {/* QR */}
                            <div
                              className="
                                bg-white
                                rounded-xl
                                p-custom-8
                                w-fit
                                flex
                                items-center
                                justify-center
                              "
                            >
              

                              <QRCode
                               value={
                                 scannedAgent?.agent.agentCode || ""
                               }
                               size={80}
                             />
                           
                            </div>
                            {/* DETAILS */}
                            <div className="flex flex-col gap-3">
                              <div>
                                <p className="text-xs text-gray-300">
                                  Agent Fullname
                                </p>
                                <p className="text-mdHeader font-bold">
                                  {
                                    scannedAgent?.agent.fullName
                                  }
                                </p>
                              </div>
                              <div className="inline-flex flex-wrap gap-custom-16">
                                <p className="text-xs font-semibold text-yellow-300">
                                  ( {
                                    scannedAgent?.agent.level
                                  } )
                                </p>
                                <p className="text-xs text-gray-300">
                                  Current Level
                                </p>
              
                              </div>
                              <div className="text-xs inline-flex flex-wrap gap-custom-16">
                                <p className="font-semibold text-yellow-300">
                                 ( {scannedAgent?.agent?.branches
                                  ?.map((b) => b.branch.companyName )
                                  ?.join(", ") || "-"}
                                 )
                                </p>
                                <p className="text-sm text-gray-300">
                                  Assigned Branch
                                </p>
              
                              </div>
                            </div>
                          </div>

                          <div className="w-full border-b border-neutralLight flex flex-col gap-y-custom-16 py-custom-16">
                              <div className="flex justify-between">
                                      <h6 className="text-mdHeader">Commission</h6>
                                      <p className="text-body"></p>
                              </div>
                              <div className="flex flex-col text-xs">
                                  <div className="flex justify-between gap-custom-8">
                                      <h6 className="text-sm">( {scannedAgent?.agent?.status} ) SCAN STATUS</h6>
                                       <p className="font-bold text-xs text-yellow-300">
                                        ₱
                                        {Number(
                                         scannedAgent?.directCommission?.amount
                                        ).toLocaleString()}
                                      </p>
                                  </div>
                                  <p className="text-xs text-neutralMed">{scannedAgent?.directCommission?.rule?.piraRate}% Commission Rate</p>
                              </div>
                            </div>

                            {/* UPLINE COMMISSIONS */}
                            {scannedAgent?.overrideCommissions &&
                              scannedAgent.overrideCommissions.length > 0 && (
                                <div className="flex flex-col gap-y-custom-8">

                                  <div className="flex justify-between">
                                    <h6 className="text-mdHeader">
                                      Upline Commission
                                    </h6>
                                  </div>

                                  {scannedAgent.overrideCommissions.map(
                                    (override, index) => (
                                      <div
                                        key={index}
                                        className="
                                          bg-white/10
                                          border
                                          border-white/20
                                          rounded-xl
                                          p-4
                                          flex
                                          justify-between
                                          items-center
                                        "
                                      >
                                        {/* LEFT */}
                                        <div>
                                          <p className="font-bold text-white">
                                            {override.agent.fullName}
                                          </p>

                                          <p className="text-sm text-gray-300">
                                            ({override.agent.level}) Current Level
                                          </p>

                                          <p
                                            className={`text-xs font-semibold ${
                                              override.agent.status === "ACTIVE"
                                                ? "text-green-300"
                                                : "text-red-300"
                                            }`}
                                          >
                                            {override.agent.status}
                                          </p>

                                          {/* {override.blocked && (
                                            <p className="text-xs text-red-300 mt-1">
                                              BLOCKED
                                            </p>
                                          )}

                                          {override.reason && (
                                            <p className="text-xs text-gray-300">
                                              {override.reason}
                                            </p>
                                          )} */}
                                        </div>

                                        {/* RIGHT */}
                                        <div className="text-right">
                                          <p
                                            className={`font-bold ${
                                              override.blocked
                                                ? "text-red-300"
                                                : "text-yellow-300"
                                            }`}
                                          >
                                            ₱
                                            {Number(
                                              override.amount
                                            ).toLocaleString()}
                                          </p>

                                          <p className="text-xs text-gray-300">
                                            Override Commission
                                          </p>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                            )}

              
              
                          {/* BUTTON */}
                            <button
                              disabled={isPending}
                                onClick={() => {
                                  handleConfirmCommission()
                                }}
                              className="
                                sticky
                                bottom-0
                                mt-4
                                w-full
                                bg-green-500
                                hover:bg-green-600
                                transition
                                rounded-xl
                                py-custom-16
                                font-bold
                                text-body
                                cursor-pointer
                                shadow-xl
                              "
                            >
                              {
                                isPending
                                  ? "Saving..."
                                  : "Confirm Agent Commission"
                              }
                            </button>

                        </div>
                      )}
                  </div>
                )}
              </div>
            </div>

          </MainModal>
        )}


        {viewCommission && (
          <MainModal
            size="xl"
            onClose={handleCloseModal}
          >
            <div className="
              w-full
              grid
              grid-cols-3
              rounded
            ">
              <div
                className="
                  w-full
                  px-custom-24
                  py-custom-24
                  rounded-bl-xl
                  rounded-tl-xl
                  text-mainPrimary
                "
              >
                <div className="flex flex-col gap-custom-16">

                  <div>
                    <h2 className="text-mdHeader font-bold">
                      Sale Details
                    </h2>
                  </div>

                  <div className="flex flex-col gap-y-custom-16">

                    <h6 className="text-body text-neutralPrimary">Client Info</h6>

                    <div className="flex flex-col gap-y-custom-8">
                      <div
                        className="
                          bg-neutralLight
                          py-custom-8
                          px-custom-16
                          rounded-xl
                          w-full
                        "
                      >
                        <h2
                          className="
                            text-xs
                            text-neutralPrimary
                          "
                        >
                          Client Name
                        </h2>
                        <p
                          className="
                            font-bold
                            text-sm
                          "
                        >
                          {commissionDetails?.client.clientName}
                        </p>
                      </div>
                      <div
                        className="
                          bg-neutralLight
                          py-custom-8
                          px-custom-16
                          rounded-xl
                          w-full
                        "
                      >
                        <h2
                          className="
                            text-xs
                            text-neutralPrimary
                          "
                        >
                          Loan Amount
                        </h2>
                        <p
                          className="
                            font-bold
                            text-sm
                          "
                        >
                          ₱
                          {Number(
                            commissionDetails?.client.loanAmount ?? 0
                          ).toLocaleString()}
                        </p>
                      </div>
                      <div
                        className="
                          bg-neutralLight
                          py-custom-8
                          px-custom-16
                          rounded-xl
                          w-full
                        "
                      >
                        <h2
                          className="
                            text-xs
                            text-neutralPrimary
                          "
                        >
                          Loan Term
                        </h2>
                        <p
                          className="
                            font-bold
                            text-sm
                          "
                        >
                          {commissionDetails?.client.term}
                        </p>
                      </div>
                    </div>
          
                    <h6 className="text-body text-neutralPrimary">Handled by</h6>

                    <div className="flex flex-col gap-y-custom-8">
                      <div
                        className="
                          bg-neutralLight
                          py-custom-8
                          px-custom-16
                          rounded-xl
                          w-full
                        "
                      >
                        <h2
                          className="
                            text-xs
                            text-neutralPrimary
                          "
                        >
                          Branch Admin
                        </h2>
                        <p
                          className="
                            font-bold
                            text-sm
                          "
                        >
                          {commissionDetails?.scanner?.name ?? "-"}
                        </p>
                      </div>
                      <div
                        className="
                          bg-neutralLight
                          py-custom-8
                          px-custom-16
                          rounded-xl
                          w-full
                        "
                      >
                        <h2
                          className="
                            text-xs
                            text-neutralPrimary
                          "
                        >
                          Scanned Branch
                        </h2>
                        <p
                          className="
                            font-bold
                            text-sm
                          "
                        >
                          {commissionDetails?.branch.companyName}
                        </p>
                      </div>
                      <div
                        className="
                          bg-neutralLight
                          py-custom-8
                          px-custom-16
                          rounded-xl
                          w-full
                        "
                      >
                        <h2
                          className="
                            text-xs
                            text-neutralPrimary
                          "
                        >
                          Sale Reference
                        </h2>
                        <p
                          className="
                            font-bold
                            text-sm
                          "
                        >
                           {commissionDetails?.saleReference ?? "-"}
                        </p>
                      </div>
                    </div>

                  </div>

                </div>
              </div>

              <div className=" min-h-125 max-h-145
                      overflow-y-auto w-full col-span-2 px-custom-24 py-custom-24 rounded-br-xl rounded-tr-xl bg-mainPrimary text-white">
                      <div className="flex flex-col gap-custom-16">

                        {/* DIRECT COMMISSION */}
                        {directTransaction && (
                         <div className="flex flex-col gap-custom-16">
                            {/* TITLE */}
                            <div>
                              <h2 className="text-mdHeader font-bold">
                                Commission Distribution
                              </h2>
                            </div>


                            {/* INFO */}
                            <div className="
                                    bg-white/10
                                    border
                                    border-white/20
                                    rounded-xl
                                    p-4
                                    flex
                                    justify-between
                                    items-center
                                  ">

                              
                              <div className="flex gap-6">
                                {/* QR */}
                                <div
                                  className="
                                    bg-white
                                    rounded-xl
                                    p-3
                                    w-fit
                                    flex
                                    items-center
                                    justify-center
                                  "
                                >
                              
                                <QRCode
                                  value={
                                    directTransaction?.sourceAgent?.agentCode || ""
                                  }
                                  size={100}
                                />
                                
                                </div>
                                {/* DETAILS */}
                                <div className="flex flex-col gap-3 items-start justify-center">
                                      <div>
                                        <p className="text-sm text-gray-300">
                                          Agent Fullname
                                        </p>
                                        <p className="text-xl font-bold">
                                          {
                                            directTransaction?.sourceAgent?.fullName
                                          }
                                        </p>
                                      </div>
                                      <div className="inline-flex flex-wrap gap-custom-16">
                                        <p className="font-semibold text-secondary">
                                          ( {
                                            directTransaction?.sourceAgent?.level
                                          } )
                                        </p>
                                        <p className="text-sm text-gray-300">
                                          Current Level
                                        </p>
                                      </div>
                                      <div className="inline-flex flex-wrap gap-custom-16">
                                        <p className="font-semibold text-positive">
                                          ( {
                                            directTransaction?.sourceAgent?.status
                                          } )
                                        </p>
                                        <p className="text-sm text-gray-300">
                                          Current Status
                                        </p>
                                      </div>
                                  </div>
                                </div>

                                <div>

                                </div>

                            </div>

                            <div className="w-full border-b border-neutralLight flex flex-col gap-y-custom-16 py-custom-16">
                              <div className="flex justify-between">
                                      <h6 className="text-mdHeader">Commission</h6>
                                      <p className="text-body"></p>
                              </div>
                              <div className="flex flex-col">
                                  <div className="flex justify-between">
                                      <h6 className="text-body">( {commissionDetails?.AgentScannedStatus} ) SCAN STATUS</h6>
                                       <p className="font-bold text-yellow-300">
                                        ₱
                                        {Number(
                                          directTransaction?.commissionAmount
                                        ).toLocaleString()}
                                      </p>
                                  </div>
                                  <p className="text-xs text-neutralMed">{directTransaction?.commissionRule?.piraRate}% Commission Rate</p>
                              </div>
                            </div>


                            </div>
                
                        )}

                        {/* RECEIVERS */}
                        {downlineTransactions.length > 0 && (
                            <div className="flex flex-col gap-y-custom-16">
                              <div className="flex justify-between">
                                      <h6 className="text-mdHeader">Upline Commission</h6>
                                      <p className="text-body"></p>
                              </div>
                              {downlineTransactions.map(
                                (transaction) => (
                                  <div
                                    key={transaction.id}
                                    className="
                                      bg-white/10
                                      border
                                      border-white/20
                                      rounded-xl
                                      p-4
                                      flex
                                      justify-between
                                      items-center
                                    "
                                  >
                                    <div>
                                      <p className="font-bold text-white">
                                        {transaction.receiverAgent.fullName}
                                      </p>

                                      <p className="text-sm text-gray-300">
                                       ( {transaction?.receiverLevel} ) Level
                                      </p>
                                    </div>

                                    <div className="text-right">
                                      <p className="font-bold text-yellow-300">
                                        ₱
                                        {Number(
                                          transaction.commissionAmount
                                        ).toLocaleString()}
                                      </p>

                                      <p className="text-xs text-gray-300">
                                        Override Commission
                                      </p>
                                    </div>
                                  </div>
                                )
                              )}

                            </div>
                        )}
                      </div>
              </div>


            </div>
          </MainModal>
        )}
      </div>
    </div>
  );
}