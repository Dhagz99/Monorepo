"use client";

import { useAuth } from "@/components/context/UserContext";
import { useAgentDetails,useAgentTransactionsHist, useMarkNotificationsRead, useRemainingSales } from "@/hooks/agents/useAgent";
import { AgentNotification } from "@repo/shared";
import { Bell, X } from "lucide-react";
import { useMemo, useState } from "react";
import QRCode from "react-qr-code";
import { socket } from "@/lib/socket";
import { useEffect } from "react";
import MainModal from "@/components/modal/mainModal";
import SweetAlert from "@/components/modal/Swal";
import Swal from "sweetalert2";
import { useQueryClient } from "@tanstack/react-query";




export default function AgentProfile() {

    const { user } = useAuth();

    const {data: agent, isLoading} = useAgentDetails({agentId:user?.agent?.id as string});

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

    const [showNotification, setShowNotification] =
      useState(false);


        useEffect(() => {

        if (!agent?.id) return;

        socket.emit(
          "join-agent-room",
          agent.id
        );

      }, [agent?.id]);



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
            "MAINTENANCE_REACTIVATE",
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


    // useEffect(() => {
    //   socket.on(
    //     "new-notification",
    //     (notification: AgentNotification) => {
    //       setRealtimeNotifications(
    //         (prev) => [
    //           notification,
    //           ...prev,
    //         ]
    //       );

    //     }
    //   );

    //   return () => {
    //     socket.off(
    //       "new-notification"
    //     );
    //   };
    // }, []);

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
        limit:5,
        month,
        year,
    })
    const {data:transactionHist, isLoading: isTransactionLoading} = useAgentTransactionsHist({
      agentId:
        user?.agent?.id as string,
        limit:5,
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
                                  ${agent?.status === "ACTIVE" ? "bg-positive":agent?.status === "EXPIRED" ? "bg-negative" : "bg-secondary"}
                                  
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
                                <button className="bg-lightPrimary w-full p-custom-8 rounded-xl text-mdHeader hover:bg-neutralMed hover:text-mainPrimary cursor-pointer shadow-lg">Withdraw</button>
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

                      {transactionHist?.data.map(
                        (transaction) => (

                          <div
                            key={transaction.id}
                            className="
                              w-full
                              border-y
                              border-white/10
                              rounded-xl
                              p-custom-16
                              flex
                              flex-col
                              gap-y-custom-8
                              hover:bg-white/15
                              transition
                              cursor-pointer
                            "
                          >

                            <div
                              className="
                                flex
                                justify-between
                                items-start
                                gap-custom-16
                              "
                            >

                              <div
                                className="
                                  flex
                                  flex-col
                                  gap-y-1
                                "
                              >

                                <h1
                                  className="
                                    text-body
                                    font-bold
                                  "
                                >
                                  ₱
                                  {Number(
                                    transaction.commissionAmount
                                  ).toLocaleString()}
                                </h1>

                                <p
                                  className="
                                    text-xs
                                    text-white/70
                                  "
                                >
                                  {
                                    transaction.sourceAgent
                                      .fullName
                                  }
                                </p>

                              </div>

                              <div
                                className="
                                  text-right
                                  flex
                                  flex-col
                                  gap-y-1
                                "
                              >

                                <p
                                  className="
                                    text-xs
                                    font-semibold
                                  "
                                >
                                  {
                                    transaction.commissionType
                                  }
                                </p>

                                <p
                                  className="
                                    text-[11px]
                                    text-white/70
                                  "
                                >
                                  {new Date(
                                    transaction.createdAt
                                  ).toLocaleDateString()}
                                </p>

                              </div>

                            </div>

                            {transaction.remarks && (
                              <p
                                className="
                                  text-xs
                                  text-white/80
                                  border-t
                                  border-white/10
                                  pt-2
                                "
                              >
                                {transaction.remarks}
                              </p>
                            )}

                          </div>
                        )
                      )}
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

                      {transactionHistDate?.data.map(
                        (transaction) => (

                          <div
                            key={transaction.id}
                            className="
                              w-full
                              border-y
                              border-white/10
                              rounded-xl
                              p-custom-16
                              flex
                              flex-col
                              gap-y-custom-8
                              hover:bg-white/15
                              transition
                              cursor-pointer
                            "
                          >

                            <div
                              className="
                                flex
                                justify-between
                                items-start
                                gap-custom-16
                              "
                            >

                              <div
                                className="
                                  flex
                                  flex-col
                                  gap-y-1
                                "
                              >

                                <h1
                                  className="
                                    text-body
                                    font-bold
                                  "
                                >
                                  ₱
                                  {Number(
                                    transaction.commissionAmount
                                  ).toLocaleString()}
                                </h1>

                                <p
                                  className="
                                    text-xs
                                    text-white/70
                                  "
                                >
                                  {
                                    transaction.sourceAgent
                                      .fullName
                                  }
                                </p>

                              </div>

                              <div
                                className="
                                  text-right
                                  flex
                                  flex-col
                                  gap-y-1
                                "
                              >

                                <p
                                  className="
                                    text-xs
                                    font-semibold
                                  "
                                >
                                  {
                                    transaction.commissionType
                                  }
                                </p>

                                <p
                                  className="
                                    text-[11px]
                                    text-white/70
                                  "
                                >
                                  {new Date(
                                    transaction.createdAt
                                  ).toLocaleDateString()}
                                </p>

                              </div>

                            </div>

                            {transaction.remarks && (
                              <p
                                className="
                                  text-xs
                                  text-white/80
                                  border-t
                                  border-white/10
                                  pt-2
                                "
                              >
                                {transaction.remarks}
                              </p>
                            )}

                          </div>
                        )
                      )}
                    </div>

                  </div>


                 
                </div>
            </div>
          </div>
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