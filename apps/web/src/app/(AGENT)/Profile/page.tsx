"use client";

import { useAuth } from "@/components/context/UserContext";
import { useAgentDetails,useAgentTransactionsHist, useMarkNotificationsRead, useRemainingSales } from "@/hooks/agents/useAgent";
import { AgentNotification } from "@repo/shared";
import { Bell, CheckCheck, ChevronDown, Clock, Trash, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import QRCode from "react-qr-code";
import { socket } from "@/lib/socket";
import { useEffect } from "react";
import MainModal from "@/components/modal/mainModal";
import SweetAlert from "@/components/modal/Swal";
import Swal from "sweetalert2";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useSearchParams, useRouter} from "next/navigation";
import AppsTab from "@/components/ui/commonUi/general.tab";
import { useMyReactivationApprovalProgress, useMyReactivationApprovals, useReviewReactivationApproval } from "@/hooks/reactivation/useReactivation";
import { getErrorMessage } from "@/components/helper/errorHelper";
import { useCreateMyReactivationPayment } from "@/hooks/payments/usePayment";
import { useCreateMyWithdrawalRequest } from "@/hooks/withdrawal/useWithdrawal";
import { renderTransactionItem } from "@/components/ui/transactionItems";

type TABKEY =
  | "PENDING"
  | "REJECTED"
  | "APPROVED";


