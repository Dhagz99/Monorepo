"use client"

import { useAuth } from "@/components/context/UserContext";
import DateRangePicker from "@/components/DateRangePicker";
import { getErrorMessage } from "@/components/helper/errorHelper";
import { formatDate } from "@/components/helper/LocaleDate";
import MainModal from "@/components/modal/mainModal";
import SweetAlert from "@/components/modal/Swal";
import AppsTab from "@/components/ui/commonUi/general.tab";
import ModuleHeader from "@/components/ui/commonUi/page.header";
import { useMyReactivationApprovals, useReactivationRequestDetails } from "@/hooks/reactivation/useReactivation";
import { useReviewReactivationApproval } from "@/hooks/reactivation/useReactivation";
import { DateRange } from "@repo/shared";
import { CheckCheck, Clock, Trash} from "lucide-react";
import Image from "next/image";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";


type TABKEY =
  | "PENDING"
  | "REJECTED"
  | "APPROVED";


export default function ReactivationsPage() {

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const { user } = useAuth();

    const isAdminOrOperations =
    user?.roles?.some((role) =>
        ["ADMIN", "OPERATIONS"].includes(role)
    ) ?? false;

    const searchParam = searchParams.get("search") || "";

    const requestedTab =
    searchParams.get("tab") as TABKEY | null;

    const activeTab: TABKEY =
    isAdminOrOperations
        ? requestedTab ?? "PENDING"
        : requestedTab === "REJECTED"
        ? "REJECTED"
        : "APPROVED";

    const [requiredSales, setRequiredSales] =
    useState<number | "">("");

    const [probationPeriod, setProbationPeriod] =
    useState<DateRange>({
        startDate: "",
        endDate: "",
    });

    const [reactivationRemarks, setReactivationRemarks] =
    useState("");

    const [isApprovingReactivation, setIsApprovingReactivation] =
    useState(false);

    const [
    selectedApprovalId,
    setSelectedApprovalId,
    ] = useState<string | null>(null);
        

    
    const [search, setSearch] = useState(searchParam);

    const [page, setPage] = useState(1);

    const [reactivationCondition, setReactivationCondition] = useState(false);

    const [
    selectedRequestId,
    setSelectedRequestId,
    ] = useState<string | null>(null);

    const [
    openRequestDetails,
    setOpenRequestDetails,
    ] = useState(false);

    const apiUrl =  process.env.NEXT_PUBLIC_API_URL;

    const {
    data: approvalRequests,
    } = useMyReactivationApprovals({
    page,
    limit: 5,
    search,
    status: activeTab,
    });

    const {
    mutateAsync: reviewApproval,
    isPending: isReviewingApproval,
    } = useReviewReactivationApproval();

    const {
    data: requestDetails,
    isLoading: isLoadingRequestDetails,
    } = useReactivationRequestDetails(
    selectedRequestId
    );
    /* =========================================
        TABS
    ========================================= */

   const TABS: {
    key: TABKEY;
    label: string;
    icon: React.ElementType;
    }[] = [
    ...(isAdminOrOperations
        ? [
            {
            key: "PENDING" as TABKEY,
            label: "Pending Request",
            icon: Clock,
            },
        ]
        : []),

    {
        key: "APPROVED" as TABKEY,
        label: "Approved Request",
        icon: CheckCheck,
    },

    {
        key: "REJECTED" as TABKEY,
        label: "Rejected Request",
        icon: Trash,
    },
    ];

    /* =========================================
        CHANGE TAB
    ========================================= */

    const changeTab = (tab: TABKEY) => {
    if (
        !isAdminOrOperations &&
        tab === "PENDING"
    ) {
        return;
    }

    setPage(1);

    const params = new URLSearchParams(
        searchParams.toString()
    );

    params.set("tab", tab);
    params.set("page", "1");

    router.replace(
        `${pathname}?${params.toString()}`,
        {
        scroll: false,
        }
    );
    };
        

    const updateQueryParams = (
        nextPage: number
        ) => {
        const params =
            new URLSearchParams(
            searchParams.toString()
            );

        params.set(
            "page",
            String(nextPage)
        );

        if (search.trim()) {
            params.set(
            "search",
            search.trim()
            );
        } else {
            params.delete("search");
        }

        router.replace(
            `${pathname}?${params.toString()}`
        );
        };
    
    const resetReactivationConditionForm = () => {
    setRequiredSales("");

    setProbationPeriod({
        startDate: "",
        endDate: "",
    });

    setReactivationRemarks("");
    setSelectedApprovalId(null);
    };

    const handleCloseReactivationCondition = () => {
    resetReactivationConditionForm();
    setReactivationCondition(false);
    };

    
    const handleApproveRequest = (
    approvalId: string
    ) => {
        setSelectedApprovalId(approvalId);
        setReactivationCondition(true);
    };


    const handleSubmitReactivationCondition =
    async () => {
        if (!selectedApprovalId) {
        await SweetAlert.errorAlert(
            "Approval Required",
            "No reactivation approval was selected."
        );

        return;
        }

        if (
        requiredSales === "" ||
        !Number.isInteger(requiredSales) ||
        requiredSales <= 0
        ) {
        await SweetAlert.errorAlert(
            "Required Sales Invalid",
            "Required sales must be a positive whole number."
        );

        return;
        }

        if (
        !probationPeriod.startDate ||
        !probationPeriod.endDate
        ) {
        await SweetAlert.errorAlert(
            "Probation Period Required",
            "Please select the probation start and end dates."
        );

        return;
        }

        if (
        probationPeriod.endDate <
        probationPeriod.startDate
        ) {
        await SweetAlert.errorAlert(
            "Invalid Probation Period",
            "The probation end date cannot be earlier than the start date."
        );

        return;
        }

        if (!reactivationRemarks.trim()) {
        await SweetAlert.errorAlert(
            "Remarks Required",
            "Please enter the approval remarks."
        );

        return;
        }

        try {
        setIsApprovingReactivation(true);

        await reviewApproval({
            approvalId: selectedApprovalId,
            status: "APPROVED",
            requiredSales,
            probationStartDate:
            probationPeriod.startDate,
            probationEndDate:
            probationPeriod.endDate,
            remarks:
            reactivationRemarks.trim(),
        });

        await SweetAlert.successAlert(
            "Reactivation Approved",
            "The reactivation request was approved successfully."
        );

        handleCloseReactivationCondition();
        } catch (error) {
        await SweetAlert.errorAlert(
            "Approval Failed",
            getErrorMessage(error)
        );
        } finally {
        setIsApprovingReactivation(false);
        }
    };

    const handleRejectRequest = (
    approvalId: string
    ) => {
    SweetAlert.remarksConfirmationAlert(
        "Reject Reactivation Request?",
        "Please enter rejection remarks before rejecting this request.",
        "Enter rejection remarks",
        async (remarks) => {
        try {
            await reviewApproval({
            approvalId,
            status: "REJECTED",
            remarks,
            });

            SweetAlert.successAlert(
            "Rejected",
            "Reactivation request rejected successfully."
            );
        } catch (error) {
            SweetAlert.errorAlert(
            "Rejection Failed",
            getErrorMessage(error)
            );
        }
        }
    );
    };

    const handleViewDetails = (
    requestId: string
    ) => {
    setSelectedRequestId(requestId);
    setOpenRequestDetails(true);
    };


    return (
            <div className="w-full flex flex-col gap-y-custom-32 px-custom-32 py-custom-48">
        
                <div className="flex justify-between">
                    <ModuleHeader
                    title="Reactivation"
                    subtitle="Request"
                    />
                    <div className="w-full flex justify-end">
    
                    <input
                        type="text"
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => {
                            const value =
                            e.target.value;

                            setSearch(value);

                            const params =
                            new URLSearchParams(
                                searchParams.toString()
                            );

                            if (value.trim()) {
                            params.set(
                                "search",
                                value
                            );
                            } else {
                            params.delete("search");
                            }

                            params.set("page", "1");

                            router.replace(
                            `${pathname}?${params.toString()}`
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

                
                <AppsTab
                  tabs={TABS}
                  activeTab={activeTab}
                  changeTab={(key) =>
                    changeTab(key as TABKEY)
                  }
                />

                

                <div className="flex flex-col gap-custom-16">

                    {approvalRequests?.data?.length ? (
                    <div className="flex flex-col gap-custom-16">
                        {approvalRequests.data.map((item) => (
                        <div
                            key={item.id}
                            className="
                            border border-neutralMed rounded-xl p-custom-24
                            flex flex-col gap-custom-8 bg-white
                            "
                        >
                            <div className="flex justify-between gap-custom-16 items-center">
                                <div>
                                    <h2 className="font-bold text-mainPrimary capitalize text-mdHeader">
                                    {item.request.agent.fullName}
                                    </h2>

                                    <p className="text-sm text-neutralPrimary text-body">
                                    {item.request.agent.agentCode} • {item.request.agent.level}
                                    </p>
                                </div>

                                <span
                                    className={`text-xs font-bold px-custom-16 py-custom-8 rounded-full text-white ${
                                      item.status === "APPROVED"
                                        ? "bg-positive"
                                        : item.status === "REJECTED"
                                        ? "bg-negative"
                                        : "bg-secondary"
                                    }`}
                                  >
                                    {item.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-3 justify-between items-end">
                                <div className="flex flex-col gap-custom-8 col-span-2">
                                    <p className="text-body">
                                    {item.request.reason ?? "No reason provided."}
                                    </p>
                                    <p className="text-xs text-neutralPrimary">
                                    Reviewer: {item.reviewerType}
                                    </p>
                                    {item.request.attachments?.[0] && (
                                    <a
                                        href={`${apiUrl}${item.request.attachments[0].filePath}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-lightPrimary font-bold underline"
                                    >
                                        View Attached Document
                                    </a>
                                    )}
                                </div>
                                
                                {activeTab !== "PENDING" &&(
                                    <div className="flex items-center justify-end text-sm font-bold">
                                        <button 
                                        onClick={() => 
                                            handleViewDetails(item.request.id)}
                                        className="bg-lightPrimary px-custom-24 
                                        py-custom-8 text-white rounded-lg 
                                        cursor-pointer hover:scale-105 duration-150 
                                        shadow-lg ease-in-out"
                                        >
                                            View Request Details
                                        </button>
                                    </div>
                                )}

                              

                               {isAdminOrOperations &&
                                activeTab === "PENDING" && (
                                  <div className="flex gap-custom-8 w-full">
                                    <button
                                        type="button"
                                        disabled={isReviewingApproval}
                                        onClick={() =>
                                        handleApproveRequest(item.id)
                                        }
                                        className="
                                        w-full bg-mainPrimary text-white py-custom-8
                                        rounded-lg font-bold hover:bg-lightPrimary
                                        text-body cursor-pointer
                                        disabled:opacity-50
                                        disabled:cursor-not-allowed
                                        "
                                    >
                                        Approve
                                    </button>

                                    <button
                                        type="button"
                                        disabled={isReviewingApproval}
                                        onClick={() =>
                                        handleRejectRequest(item.id)
                                        }
                                        className="
                                        w-full bg-negative text-white py-custom-8
                                        rounded-lg font-bold hover:opacity-90
                                        text-body cursor-pointer
                                        disabled:opacity-50
                                        disabled:cursor-not-allowed
                                        "
                                    >
                                        Reject
                                    </button>
                                    
                                  </div>
                                )}
                            </div>

                          
                        </div>
                        ))}
                    </div>
                    ) : (
                    <div className="text-center py-custom-32 text-neutralPrimary">
                        NO {activeTab} REACTIVATION REQUEST.
                    </div>
                    )}
                </div>

                {approvalRequests &&
                    approvalRequests.totalPages > 1 && (
                        <div className="flex items-center justify-end gap-custom-8">
                        <button
                            type="button"
                            disabled={page <= 1}
                            onClick={() =>
                            updateQueryParams(page - 1)
                            }
                            className="
                            px-custom-16
                            py-custom-8
                            rounded-md
                            border
                            disabled:opacity-50
                            disabled:cursor-not-allowed
                            cursor-pointer
                            "
                        >
                            Previous
                        </button>

                        <span className="text-sm text-neutralPrimary">
                            Page {approvalRequests.page} of{" "}
                            {approvalRequests.totalPages}
                        </span>

                        <button
                            type="button"
                            disabled={
                            page >=
                            approvalRequests.totalPages
                            }
                            onClick={() =>
                            updateQueryParams(page + 1)
                            }
                            className="
                            px-custom-16
                            py-custom-8
                            rounded-md
                            border
                            disabled:opacity-50
                            disabled:cursor-not-allowed
                            cursor-pointer
                            "
                        >
                            Next
                        </button>
                        </div>
                    )}
                    {reactivationCondition && (
                    <MainModal
                        size="lg"
                        onClose={handleCloseReactivationCondition}
                    >
                        <div className="flex flex-col gap-custom-16">
                            <div className="w-full flex items-start justify-start bg-mainPrimary py-custom-16 px-custom-32 rounded-t-xl">
                                <Image
                                src="/images/AMSLOGO.svg"
                                alt="JameroGroupOfCompanies"
                                width={160}
                                height={160}
                                priority
                                />
                            </div>

                            <div className="px-custom-32 flex flex-col gap-y-custom-8">
                                <h1 className="text-mdHeader font-bold text-mainPrimary">
                                Agent Reactivation Approval
                                </h1>

                                <p className="text-sm text-neutralPrimary">
                                Reactivation request approved subject to the
                                conditions below.
                                </p>
                            </div>

                        <div className="px-custom-32 pb-custom-32 flex flex-col gap-y-custom-20">
                            {/* REQUIRED SALES */}
                            <div className="flex flex-col gap-y-custom-8">
                            <label
                                htmlFor="requiredSales"
                                className="font-bold text-xs text-mainPrimary"
                            >
                                Required Sales
                            </label>

                            <input
                                id="requiredSales"
                                type="number"
                                min={1}
                                step={1}
                                value={requiredSales}
                                onChange={(event) => {
                                const value = event.target.value;

                                if (value === "") {
                                    setRequiredSales("");
                                    return;
                                }

                                const parsedValue =
                                    Number(value);

                                if (
                                    Number.isInteger(parsedValue) &&
                                    parsedValue >= 0
                                ) {
                                    setRequiredSales(parsedValue);
                                }
                                }}
                                placeholder="Enter required number of sales"
                                className="
                                w-full
                                border
                                border-neutralMed
                                bg-neutralLight
                                rounded-lg
                                px-custom-16
                                py-3
                                outline-none
                                focus:border-mainPrimary
                                focus:ring-1
                                focus:ring-mainPrimary
                                "
                            />

                            <p className="text-xs text-neutralPrimary">
                                Enter the number of sales the agent must
                                complete during probation.
                            </p>
                            </div>

                            {/* PROBATION PERIOD */}
                            <div className="flex flex-col gap-y-custom-8">
                            <label className="font-bold text-xs text-mainPrimary">
                                Probation Period
                            </label>
                                    <DateRangePicker
                                    value={
                                        probationPeriod.startDate &&
                                        probationPeriod.endDate
                                        ? [
                                            new Date(
                                                `${probationPeriod.startDate}T00:00:00`
                                            ),
                                            new Date(
                                                `${probationPeriod.endDate}T00:00:00`
                                            ),
                                            ]
                                        : []
                                    }
                                    onChange={(range) => {
                                        setProbationPeriod(range);
                                    }}
                                    placeholder="Select probation period"
                                    className="w-full"
                                    />
                            <p className="text-xs text-neutralPrimary">
                                Select the start and end dates of the
                                agent&apos;s probation period.
                            </p>
                            </div>

                            {/* REMARKS */}
                            <div className="flex flex-col gap-y-custom-8">
                            <label
                                htmlFor="reactivationRemarks"
                                className="font-bold text-xs text-mainPrimary"
                            >
                                Remarks
                            </label>

                            <textarea
                                id="reactivationRemarks"
                                value={reactivationRemarks}
                                onChange={(event) =>
                                setReactivationRemarks(
                                    event.target.value
                                )
                                }
                                rows={4}
                                maxLength={500}
                                placeholder="Enter reactivation approval remarks..."
                                className="
                                w-full
                                resize-none
                                border
                                border-neutralMed
                                bg-neutralLight
                                rounded-lg
                                px-custom-16
                                py-3
                                outline-none
                                focus:border-mainPrimary
                                focus:ring-1
                                focus:ring-mainPrimary
                                "
                            />

                            <div className="flex justify-between text-xs text-neutralPrimary">
                                <span>
                                Explain the conditions of the approval.
                                </span>

                                <span>
                                {reactivationRemarks.length}/500
                                </span>
                            </div>
                            </div>

                            {/* ACTIONS */}
                            <div className="flex items-center justify-end gap-custom-16 border-t border-neutralMed pt-custom-16">
                            <button
                                type="button"
                                disabled={
                                isApprovingReactivation
                                }
                                onClick={
                                handleCloseReactivationCondition
                                }
                                className="
                                px-custom-24
                                py-custom-8
                                rounded-lg
                                border
                                border-neutralMed
                                text-neutralPrimary
                                font-semibold
                                hover:bg-neutralLight
                                disabled:opacity-50
                                disabled:cursor-not-allowed
                                "
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={
                                isApprovingReactivation ||
                                requiredSales === "" ||
                                !probationPeriod.startDate ||
                                !probationPeriod.endDate ||
                                !reactivationRemarks.trim()
                                }
                                onClick={
                                handleSubmitReactivationCondition
                                }
                                className="
                                px-custom-24
                                py-custom-8
                                rounded-lg
                                bg-positive
                                text-white
                                font-semibold
                                hover:opacity-90
                                disabled:opacity-50
                                disabled:cursor-not-allowed
                                "
                            >
                                {isApprovingReactivation
                                ? "Approving..."
                                : "Approve Reactivation"}
                            </button>
                            </div>
                        </div>
                        </div>
                    </MainModal>
                    )}

                {openRequestDetails && (
                    <MainModal
                        size="lg"
                        onClose={() => {
                        setOpenRequestDetails(false);
                        setSelectedRequestId(null);
                        }}
                    >
                        {isLoadingRequestDetails ? (
                        <p>Loading...</p>
                        ) : (

                        <div className="flex flex-col gap-custom-16">

                            <div className="w-full flex items-start justify-start bg-mainPrimary py-custom-16 px-custom-32 rounded-t-xl">
                                <Image
                                src="/images/AMSLOGO.svg"
                                alt="JameroGroupOfCompanies"
                                width={160}
                                height={160}
                                priority
                                />
                            </div>

                            <div className="px-custom-32 flex flex-col gap-y-custom-8">
                                <h1 className="text-mdHeader font-bold text-mainPrimary">
                                Reactivation Request Details
                                </h1>

                                <p className="text-sm text-neutralPrimary">
                                Reactivation request details and condition below.
                                </p>
                            </div>

                            <div className="px-custom-32 pb-custom-32 flex flex-col gap-y-custom-16 overflow-auto max-h-100 py-custom-16">
                                
                                <div
                                        className="
                                                    bg-neutralLight
                                                    p-custom-16
                                                    rounded-xl
                                                    w-full
                                                    flex flex-col
                                                    gap-y-1
                                                "
                                        >
                                            <h2
                                            className="
                                                        text-xs
                                                        text-neutralPrimary
                                                        "
                                            >
                                            Reviewed By:
                                            </h2>
                                            <p
                                            className="
                                                        font-bold
                                                        text-sm
                                                        "
                                            >
                                            {requestDetails?.approval?.reviewer?.name}
                                        </p>
                                </div>

                                <div className="flex gap-custom-16">
                                    <div
                                        className="
                                                    bg-neutralLight
                                                    p-custom-16
                                                    rounded-xl
                                                    w-full
                                                    flex flex-col
                                                    gap-y-1
                                                "
                                        >
                                            <h2
                                            className="
                                                        text-xs
                                                        text-neutralPrimary
                                                        "
                                            >
                                            Agent Status
                                            </h2>
                                            <p
                                            className="
                                                        font-bold
                                                        text-sm
                                                        "
                                            >
                                            {requestDetails?.agent.status}
                                        </p>
                                    </div>

                                    <div
                                        className="
                                                    bg-neutralLight
                                                    p-custom-16
                                                    rounded-xl
                                                    w-full
                                                    flex flex-col
                                                    gap-y-1
                                                "
                                        >
                                            <h2
                                            className="
                                                        text-xs
                                                        text-neutralPrimary
                                                        "
                                            >
                                            Required Sales
                                            </h2>
                                            <p
                                            className="
                                                        font-bold
                                                        text-sm
                                                        "
                                            >
                                            {requestDetails?.requiredSales}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-custom-16">
                                    <div
                                        className="
                                                    bg-neutralLight
                                                    p-custom-16
                                                    rounded-xl
                                                    w-full
                                                    flex flex-col
                                                    gap-y-1
                                                "
                                        >
                                            <h2
                                            className="
                                                        text-xs
                                                        text-neutralPrimary
                                                        "
                                            >
                                            Probation Start
                                            </h2>
                                            <p
                                            className="
                                                        font-bold
                                                        text-sm
                                                        "
                                            >
                                            {formatDate(requestDetails?.probationStartDate)}
                                        </p>
                                    </div>

                                    <div
                                        className="
                                                    bg-neutralLight
                                                    p-custom-16
                                                    rounded-xl
                                                    w-full
                                                    flex flex-col
                                                    gap-y-1
                                                "
                                        >
                                            <h2
                                            className="
                                                        text-xs
                                                        text-neutralPrimary
                                                        "
                                            >
                                            Probation End
                                            </h2>
                                            <p
                                            className="
                                                        font-bold
                                                        text-sm
                                                        "
                                            >
                                              {formatDate(requestDetails?.probationEndDate)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-y-custom-8">
                                    <label
                                            htmlFor="reactivationRemarks"
                                            className="font-bold text-xs text-mainPrimary"
                                        >
                                            Remarks
                                    </label>

                                    <textarea
                                            id="reactivationRemarks"
                                            value={requestDetails?.approval?.remarks ?? "-"}
                                            rows={4}
                                            readOnly
                                            maxLength={500}
                                            placeholder="Enter reactivation approval remarks..."
                                            className="
                                            w-full
                                            resize-none
                                            border
                                            border-neutralMed
                                            bg-neutralLight
                                            rounded-lg
                                            px-custom-16
                                            py-3
                                            outline-none
                                            focus:border-mainPrimary
                                            focus:ring-1
                                            focus:ring-mainPrimary
                                            "
                                    />

                                    <div className="flex justify-between text-xs text-neutralPrimary">
                                        <span>Explained conditions of the approval.</span>

                                        <span>
                                            {(requestDetails?.approval?.remarks?.length ?? 0)}/500
                                        </span>
                                    </div>
                                </div>
                            </div>

                        </div>
                        // <>

                        //     <p>
                        //     Agent Status:
                        //     {requestDetails?.agent.status}
                        //     </p>

                        //     <p>
                        //     Required Sales:
                        //     {requestDetails?.requiredSales}
                        //     </p>

                        //     <p>
                        //     Probation:
                        //     {requestDetails?.probationStartDate}
                        //     {" - "}
                        //     {requestDetails?.probationEndDate}
                        //     </p>

                        //     <p>
                        //     Reviewed By:
                        //     {requestDetails?.approval?.reviewer?.name ??
                        //         "Not yet reviewed"}
                        //     </p>

                        //     <p>
                        //     Remarks:
                        //     {requestDetails?.approval?.remarks ??
                        //         "-"}
                        //     </p>
                        // </>
                        )}
                    </MainModal>
                    )}
            </div>
    );
}


 