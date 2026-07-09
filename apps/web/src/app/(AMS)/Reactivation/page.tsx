"use client"

import { getErrorMessage } from "@/components/helper/errorHelper";
import SweetAlert from "@/components/modal/Swal";
import AppsTab from "@/components/ui/commonUi/general.tab";
import ModuleHeader from "@/components/ui/commonUi/page.header";
import { useMyReactivationApprovals } from "@/hooks/reactivation/useReactivation";
import { useReviewReactivationApproval } from "@/hooks/reactivation/useReactivation";
import { CheckCheck, Clock, Trash, WatchIcon } from "lucide-react";
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



    const searchParam = searchParams.get("search") || "";

    const initialTab =
        (searchParams.get("tab") as TABKEY) ??
        "PENDING";
    
    const [activeTab, setActiveTab] =
        useState<TABKEY>(initialTab);
    

    
    const [search, setSearch] = useState(searchParam);

    const [page, setPage] = useState(1);

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

    /* =========================================
        TABS
    ========================================= */

    const TABS: {
        key: TABKEY;
        label: string;
        icon: React.ElementType;
    }[] = [
        {
        key: "PENDING",
        label: "Pending Request",
        icon: Clock,
        },
        {
        key: "APPROVED",
        label: "Approved Request",
        icon: CheckCheck,
        },
        {
        key: "REJECTED",
        label: "Rejected Request",
        icon: Trash,
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


    
    const handleApproveRequest = (
    approvalId: string
    ) => {
    SweetAlert.remarksConfirmationAlert(
        "Approve Reactivation Request?",
        "Please enter approval remarks before approving this request.",
        "Enter approval remarks",
        async (remarks) => {
        try {
            await reviewApproval({
            approvalId,
            status: "APPROVED",
            remarks,
            });

            SweetAlert.successAlert(
            "Approved",
            "Reactivation request approved successfully."
            );
        } catch (error) {
            SweetAlert.errorAlert(
            "Approval Failed",
            getErrorMessage(error)
            );
        }
        }
    );
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
                            <div className="flex justify-between gap-custom-12 items-center">
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
                                {activeTab === "PENDING" &&(
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

            </div>
    );
}


 