export default function AgentProfile() {

    const { user } = useAuth();

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    
    const apiUrl =  process.env.NEXT_PUBLIC_API_URL;
    
    const searchParam = searchParams.get("search") || "";

    const initialTab =
            (searchParams.get("tab") as TABKEY) ??
            "PENDING";
        
    const [activeTab, setActiveTab] =
            useState<TABKEY>(initialTab);
        
    const [search, setSearch] = useState(searchParam);
    
    const [page, setPage] = useState(1);

    const [
      selectedProgressRequestId,
      setSelectedProgressRequestId,
    ] = useState<string | null>(null);

    const [
      openProgressModal,
      setOpenProgressModal,
    ] = useState(false);

    const {
      data: progressData,
      isLoading: isProgressLoading,
    } = useMyReactivationApprovalProgress(
      selectedProgressRequestId,
      openProgressModal
    );

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
      mutateAsync: createPayment,
      isPending: isCreatingPayment,
    } = useCreateMyReactivationPayment();

    const handleProceedToPayment = async (
      requestId?: string | null
    ) => {
      try {
        if (!requestId) {
          SweetAlert.errorAlert(
            "Payment Failed",
            "Missing reactivation request ID."
          );
          return;
        }

        SweetAlert.loadingAlert();

        const result = await createPayment({
          requestId,
        });

        Swal.close();

        if (result.alreadyPaid || !result.checkoutUrl) {
          SweetAlert.successAlert(
            "Already Paid",
            result.message
          );
          return;
        }

        window.location.href = result.checkoutUrl;
      } catch (error) {
        Swal.close();

        SweetAlert.errorAlert(
          "Payment Failed",
          getErrorMessage(error)
        );
      }
    };

    const reactivationSectionRef =
      useRef<HTMLDivElement | null>(null);

    const [
      newReactivationRequestCount,
      setNewReactivationRequestCount,
    ] = useState(0);
    

    const {data: agent, isLoading} = useAgentDetails({agentId:user?.agent?.id as string});

    const [downlineTab, setDownlineTab] =
    useState<"L2" | "L3">("L2");

    const DOWNLINES_PER_PAGE = 5;

    const [downlinePage, setDownlinePage] =
      useState(1);

    const shouldShowDownlineTable =
      agent?.level !== "L3";

    const filteredDownlines =
      agent?.level === "L1"
        ? (agent?.downlines ?? []).filter(
            (downline) =>
              downline.level === downlineTab
          )
        : agent?.downlines ?? [];


    const totalDownlinePages = Math.max(
      1,
      Math.ceil(
        filteredDownlines.length /
          DOWNLINES_PER_PAGE
      )
    );

    const paginatedDownlines =
      filteredDownlines.slice(
        (downlinePage - 1) *
          DOWNLINES_PER_PAGE,

        downlinePage *
          DOWNLINES_PER_PAGE
      );

  


    const {data: salesInfo} = useRemainingSales({agentId:user?.agent?.id ?? "",});

    const {mutateAsync: markRead,} = useMarkNotificationsRead();

    const [openTransact, setOpenTransact] = useState(false);

    const [showQr, setShowQr] = useState(false);

    const queryClient =
      useQueryClient();

    const [
      realtimeNotifications,
      setRealtimeNotifications,
    ] = useState<AgentNotification[]>([]);




    const [openWithdraw, setOpenWithdraw] =
      useState(false);

    const [withdrawAmount, setWithdrawAmount] =
      useState("");

    const payoutChannel: "GCASH" = "GCASH";

    const [accountName, setAccountName] = useState(
      user?.agent?.fullName ?? ""
    );

    const [accountNumber, setAccountNumber] = useState(
      user?.agent?.telephone ?? ""
    );

    const {
      mutateAsync: createWithdrawal,
      isPending: isCreatingWithdrawal,
    } = useCreateMyWithdrawalRequest();

    const handleSubmitWithdrawal = async (
      e: React.FormEvent
    ) => {
      e.preventDefault();

      try {
        const amount = Number(withdrawAmount);

        if (!amount || amount <= 0) {
          SweetAlert.errorAlert(
            "Invalid Amount",
            "Please enter a valid withdrawal amount."
          );
          return;
        }

        SweetAlert.loadingAlert();

        await createWithdrawal({
          amount,
          payoutChannel,
          accountName,
          accountNumber,
        });

        Swal.close();

        SweetAlert.successAlert(
          "Request Sent",
          "Your withdrawal request has been sent to admin for approval."
        );

        setOpenWithdraw(false);
        setWithdrawAmount("");
        setAccountName("");
        setAccountNumber("");
      } catch (error) {
        Swal.close();

        SweetAlert.errorAlert(
          "Withdrawal Failed",
          getErrorMessage(error)
        );
      }
    };


    useEffect(() => {
      if (!user?.agent) return;

      setAccountName(user.agent.fullName ?? "");
      setAccountNumber(user.agent.telephone ?? "");
    }, [user]);


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


    const [showNotification, setShowNotification] =
      useState(false);


    useEffect(() => {
      if (!agent?.id) return;

      socket.emit(
        "join-agent-room",
        agent.id
      );

      socket.emit(
        "join-upline-reactivation-room",
        agent.id
      );

      const handleNewReactivationApproval = () => {
        setNewReactivationRequestCount(
          (prev) => prev + 1
        );

        queryClient.invalidateQueries({
          queryKey: [
            "my-reactivation-approvals",
          ],
        });
      };

      socket.on(
        "new-reactivation-approval",
        handleNewReactivationApproval
      );

      return () => {
        socket.off(
          "new-reactivation-approval",
          handleNewReactivationApproval
        );
      };
    }, [
      agent?.id,
      queryClient,
    ]);


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

    const handleScrollToReactivationRequests = () => {
      reactivationSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      setNewReactivationRequestCount(0);
    };


    const handleOpenProgressModal = (
      requestId?: string | null
    ) => {
      if (!requestId) {
        SweetAlert.errorAlert(
          "Unable to View Progress",
          "Missing reactivation request ID."
        );
        return;
      }

      setSelectedProgressRequestId(requestId);
      setOpenProgressModal(true);
    };

    const handleCloseProgressModal = () => {
      setSelectedProgressRequestId(null);
      setOpenProgressModal(false);
    };

      
    useEffect(() => {
      setDownlinePage(1);
    }, [downlineTab]);


      useEffect(() => {

        const handleNotification = (
          notification: AgentNotification
        ) => {

          setRealtimeNotifications(
            (prev) => [
              notification,
              ...prev,
            ]
          );

          const shouldRefreshSales = [
            "MAINTENANCE_WARNING",
            "AGENT_REASSIGNMENT",
            "REACTIVATION_REQUEST",
            "REACTIVATION_PAYMENT",
            "MAINTENANCE_PROBATION",
            "MAINTENANCE_CREATED",
            "MAINTENANCE_APPROVED",
          ].includes(notification.type);

          if (!shouldRefreshSales) {
            return;
          }

          queryClient.invalidateQueries({
            queryKey: [
              "remaining-sales",
              agent?.id,
            ],
          });

          queryClient.invalidateQueries({
            queryKey: [
              "agent-details",
              agent?.id,
            ],
          });

        };

        socket.on(
          "new-notification",
          handleNotification
        );

        return () => {

          socket.off(
            "new-notification",
            handleNotification
          );
        };

      }, [
        queryClient,
        agent?.id,
      ]);



    const [selectedMonth, setSelectedMonth] =
      useState("");

    const month =
        selectedMonth
          ? Number(
              selectedMonth.split("-")[1]
            )
          : undefined;

      const year =
        selectedMonth
          ? Number(
              selectedMonth.split("-")[0]
            )
          : undefined;
            

    const {data:transactionHistDate, isLoading: isTransactionLoadingDate} = useAgentTransactionsHist({
      agentId:
        user?.agent?.id as string,
        limit:10,
        month,
        year,
    })
    const {data:transactionHist, isLoading: isTransactionLoading} = useAgentTransactionsHist({
      agentId:
        user?.agent?.id as string,
        limit:2,
    })

      const notifications = useMemo(() => {
    
        const merged = [
          ...realtimeNotifications,
          ...(agent?.notifications || []),
        ];
    
        return merged.filter(
          (notification, index, self) =>
            index ===
            self.findIndex(
              (n) =>
                n.id === notification.id
            )
        );
    
      }, [
        realtimeNotifications,
        agent?.notifications,
      ]);

      const unreadCount = useMemo(() => {
      return notifications.filter(
        notification => !notification.isRead
      ).length;
    }, [notifications]);



    const handleCloseModal = () => {

      setOpenTransact(false);

      setShowQr(false)

    };

    const handleOpenNotif = () => {
      setShowNotification(true);

    }

    const handleReadAll = () => {
      SweetAlert.confirmationAlert(
        "Mark all notifications as read?",
        "All unread notifications will be marked as read.",
        async () => {

          if (!user?.agent?.id)
            return;

          try {

            SweetAlert.loadingAlert();

            await markRead(
              user.agent.id
            );

            Swal.close();

            SweetAlert.successAlert(
              "Success",
              "All notifications have been marked as read."
            );

          } catch {

            Swal.close();

            SweetAlert.errorAlert(
              "Error",
              "Failed to update notifications."
            );

          }
        }
      );
    };

    return (
        
        <div
            className="
            relative
            w-full
            flex
            flex-col
            gap-y-custom-32
            
            "
            >


              {newReactivationRequestCount > 0 && (
                <button
                  type="button"
                  onClick={handleScrollToReactivationRequests}
                  className="
                    fixed
                    bottom-6
                    right-5
                    z-50
                    w-12
                    h-12
                    rounded-full
                    bg-lightPrimary
                    text-white
                    shadow-2xl
                    flex
                    items-center
                    justify-center
                    hover:bg-lightPrimary
                    transition
                    cursor-pointer
                  "
                >
                  <ChevronDown size={24} />

                  <span
                    className="
                      absolute
                      -top-2
                      -right-2
                      min-w-5
                      h-5
                      px-1
                      rounded-full
                      bg-negative
                      text-white
                      text-[10px]
                      font-bold
                      flex
                      items-center
                      justify-center
                    "
                  >
                    {newReactivationRequestCount > 99
                      ? "99+"
                      : newReactivationRequestCount}
                  </span>
                </button>
              )}

            {isLoading && (
            <div
                className="
                absolute
                inset-0
                z-50
                flex
                items-center
                justify-center
                rounded-xl
                "
            >
                <div
                className="
                    w-10
                    h-10
                    border-4
                    border-mainPrimary
                    border-t-transparent
                    rounded-full
                    animate-spin
                "
                />
            </div>
            )}
        
            {/* MOBILE / MD TOGGLE BUTTON */}
            {!showNotification && (
            <button
              onClick={() => handleOpenNotif()}
              className="
                md:hidden
                fixed
                top-17
                right-0
                z-20
                w-10
                h-10
                rounded-tl-xl
                rounded-bl-xl
                bg-mainPrimary
                border-y
                border-l
                border-y-white
                text-white
                flex
                items-center
                justify-center
                shadow-lg
                hover:bg-lightPrimary
                transition
                cursor-pointer
              "
            >
                <Bell size={18} />

              {unreadCount > 0 && (
              <span
                className="
                  absolute
                  -top-1
                  -left-1
                  min-w-5
                  h-5
                  px-1
                  rounded-full
                  bg-negative
                  text-white
                  text-[10px]
                  font-bold
                  flex
                  items-center
                  justify-center
                  z-50
                "
              >
                {unreadCount}
                
              </span>
            )}
              </button>
              
            )}

            <div className="
                w-full
                grid
                grid-cols-1
                md:grid-cols-[60%_38%]
                gap-custom-24
                relative
              ">
                <div className="flex flex-col gap-custom-32">
                    <div
                        className="
                        bg-white
                        p-custom-24
                        rounded-xl
                        flex
                        gap-x-custom-24
                        items-start
                        shadow-md
                        "
                    >
                            <div className="flex flex-col items-center justify-center gap-y-custom-16">
            
                                <div className="bg-neutralLight shadow-md flex justify-center items-center p-custom-8 rounded-lg w-fit">

                                    <QRCode
                                        value={user?.agent?.agentCode || ""}
                                        size={80}
                                    />
                                    
                                </div>
            
                                <div className={`
                                  w-full px-custom-16 
                                  text-white text-body 
                                  py-1 
                                  ${agent?.status === "ACTIVE" ? "bg-positive" : agent?.status === "EXPIRED" ? "bg-negative" : agent?.status === "PROBATION" ? "bg-neutralPrimary"  : "bg-secondary"}
                                  
                                  rounded-lg text-center`}>{agent?.status}</div>
                            </div>
            
                        <div className="flex flex-col gap-y-custom-8 relative z-10 w-full ">
            
                            <div className="w-full">
                                <h1
                                    className="
                                    font-bold
                                    text-mainPrimary
                                    text-mdHeader
                                    sm:text-secondaryHeader
                                    capitalize
                                    text-shadow-sm
                                    "
                                >
                                        {user?.agent?.fullName}
                                </h1>
                            </div>
                            <div
                                className="
                                shadow-sm
                                w-full
                                flex
                                justify-start
                                gap-x-custom-16
                                items-center
                                bg-neutralLight
                                p-custom-8
                                rounded-md
                                 text-[12px]
                                 sm:text-body
                                "
                            >
                                <strong
                                className="
                                    text-darkPrimary
            
                                "
                                >
                                ( {user?.agent?.level} )
                                </strong>
                                <h6
                                className="
            
                                    font-bold
                                    text-neutralPrimary
                                "
                                >
                                Agent Level
                                </h6>
                            </div>
                            <div
                                className="
                                shadow-sm
                                w-full
                                flex
                                justify-start
                                gap-x-custom-16
                                items-center
                                bg-neutralLight
                                p-custom-8
                                rounded-md
                                 text-[12px]
                                 sm:text-body
                                "
                            >
                                <strong
                                className="
                                    text-darkPrimary
            
                                "
                                >
                                ( {salesInfo?.remainingSales} )
                                </strong>
                                <h6
                                className="
            
                                    font-bold
                                    text-neutralPrimary
                                "
                                >
                                Remaining Sale
                                </h6>
                            </div>
                        </div>
                    </div>


                    <div className="flex flex-col sm:flex-row-reverse items-center gap-custom-16">
                        
                        <div className="w-full flex sm:flex-col justify-between gap-custom-32  text-white z-10">
                                <button onClick={()=> {setShowQr(true)}} className="bg-neutralPrimary w-full p-custom-8  rounded-xl text-mdHeader hover:bg-neutralMed hover:text-neutralPrimary cursor-pointer  shadow-lg">Show QR</button>
                                <button
                                  onClick={() => setOpenWithdraw(true)}
                                  className="bg-lightPrimary w-full p-custom-8 rounded-xl text-mdHeader hover:bg-neutralMed hover:text-mainPrimary cursor-pointer shadow-lg"
                                >
                                  Withdraw
                                </button>
                        </div>
              

                        <div className="w-full flex justify-center items-center py-custom-16">
                            <div className="relative w-60 h-60 flex items-center justify-center shrink-0 rounded-full shadow-2xl ">
                                    {/* OUTER BLUE */}
                                    <div
                                        className="
                                        absolute
                                        inset-0
                                        rounded-full
                                        bg-lightPrimary
                                        animate-[pulse_1.5s_ease-in-out_infinite]
                                        shadow-[0_0_80px_rgba(59,130,246,1)]
                                        "
                                    />
                                    {/* INNER BLUE GLOW */}
                                    <div
                                        className="
                                        absolute
                                        w-64
                                        h-64
                                        rounded-full
                                        bg-lightPrimary
                                        blur-2xl
                                        opacity-80
                                        animate-pulse
            
                                        "
                                    />
                                        <div
                                        className="
                                        absolute
                                        w-32
                                        h-32
                                        rounded-full
                                        bg-secondary   
                                        blur-2xl
                                        opacity-60        
                                        "
                                    />
                                    {/* YELLOW CENTER GLOW */}
                                    <div
                                        className="
                                        absolute
                                        w-32
                                        h-32
                                        rounded-full
                                        bg-secondary
                                        blur-2xl
                                        opacity-100
                                        animate-[pulse_3s_ease-in-out_infinite]
            
            
            
                                        "
                                    />
                                    <div className="absolute text-white">
                                    {isLoading ? (
                                        <div className="flex flex-col gap-custom-8 justify-center items-center animate-pulse">
                                        
                                        {/* TITLE SKELETON */}
                                        <div className="h-5 w-40 rounded bg-white/30" />

                                        {/* SCORE SKELETON */}
                                        <div className="h-16 w-32 rounded bg-white/30" />

                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-custom-8 justify-center items-center">
                                        <h1 className="text-body">
                                            Accumulated Points
                                        </h1>

                                        <h1 className="text-6xl font-bold">
                                            {agent?.creditScore ?? 0}
                                        </h1>
                                        </div>
                                    )}
                                    </div>
                            </div>
                        </div>


                    </div>


                  <div
                    className="
                      w-full
                      p-custom-24
                      bg-lightPrimary
                      text-white
                      flex
                      flex-col
                      gap-y-custom-24
                      shadow-lg
                      rounded-xl
                    "
                  >
                    <div
                      className="
                        w-full
                        flex
                        justify-between
                        items-center
                        cursor-pointer
                      "
                    >
                      <h6
                        className="
                          text-tertiaryHeader
                          font-bold
                        "
                      >
                        Transaction History
                      </h6>

                      <button 
                        onClick={()=>{setOpenTransact(true)}}
                      className="text-xs">
                        VIEW ALL
                      </button>
                    </div>

                    <div
                      className="
                        flex
                        flex-col
                        gap-y-custom-16
                      "
                    >

                      {isTransactionLoading && (
                        <div
                          className="
                            text-center
                            py-custom-16
                            text-sm
                            animate-pulse
                          "
                        >
                          Loading transactions...
                        </div>
                      )} 

                      {!isTransactionLoading &&
                        transactionHist?.data.length === 0 && (
                          <div
                            className="
                              text-center
                              py-custom-16
                              text-sm
                              text-white/70
                            "
                          >
                            No transaction history
                          </div>
                        )}

                        {transactionHist?.data.map(renderTransactionItem)}

                    </div>

                    <button
                      onClick={()=>{setOpenTransact(true)}}
                      className="
                        w-full
                        border-2
                        border-white
                        p-custom-8
                        rounded-md
                        text-white
                        cursor-pointer
                        hover:bg-white
                        hover:text-mainPrimary
                        hover:font-bold
                        ease-in-out
                        duration-150
                      "
                    >
                      View All Transaction
                    </button>
                  </div>
                </div>
            
              <div
                className="
                  hidden
                  md:flex
                  w-full
                  bg-white
                  max-h-227
                 text-mainPrimary
                  flex-col
                  rounded-xl
                  p-custom-24
                  shadow-xl
                      
                "
              >
                <div className="
                        w-full
                        flex
                        justify-between
                        items-center


                      ">
                  <h2
                    className="
                      text-mdHeader
                      font-bold
                    "
                  >
                    Notifications
                  </h2>
                  
                  <button 
                    disabled={unreadCount <= 0}
                    onClick={()=>{handleReadAll();}}
                      className={`
                      text-xs
                      py-custom-8
                      px-custom-16
                      rounded-xl
                      ease-in-out
                      duration-100
                      ${
                        unreadCount <= 0
                          ? "bg-gray-400 cursor-not-allowed opacity-50"
                          : "bg-mainPrimary text-white cursor-pointer hover:scale-105"
                      }
                    `}>
                    Read All
                  </button>
                  
                </div>
                <div className="mt-6 flex flex-col gap-y-custom-16        max-h-200
                  overflow-y-scroll pr-custom-16">

                {notifications.length === 0 ? (

                  <div
                    className="
                      w-full
                      border
                      border-dashed
                      border-neutralMed
                      rounded-xl
                      p-custom-24
                      text-center
                      text-neutralPrimary
                    "
                  >
                    No notifications found.
                  </div>

                ) : (

                  notifications.map(
                    (notification) => (

                      <div
                        key={`${notification.id}-${notification.createdAt}`}
                        className={`
                          w-full
                          rounded-xl
                          p-custom-16
                          border
                          transition
                          text-sm
                          shadow-md
                          ${
                            notification.isRead
                              ? "border-neutralMed bg-neutralLight"
                              : "border-lightPrimary bg-white/50 cursor-pointer"
                          }
                        `}
                      >

                        {/* HEADER */}
                        <div className="flex items-start justify-between gap-3">

                          <div className="flex flex-col gap-custom-16">

                            <h3
                              className={`
                                font-semibold
                                ${
                                  notification.isRead
                                    ? "text-neutralPrimary"
                                    : "text-mainPrimary"
                                }
                              `}
                            >
                              {notification.title}
                            </h3>

                            <p
                              className="
                                text-xs
                                text-neutralPrimary
                                leading-relaxed
                                pb-custom-8
                              "
                            >
                              {notification.message}
                            </p>

                          </div>

                          {!notification.isRead && (

                            <div
                              className="
                                w-3
                                h-3
                                rounded-full
                                bg-mainPrimary
                                mt-1
                              
                              "
                            />

                          )}

                        </div>

                        {/* FOOTER */}
                        <div
                          className="
                            pt-custom-16
                            border-t
                            border-white/30
                            flex
                            flex-col
                            gap-y-custom-16
                            items-end
                            justify-between
                          "
                        >

                        <span
                            className={`
                              text-xs
                              font-semibold
                              px-3
                              py-1
                              rounded-full
                              ${
                                notification.type ===
                                "MAINTENANCE_WARNING"
                                  ? "bg-yellow-100 text-secondary"
                                  : notification.type ===
                                    "MAINTENANCE_EXPIRED"
                                  ? "bg-red-100 text-negative"
                                  : notification.type ===
                                    "MAINTENANCE_COMPLETED"
                                  ? "bg-green-100 text-positive"
                                  : "bg-blue-100 text-lightPrimary"
                              }
                            `}
                          >

                            
                            {notification.type
                              .replaceAll("_", " ")}
                          </span>


                          {notification.type === "REACTIVATION_PAYMENT" &&
                            notification.actionType === "PROCEED_PAYMENT" && (
                              <button
                                disabled={
                                  isCreatingPayment ||
                                  !notification.entityId ||
                                  notification.actionResult === "PAYMENT_COMPLETED"
                                }
                                onClick={() =>
                                  handleProceedToPayment(notification.entityId)
                                }
                                className={`
                                  text-xs
                                  py-custom-8
                                  px-custom-16
                                  rounded-xl
                                  ease-in-out
                                  duration-100
                                  ${
                                    isCreatingPayment ||
                                    !notification.entityId ||
                                    notification.actionResult === "PAYMENT_COMPLETED"
                                      ? "bg-neutralMed text-neutralPrimary cursor-not-allowed opacity-50"
                                      : "bg-positive text-white cursor-pointer hover:scale-105"
                                  }
                                `}
                              >
                                {notification.actionResult === "PAYMENT_COMPLETED"
                                  ? "Payment Completed"
                                  : isCreatingPayment
                                  ? "Creating Payment..."
                                  : "Proceed to Payment"}
                              </button>
                          )}

                          {notification.entityId &&
                            notification.type === "REACTIVATION_REQUEST" &&
                            (
                              notification.title === "ADMIN REACTIVATION REQUEST SUBMITTED"
                            ) && (
                              <button
                                onClick={() =>
                                  handleOpenProgressModal(notification.entityId)
                                }
                                className="
                                  text-xs
                                  py-custom-8
                                  px-custom-16
                                  rounded-xl
                                  bg-lightPrimary
                                  text-white
                                  cursor-pointer
                                  hover:scale-105
                                  ease-in-out
                                  duration-100
                                "
                              >
                                View Request Progress
                              </button>
                          )}


                          <span
                            className="
                              text-xs
                              text-neutralPrimary
                              w-full
                              text-end
                            "
                          >
                            {new Date(
                              notification.createdAt
                            ).toLocaleString()}
                          </span>
                                
                          

                        </div>

                      </div>
                    )
                  )

                )}

              </div>
              </div>
            </div>

           <div
                ref={reactivationSectionRef}
                className="
                  relative 
                  flex
                  w-full
                  bg-white
                  text-mainPrimary
                  flex-col
                  gap-y-custom-16
                  rounded-xl
                  p-custom-24
                  shadow-xl
                  scroll-mt-24
                "
              >

                <h1 className="
                    text-tertiaryHeader
                    font-bold
                ">
                  Downline Reactivation Request
                </h1>

                  <span
                    className={`
                      absolute
                      top-6
                      left-65
                      min-w-5
                      h-5
                      px-1
                      rounded-full
                      ${newReactivationRequestCount == 0 ?  "bg-mainPrimary" : "bg-negative"}
                      text-white
                      text-[10px]
                      font-bold
                      flex
                      items-center
                      justify-center
                    `}
                  >
                     {newReactivationRequestCount > 99
                      ? "99+"
                      : newReactivationRequestCount}
                  </span>

                        <div>
                        {/* Mobile dropdown */}
                        <div className="md:hidden">
                            <select
                            value={activeTab}
                            onChange={(e) => changeTab(e.target.value as TABKEY)}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm"
                            >
                            {TABS.map((tab) => (
                                <option key={tab.key} value={tab.key}>
                                {tab.label}
                                </option>
                            ))}
                            </select>
                        </div>
                
                        {/* Desktop tabs */}
                        <div className="hidden md:block">
                            <AppsTab
                            tabs={TABS}
                            activeTab={activeTab}
                            changeTab={(key) => changeTab(key as TABKEY)}
                            />
                        </div>
                        </div>
                
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
                            <div className="flex flex-col-reverse md:flex-row justify-between gap-custom-8 items-start  w-full">
                                <div>
                                    <h2 className="font-bold text-mainPrimary capitalize text-mdHeader">
                                    {item.request.agent.fullName}
                                    </h2>

                                    <p className="text-sm text-neutralPrimary text-body">
                                    {item.request.agent.agentCode} • {item.request.agent.level}
                                    </p>
                                </div>

                                <div className="w-full flex items-end justify-end">
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
                            </div>

                            <div className="grid md:grid-cols-3 gap-y-custom-16 justify-between items-end w-full">

                                <div className="flex flex-col gap-custom-8 md:col-span-2">
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


            {shouldShowDownlineTable && (
            <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-neutralMed">
              <div className="px-custom-24 py-custom-16 border-b border-neutralMed flex flex-col md:flex-row md:items-center justify-between gap-custom-16">
                <div>
                  <h2 className="text-mdHeader font-bold text-mainPrimary">
                    Downline Agents
                  </h2>

                  <p className="text-sm text-neutralPrimary">
                    Agents directly under this agent.
                  </p>
                </div>

                {agent?.level === "L1" && (
                  <div className="flex items-center gap-custom-16 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setDownlineTab("L2")}
                      className={`
                        px-custom-16
                        py-custom-8
                        rounded-md
                        text-sm
                        font-semibold
                        transition
                        cursor-pointer
                        hover:scale-105
                        duration-150
                        ease-in-out
                        border
               
                        ${
                          downlineTab === "L2"
                            ? "bg-mainPrimary text-white  border-mainPrimary"
                            : "text-neutralPrimary hover:bg-white  border-neutralPrimary"
                        }
                      `}
                    >
                      Level 2
                    </button>

                    <button
                      type="button"
                      onClick={() => setDownlineTab("L3")}
                      className={`
                        px-custom-16
                        py-custom-8
                        rounded-md
                        text-sm
                        font-semibold
                        transition
                        cursor-pointer
                        hover:scale-105
                        duration-150
                        ease-in-out
                        border
                       
                        ${
                          downlineTab === "L3"
                            ? "bg-mainPrimary text-white  border-mainPrimary"
                            : "text-neutralPrimary hover:bg-white  border-neutralPrimary"
                        }
                      `}
                    >
                      Level 3
                    </button>
                  </div>
                )}
              </div>

              <table className="w-full border-collapse">
                <thead className="bg-white text-tertiaryHeader">
                  <tr className="text-neutralPrimary">
                    <th className="text-left px-custom-24 py-4 font-semibold">
                      Name
                    </th>

                    <th className="text-left px-custom-24 py-4 font-semibold">
                      Level
                    </th>

                    <th className="text-left px-custom-24 py-4 font-semibold">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredDownlines.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="text-center py-10 text-neutralPrimary"
                      >
                        {agent?.level === "L1"
                          ? `No ${downlineTab} downline agents found.`
                          : "No downline agents found."}
                      </td>
                    </tr>
                  ) : (
                    paginatedDownlines.map((downline) => (
                      <tr
                        key={downline.id}
                        className="
                          text-neutralPrimary
                          text-body
                          odd:bg-neutralLight
                        "
                      >
                        <td className="text-left px-6 py-4 font-semibold">
                          {downline.fullName}
                        </td>

                        <td className="text-left px-6 py-4">
                          {downline.level}
                        </td>

                        <td className="text-left px-6 py-4">
                          <span
                            className={`
                              px-custom-16
                              py-custom-8
                              rounded-xl
                              text-xs
                              font-semibold
                              text-white
                              ${
                                downline.status === "ACTIVE"
                                  ? "bg-positive"
                                  : downline.status === "EXPIRED"
                                  ? "bg-negative"
                                  : downline.status === "DROPPED"
                                  ? "bg-darkPrimary"
                                  : downline.status === "SUSPENDED"
                                  ? "bg-secondary"
                                  : "bg-mainPrimary"
                              }
                            `}
                          >
                            {downline.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

                <div
                className="
                  flex
                  flex-col
                  md:flex-row
                  md:items-center
                  justify-between
                  px-custom-24
                  py-custom-24
                  border-t
                  border-neutralMed
                "
              >
                <div className="text-sm text-neutralPrimary">
                  Showing{" "}
                  <span className="font-semibold">
                    {paginatedDownlines.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold">
                    {filteredDownlines.length}
                  </span>{" "}
                  downlines
                </div>

                <div className="flex items-center gap-custom-16">
                  <button
                    type="button"
                    disabled={downlinePage === 1}
                    onClick={() =>
                      setDownlinePage((prev) =>
                        Math.max(prev - 1, 1)
                      )
                    }
                    className="
                      px-custom-16
                      py-custom-8
                      rounded-md
                      border
                      border-neutralMed
                      disabled:opacity-50
                      disabled:cursor-not-allowed
                    "
                  >
                    Previous
                  </button>

                  <span className="font-semibold text-sm">
                    {downlinePage} / {totalDownlinePages}
                  </span>

                  <button
                    type="button"
                    disabled={
                      downlinePage ===
                      totalDownlinePages
                    }
                    onClick={() =>
                      setDownlinePage((prev) =>
                        Math.min(
                          prev + 1,
                          totalDownlinePages
                        )
                      )
                    }
                    className="
                      px-custom-16
                      py-custom-8
                      rounded-md
                      border
                      border-neutralMed
                      disabled:opacity-50
                      disabled:cursor-not-allowed
                    "
                  >
                    Next
                  </button>
                </div>
              </div>

            </div>
          )}


        {showNotification && (
          <div
            className="
              lg:hidden
              fixed
              inset-0
              z-60
              bg-black/40
              backdrop-blur-[2px]
              flex
              justify-end
            "
          >
            {/* SIDEBAR */}
            <div
              className="
                w-[90%]
                sm:w-105
                h-full
                bg-white
                shadow-2xl
                p-custom-24
                animate-in
                slide-in-from-right
                duration-300
                overflow-y-auto
              "
            >
              <div
                className="
                  w-full
                  flex
                  items-center
                  justify-between
                  border-b
                  border-neutralMed
                  pb-4
                "
              >
                <h2
                  className="
                    sm:text-mdHeader
                    font-bold
                    text-mainPrimary
                  "
                >
                  Notifications
                </h2>
                <button
                  onClick={() =>
                    setShowNotification(
                      false
                    )
                  }
                  className="
                    w-8
                    h-8
                    rounded-full
                    bg-neutralLight
                    flex
                    items-center
                    justify-center
                    hover:bg-neutralMed
                    transition
                    cursor-pointer
                  "
                >
                  <X size={15} />
                </button>
              </div>

                <div className="w-full flex justify-end mt-custom-16">
                   <button 
                    disabled={unreadCount <= 0}
                    onClick={()=>{handleReadAll();}}
                      className={`
                      text-xs
                      py-custom-8
                      px-custom-16
                      rounded-xl
                      ease-in-out
                      duration-100
                      ${
                        unreadCount <= 0
                          ? "bg-gray-400 cursor-not-allowed opacity-50"
                          : "bg-mainPrimary text-white cursor-pointer hover:scale-105"
                      }
                    `}>
                    Read All
                  </button>
                </div>



                           <div className="mt-6 flex flex-col gap-y-custom-16">

                {notifications.length === 0 ? (

                  <div
                    className="
                      w-full
                      border
                      border-dashed
                      border-neutralMed
                      rounded-xl
                      p-custom-24
                      text-center
                      text-neutralPrimary
                    "
                  >
                    No notifications found.
                  </div>

                ) : (

                  notifications.map(
                    (notification) => (

                      <div
                        key={`${notification.id}-${notification.createdAt}`}
                        className={`
                          w-full
                          rounded-xl
                          p-custom-16
                          border
                          transition
                          ${
                            notification.isRead
                              ? "border-neutralMed bg-white"
                              : "border-mainPrimary bg-mainPrimary/5"
                          }
                        `}
                      >

                        {/* HEADER */}
                        <div className="flex items-start justify-between gap-3">

                          <div className="flex flex-col gap-1">

                            <h3
                              className={`
                                text-sm
                                font-semibold
                                ${
                                  notification.isRead
                                    ? "text-neutralPrimary"
                                    : "text-mainPrimary"
                                }
                              `}
                            >
                              {notification.title}
                            </h3>

                            <p
                              className="
                                text-xs
                                text-neutralPrimary
                                leading-relaxed
                              "
                            >
                              {notification.message}
                            </p>

                          </div>

                          {!notification.isRead && (

                            <div
                              className="
                                w-3
                                h-3
                                rounded-full
                                bg-mainPrimary
                                mt-1
                              "
                            />

                          )}

                        </div>

                        {/* FOOTER */}
                        <div
                          className="
                            mt-custom-8
                            pt-custom-16
                            border-t
                            border-neutralLight
                            flex
                            flex-wrap-reverse
                            gap-y-custom-8
                            w-full
                            gap-x-custom-16
                            items-start
                            justify-end
                            sm:justify-between
                          "
                        >

                          <span
                            className="
                              text-[10px]
                              text-neutralPrimary
                            "
                          >
                            {new Date(
                              notification.createdAt
                            ).toLocaleString()}
                          </span>

                          <span
                            className={`
                              text-[10px]
                              font-semibold
                              px-3
                              py-1
                              rounded-full
                              ${
                                notification.type ===
                                "MAINTENANCE_WARNING"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : notification.type ===
                                    "MAINTENANCE_EXPIRED"
                                  ? "bg-red-100 text-red-700"
                                  : notification.type ===
                                    "MAINTENANCE_COMPLETED"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-blue-100 text-blue-700"
                              }
                            `}
                          >
                            {notification.type
                              .replaceAll("_", " ")}
                          </span>

                          

                        </div>

                          <div className="w-full flex items-end justify-end pt-custom-16">
                            {notification.type === "REACTIVATION_PAYMENT" &&
                              notification.actionType === "PROCEED_PAYMENT" && (
                                <button
                                  disabled={
                                    isCreatingPayment ||
                                    !notification.entityId ||
                                    notification.actionResult === "PAYMENT_COMPLETED"
                                  }
                                  onClick={() =>
                                    handleProceedToPayment(notification.entityId)
                                  }
                                  className={`
                                    text-xs
                                    py-custom-8
                                    px-custom-16
                                    rounded-xl
                                    ease-in-out
                                    duration-100
                                    ${
                                      isCreatingPayment ||
                                      !notification.entityId ||
                                      notification.actionResult === "PAYMENT_COMPLETED"
                                        ? "bg-neutralMed text-neutralPrimary cursor-not-allowed opacity-50"
                                        : "bg-positive text-white cursor-pointer hover:scale-105"
                                    }
                                  `}
                                >
                                  {notification.actionResult === "PAYMENT_COMPLETED"
                                    ? "Payment Completed"
                                    : isCreatingPayment
                                    ? "Creating Payment..."
                                    : "Proceed to Payment"}
                                </button>
                            )}
                            {notification.entityId &&
                              notification.type === "REACTIVATION_REQUEST" &&
                              (
                                notification.title === "ADMIN REACTIVATION REQUEST SUBMITTED"
                              ) && (
                                <button
                                  onClick={() =>
                                    handleOpenProgressModal(notification.entityId)
                                  }
                                  className="
                                    text-xs
                                    py-custom-8
                                    px-custom-16
                                    rounded-xl
                                    bg-lightPrimary
                                    text-white
                                    cursor-pointer
                                    hover:scale-105
                                    ease-in-out
                                    duration-100
                                  "
                                >
                                  View Request Progress
                                </button>
                            )}
                          </div>
                      </div>
                    )
                  )

                )}

              </div>
            </div>
          </div>
        )}

        {openTransact && (
          <div
            className="
              fixed
              inset-0
              z-999
              bg-black/40
              backdrop-blur-[2px]
              flex
              justify-end
            "
          >
            <div
              className="
                w-full
                sm:w-125
                h-screen
                bg-white
                shadow-2xl
                flex
                flex-col
                animate-in
                slide-in-from-right
                duration-300
                p-custom-24
              "
            >
              {/* HEADER */}
              <div
                className="
                  w-full
                  flex
                  items-center
                  justify-between
                  border-b
                  border-neutralMed
                  pb-4
                "
              >
                <h2
                  className="
                    sm:text-mdHeader
                    font-bold
                    text-mainPrimary
                  "
                >
                  Transactions History
                </h2>
                <button
                  onClick={() =>
                      handleCloseModal()
                  }
                  className="
                    w-8
                    h-8
                    rounded-full
                    bg-neutralLight
                    flex
                    items-center
                    justify-center
                    hover:bg-neutralMed
                    transition
                    cursor-pointer
                  "
                >
                  <X size={15} />
                </button>
              </div>


                {/* CONTENT */}
                <div
                  className="
                    flex-1
                    py-custom-24
               
                  "
                >
                 


                  <div
                    className="
                      w-full
                      h-full                    
                      overflow-y-auto
                      p-custom-16
                      bg-lightPrimary
                      text-white
                      flex
                      flex-col
                      gap-y-custom-24
                      shadow-lg
                      rounded-xl
                      sm:max-h-130
                      2xl:max-h-170
                    "
                  >

                    <div
                      className="
                        flex
                        flex-col
                        gap-y-custom-24
                      "
                    >

                    <div className="flex flex-col gap-2">
                      <div
                        className="
                          relative
                          flex
                          items-center
                        "
                      >
                        <input
                          type="month"
                          value={selectedMonth}
                          onChange={(e) =>
                            setSelectedMonth(
                              e.target.value
                            )
                          }
                          className="
                            w-full
                            bg-white
                            border
                            border-neutralMed
                            rounded-lg
                            px-4
                            py-3
                            shadow-md
                            text-gray-700
                            focus:outline-none
                            focus:border-mainPrimary
                            focus:ring-4
                            focus:ring-mainPrimary/10
                            transition-all
                            duration-200
                          "
                        />
                      </div>
                    </div>

                      {isTransactionLoadingDate && (
                        <div
                          className="
                            text-center
                            py-custom-16
                            text-sm
                            animate-pulse
                          "
                        >
                          Loading transactions...
                        </div>
                      )}

                      {!isTransactionLoadingDate &&
                        transactionHistDate?.data.length === 0 && (
                          <div
                            className="
                              text-center
                              py-custom-16
                              text-sm
                              text-white/70
                            "
                          >
                            No transaction history
                          </div>
                        )}


                      {transactionHistDate?.data.map(renderTransactionItem)}
                     
                    </div>

                  </div>


                 
                </div>
            </div>
          </div>
        )}



        {openProgressModal && (
          <MainModal
            size="lg"
            onClose={handleCloseProgressModal}
          >
            <div className="w-full flex flex-col gap-y-custom-24 p-custom-32">
              <div className="border-b border-neutralMed pb-custom-16">
                <h2 className="text-mdHeader font-bold text-mainPrimary">
                  Reactivation Progress
                </h2>

                <p className="text-sm text-neutralPrimary">
                  View the approval steps for this reactivation request.
                </p>
              </div>

              {isProgressLoading && (
                <div className="text-center py-custom-32 text-neutralPrimary">
                  Loading approval progress...
                </div>
              )}

              {!isProgressLoading && progressData && (
                <>
                  <div className="bg-neutralLight rounded-xl p-custom-16">
                    <p className="text-xs text-neutralPrimary">
                      Request Status
                    </p>

                    <h3 className="font-bold text-mainPrimary">
                      {progressData.requestStatus}
                    </h3>
                  </div>

                  <div className="flex flex-col gap-y-custom-16">
                    {progressData.approvals.map((approval) => (
                      <div
                        key={approval.id}
                        className="
                          border
                          border-neutralMed
                          rounded-xl
                          p-custom-16
                          flex
                          flex-col
                          gap-y-custom-8
                        "
                      >
                        <div className="flex justify-between items-start gap-custom-16">
                          <div>
                            <h3 className="font-bold text-mainPrimary">
                              {approval.reviewerType.replaceAll("_", " ")}
                            </h3>

                            <p className="text-xs text-neutralPrimary">
                              Order #{approval.approvalOrder}
                            </p>
                          </div>

                          <span
                            className={`
                              text-xs
                              font-bold
                              px-custom-16
                              py-1
                              rounded-full
                              text-white
                              ${
                                approval.status === "APPROVED"
                                  ? "bg-positive"
                                  : approval.status === "REJECTED"
                                  ? "bg-negative"
                                  : "bg-secondary"
                              }
                            `}
                          >
                            {approval.status}
                          </span>
                        </div>

                        <div className="text-sm text-neutralPrimary">
                          Reviewer:{" "}
                          <span className="font-semibold text-mainPrimary">
                            {approval.reviewerAgent?.fullName ??
                              approval.reviewerUser?.name ??
                              "Pending reviewer"}
                          </span>
                        </div>

                        <div className="text-xs text-neutralPrimary">
                          Assigned:{" "}
                          {new Date(
                            approval.assignedAt
                          ).toLocaleString()}
                        </div>

                        <div className="text-xs text-neutralPrimary">
                          Reviewed:{" "}
                          {approval.reviewedAt
                            ? new Date(
                                approval.reviewedAt
                              ).toLocaleString()
                            : "-"}
                        </div>

                        {approval.remarks && (
                          <div className="text-sm bg-white rounded-lg p-custom-12 text-neutralPrimary">
                            Remarks: {approval.remarks}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </MainModal>
        )}


        {openWithdraw && (
          <MainModal
            size="sm"
            onClose={() => setOpenWithdraw(false)}
          >
            <form
              onSubmit={handleSubmitWithdrawal}
              className="w-full flex flex-col gap-y-custom-16 p-custom-24"
            >
              <div>
                <h2 className="text-mdHeader font-bold text-mainPrimary">
                  Withdraw Commission
                </h2>

                <p className="text-sm text-neutralPrimary">
                  Submit a withdrawal request. Admin will review and process your payout.
                </p>
              </div>

              <div className="flex flex-col gap-y-custom-8">
                <label className="text-sm font-semibold text-mainPrimary">
                  Amount
                </label>

                <input
                  type="number"
                  min="1"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full border border-neutralMed rounded-lg px-4 py-3 text-neutralPrimary"
                />
              </div>

              <div className="flex flex-col gap-y-custom-8">
                <label className="text-sm font-semibold text-mainPrimary">
                  Payout Method
                </label>

                <div
                  className="
                    w-full
                    border
                    border-neutralMed
                    rounded-lg
                    px-4
                    py-3
                    bg-neutralLight
                    text-mainPrimary
                    font-semibold
                  "
                >
                  GCash
                </div>
              </div>

              <div className="flex flex-col gap-y-custom-8">
                <label className="text-sm font-semibold text-mainPrimary">
                  Account Name
                </label>

                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Registered account name"
                  className="
                    w-full
                    border
                    border-neutralMed
                    rounded-lg
                    px-4
                    py-3
                    text-neutralPrimary
                  "
                />
              </div>

              <div className="flex flex-col gap-y-custom-8">
                <label className="text-sm font-semibold text-mainPrimary">
                  Account Number
                </label>

                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="GCash Number"
                  className="
                    w-full
                    border
                    border-neutralMed
                    rounded-lg
                    px-4
                    py-3
                    text-neutralPrimary
                  "
                />
              </div>

              <button
                type="submit"
                disabled={isCreatingWithdrawal}
                className="
                  w-full
                  bg-mainPrimary
                  text-white
                  rounded-lg
                  py-custom-16
                  font-bold
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                "
              >
                {isCreatingWithdrawal
                  ? "Sending Request..."
                  : "Send Withdrawal Request"}
              </button>
            </form>
          </MainModal>
        )}

        {showQr &&(
            <MainModal 
              size="xs"
              onClose={handleCloseModal}
              showCloseButton={false}
            >
              <div className="w-full flex justify-center items-center py-custom-32">
                  <QRCode
                  value={user?.agent?.agentCode || ""}
                    size={250}
                  />
              </div>
            </MainModal>
        )}
        </div>
    );
    }