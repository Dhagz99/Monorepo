
// import { NotificationType, ActionResult, NotificationActionType } from "../../../generated/prisma";
// import { xenditConfig } from "../../config/xendit.config";

// import prisma from "../../lib/prisma";
// import { createXenditPaymentSession } from "../../services/xendit/xendit.service";
// import { emitNotification } from "../../socket/socketEmitter";

// export const createMyReactivationPaymentSessionService = async (
//   userId: number,
//   requestId: string
// ) => {
//   const user = await prisma.user.findUnique({
//     where: {
//       id: userId,
//     },
//     include: {
//       agent: true,
//     },
//   });

//   if (!user?.agent) {
//     throw new Error("Agent account not found.");
//   }

//   const request = await prisma.agentReactivationRequest.findFirst({
//     where: {
//       id: requestId,
//       agentId: user.agent.id,
//       status: {
//         in: [
//           "APPROVED_WAITING_PAYMENT",
//           "PAYMENT_PENDING",
//           "PROBATION",
//         ],
//       },
//     },
//     include: {
//       agent: true,
//       payment: true,
//     },
//   });

//   if (!request) {
//     throw new Error("Invalid or expired reactivation payment request.");
//   }

//   if (!request.payment) {
//     throw new Error("Payment record not found. Please contact support.");
//   }

//   if (
//     request.payment.status === "PAID" ||
//     request.status === "PROBATION"
//   ) {
//     return {
//       requestId: request.id,
//       paymentId: request.payment.id,
//       checkoutUrl: null,
//       alreadyPaid: true,
//       message: "This reactivation payment is already paid.",
//     };
//   }

//   return createReactivationPaymentSessionService(userId, request.id);
// };

// export const createReactivationPaymentSessionService = async (
//   userId: number,
//   requestId: string
// ) => {
//   const user = await prisma.user.findUnique({
//     where: {
//       id: userId,
//     },
//     include: {
//       agent: true,
//     },
//   });

//   if (!user?.agent) {
//     throw new Error("Agent account not found.");
//   }

//   const request = await prisma.agentReactivationRequest.findFirst({
//     where: {
//       id: requestId,
//       agentId: user.agent.id,
//       status: {
//         in: [
//           "APPROVED_WAITING_PAYMENT",
//           "PAYMENT_PENDING",
//           "PROBATION",
//         ],
//       },
//     },
//     include: {
//       agent: true,
//       payment: true,
//     },
//   });

//   if (!request) {
//     throw new Error("Reactivation request is not ready for payment.");
//   }

//   if (!request.payment) {
//     throw new Error("Payment record not found. Please contact support.");
//   }

//   if (request.payment.status === "PAID" || request.status === "PROBATION") {
//     return {
//       requestId: request.id,
//       paymentId: request.payment.id,
//       checkoutUrl: null,
//       alreadyPaid: true,
//       message: "This reactivation payment is already paid.",
//     };
//   }

//   // idempotency: return existing link instead of creating duplicate session
//   if (request.payment.checkoutUrl) {
//     return {
//       requestId: request.id,
//       paymentId: request.payment.id,
//       checkoutUrl: request.payment.checkoutUrl,
//       alreadyPaid: false,
//       message: "Existing payment checkout URL returned.",
//     };
//   }

//   const referenceId =
//     request.payment.xenditReferenceId ?? `reactivation_${request.id}`;

//   const paymentSession = await createXenditPaymentSession({
//     referenceId,
//     amount: Number(request.payment.amount),
//     customer: {
//       id: request.agent.id,
//       fullName: request.agent.fullName,
//       email: request.agent.email,
//     },
//     successUrl: `${xenditConfig.webAppUrl}/reactivation/payment-success?requestId=${request.id}`,
//     cancelUrl: `${xenditConfig.webAppUrl}/reactivation/payment-cancelled?requestId=${request.id}`,
//   });

//   const updatedPayment = await prisma.agentReactivationPayment.update({
//     where: {
//       requestId: request.id,
//     },
//     data: {
//       checkoutUrl: paymentSession.payment_link_url,
//       xenditPaymentSessionId: paymentSession.payment_session_id,
//       xenditReferenceId: paymentSession.reference_id,
//       rawResponse: paymentSession,
//       status: "PENDING",
//     },
//   });

//   await prisma.agentReactivationRequest.update({
//     where: {
//       id: request.id,
//     },
//     data: {
//       status: "PAYMENT_PENDING",
//     },
//   });

//   return {
//     requestId: request.id,
//     paymentId: updatedPayment.id,
//     checkoutUrl: updatedPayment.checkoutUrl,
//     alreadyPaid: false,
//     message: "Payment session created successfully.",
//   };
// };

// export const handleXenditWebhookService = async (payload: any) => {
//   const event = payload.event;
//   const data = payload.data ?? payload;

//   if (event !== "payment_session.completed") {
//     return {
//       ignored: true,
//       reason: "Unhandled event.",
//     };
//   }

//   const paymentSessionId = data.payment_session_id ?? data.id;
//   const referenceId = data.reference_id;

//   if (!paymentSessionId && !referenceId) {
//     throw new Error("Missing payment session identifier.");
//   }

//   const payment = await prisma.agentReactivationPayment.findFirst({
//     where: {
//       OR: [
//         {
//           xenditPaymentSessionId: paymentSessionId,
//         },
//         {
//           xenditReferenceId: referenceId,
//         },
//       ],
//     },
//     include: {
//       request: true,
//     },
//   });

//   if (!payment) {
//     throw new Error("Reactivation payment not found.");
//   }

//   const now = new Date();

//   const result = await prisma.$transaction(async (tx) => {
//     const currentPayment =
//       await tx.agentReactivationPayment.findUnique({
//         where: {
//           id: payment.id,
//         },
//         select: {
//           id: true,
//           status: true,
//           agentId: true,
//           requestId: true,
//         },
//       });

//     if (!currentPayment) {
//       throw new Error("Payment not found.");
//     }

//     // webhook idempotency
//     if (currentPayment.status === "PAID") {
//       return {
//         alreadyProcessed: true,
//         notification: null,
//       };
//     }

//     await tx.agentReactivationPayment.update({
//       where: {
//         id: currentPayment.id,
//       },
//       data: {
//         status: "PAID",
//         paidAt: now,
//         rawWebhook: payload,
//       },
//     });

//     await tx.agentReactivationRequest.update({
//       where: {
//         id: currentPayment.requestId,
//       },
//       data: {
//         status: "PROBATION",
//         requiredSales: 3,
//         probationStartedAt: now,
//         probationEndsAt: new Date(
//           now.getTime() + 60 * 24 * 60 * 60 * 1000
//         ),
//       },
//     });

//     await tx.agent.update({
//       where: {
//         id: currentPayment.agentId,
//       },
//       data: {
//         status: "PROBATION",
//       },
//     });

//     await tx.agentNotification.updateMany({
//         where: {
//           actionType: NotificationActionType.PROCEED_PAYMENT,
//           actionResult: ActionResult.PAYMENT_PENDING,
//           entityId: currentPayment.requestId,
//         },
//         data: {
//           actionResult: ActionResult.PAYMENT_COMPLETED,
//         },
//     })

//     const notification = await tx.agentNotification.create({
//       data: {
//         agentId: currentPayment.agentId,
//         type: NotificationType.MAINTENANCE_PROBATION,
//         title: "REACTIVATION PAYMENT CONFIRMED",
//         message:
//           "Your ₱500 reactivation payment has been confirmed. You are now under probation period.",
//       },
//     });

//     return {
//       alreadyProcessed: false,
//       notification,
//     };
//   });

//   if (result.notification) {
//     emitNotification(result.notification.agentId, {
//       id: result.notification.id,
//       title: result.notification.title,
//       message: result.notification.message,
//       type: result.notification.type,
//       isRead: result.notification.isRead,
//       createdAt: result.notification.createdAt,
//     });
//   }

//   return {
//     success: true,
//     alreadyProcessed: result.alreadyProcessed,
//     paymentId: payment.id,
//   };
// };



import {
  NotificationType,
  ActionResult,
  NotificationActionType,
  CompanyExpenseType,
  CompanyExpenseSource,
} from "../../../generated/prisma";
import { xenditConfig } from "../../config/xendit.config";
import prisma from "../../lib/prisma";
import { createXenditPaymentSession } from "../../services/xendit/xendit.service";
import {
  emitNotification,
  emitAdminPaymentUpdated,
} from "../../socket/socketEmitter";

const XENDIT_PAYMENT_FEE_RATE = 0.023;

const calculateCompanyPaymentFee = (amount: number) => {
  return Number((amount * XENDIT_PAYMENT_FEE_RATE).toFixed(2));
};


export const createMyReactivationPaymentSessionService = async (
  userId: number,
  requestId: string
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      agent: true,
    },
  });

  if (!user?.agent) {
    throw new Error("Agent account not found.");
  }

  const request = await prisma.agentReactivationRequest.findFirst({
    where: {
      id: requestId,
      agentId: user.agent.id,
      status: {
        in: [
          "APPROVED_WAITING_PAYMENT",
          "PAYMENT_PENDING",
          "PROBATION",
        ],
      },
    },
    include: {
      agent: true,
      payment: true,
    },
  });

  if (!request) {
    throw new Error("Invalid or expired reactivation payment request.");
  }

  if (!request.payment) {
    throw new Error("Payment record not found. Please contact support.");
  }

  if (
    request.payment.status === "PAID" ||
    request.status === "PROBATION"
  ) {
    return {
      requestId: request.id,
      paymentId: request.payment.id,
      checkoutUrl: null,
      alreadyPaid: true,
      message: "This reactivation payment is already paid.",
    };
  }

  return createReactivationPaymentSessionService(
    userId,
    request.id
  );
};

export const createReactivationPaymentSessionService = async (
  userId: number,
  requestId: string
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      agent: true,
    },
  });

  if (!user?.agent) {
    throw new Error("Agent account not found.");
  }

  const request = await prisma.agentReactivationRequest.findFirst({
    where: {
      id: requestId,
      agentId: user.agent.id,
      status: {
        in: [
          "APPROVED_WAITING_PAYMENT",
          "PAYMENT_PENDING",
          "PROBATION",
        ],
      },
    },
    include: {
      agent: true,
      payment: true,
    },
  });

  if (!request) {
    throw new Error("Reactivation request is not ready for payment.");
  }

  if (!request.payment) {
    throw new Error("Payment record not found. Please contact support.");
  }

  if (
    request.payment.status === "PAID" ||
    request.status === "PROBATION"
  ) {
    return {
      requestId: request.id,
      paymentId: request.payment.id,
      checkoutUrl: null,
      alreadyPaid: true,
      message: "This reactivation payment is already paid.",
    };
  }

  if (request.payment.checkoutUrl) {
    return {
      requestId: request.id,
      paymentId: request.payment.id,
      checkoutUrl: request.payment.checkoutUrl,
      alreadyPaid: false,
      message: "Existing payment checkout URL returned.",
    };
  }

  const referenceId =
    request.payment.xenditReferenceId ??
    `reactivation_${request.id}`;

  const paymentSession = await createXenditPaymentSession({
    referenceId,
    amount: Number(request.payment.amount),
    customer: {
      id: request.agent.id,
      fullName: request.agent.fullName,
      email: request.agent.email,
    },
    successUrl: `${xenditConfig.webAppUrl}/reactivation/payment-success?requestId=${request.id}`,
    cancelUrl: `${xenditConfig.webAppUrl}/reactivation/payment-cancelled?requestId=${request.id}`,
  });

  const updatedPayment = await prisma.agentReactivationPayment.update({
    where: {
      requestId: request.id,
    },
    data: {
      checkoutUrl: paymentSession.payment_link_url,
      xenditPaymentSessionId: paymentSession.payment_session_id,
      xenditReferenceId: paymentSession.reference_id,
      rawResponse: paymentSession,
      status: "PENDING",
    },
  });

  await prisma.agentReactivationRequest.update({
    where: {
      id: request.id,
    },
    data: {
      status: "PAYMENT_PENDING",
    },
  });

  return {
    requestId: request.id,
    paymentId: updatedPayment.id,
    checkoutUrl: updatedPayment.checkoutUrl,
    alreadyPaid: false,
    message: "Payment session created successfully.",
  };
};

// export const handleXenditWebhookService = async (
//   payload: any
// ) => {
//   const event = payload.event;
//   const data = payload.data ?? payload;

//   if (event !== "payment_session.completed") {
//     return {
//       ignored: true,
//       reason: "Unhandled event.",
//     };
//   }

//   const paymentSessionId =
//     data.payment_session_id ?? data.id;

//   const referenceId = data.reference_id;

//   if (!paymentSessionId && !referenceId) {
//     throw new Error("Missing payment session identifier.");
//   }

//   const payment =
//     await prisma.agentReactivationPayment.findFirst({
//       where: {
//         OR: [
//           {
//             xenditPaymentSessionId: paymentSessionId,
//           },
//           {
//             xenditReferenceId: referenceId,
//           },
//         ],
//       },
//     });

//   if (!payment) {
//     throw new Error("Reactivation payment not found.");
//   }

//   const now = new Date();

//   const result = await prisma.$transaction(async (tx) => {
//     const currentPayment =
//       await tx.agentReactivationPayment.findUnique({
//         where: {
//           id: payment.id,
//         },
//         select: {
//           id: true,
//           status: true,
//           agentId: true,
//           requestId: true,
//         },
//       });

//     if (!currentPayment) {
//       throw new Error("Payment not found.");
//     }

//     if (currentPayment.status === "PAID") {
//       return {
//         alreadyProcessed: true,
//         notification: null,
//         paymentUpdate: null,
//       };
//     }

//     const updatedPayment =
//       await tx.agentReactivationPayment.update({
//         where: {
//           id: currentPayment.id,
//         },
//         data: {
//           status: "PAID",
//           paidAt: now,
//           rawWebhook: payload,
//         },
//         include: {
//           agent: {
//             select: {
//               id: true,
//               fullName: true,
//               agentCode: true,
//               level: true,
//             },
//           },
//           request: {
//             select: {
//               id: true,
//               status: true,
//               requestType: true,
//               requestedAt: true,
//             },
//           },
//         },
//       });

//     await tx.agentReactivationRequest.update({
//       where: {
//         id: currentPayment.requestId,
//       },
//       data: {
//         status: "PROBATION",
//         requiredSales: 3,
//         probationStartedAt: now,
//         probationEndsAt: new Date(
//           now.getTime() + 60 * 24 * 60 * 60 * 1000
//         ),
//       },
//     });

//     await tx.agent.update({
//       where: {
//         id: currentPayment.agentId,
//       },
//       data: {
//         status: "PROBATION",
//       },
//     });

//     await tx.agentNotification.updateMany({
//       where: {
//         actionType: NotificationActionType.PROCEED_PAYMENT,
//         actionResult: ActionResult.PAYMENT_PENDING,
//         entityId: currentPayment.requestId,
//       },
//       data: {
//         actionResult: ActionResult.PAYMENT_COMPLETED,
//       },
//     });

//     const notification =
//       await tx.agentNotification.create({
//         data: {
//           agentId: currentPayment.agentId,
//           type: NotificationType.MAINTENANCE_PROBATION,
//           title: "REACTIVATION PAYMENT CONFIRMED",
//           message:
//             "Your ₱500 reactivation payment has been confirmed. You are now under probation period.",
//         },
//       });

//     return {
//       alreadyProcessed: false,
//       notification,
//       paymentUpdate: {
//         paymentId: updatedPayment.id,
//         requestId: updatedPayment.requestId,
//         agentId: updatedPayment.agentId,
//         status: updatedPayment.status,
//         title: "Payment Updated",
//         message: `${updatedPayment.agent.fullName}'s reactivation payment is now PAID.`,
//         createdAt: now,
//       },
//     };
//   });

//   if (result.notification) {
//     emitNotification(result.notification.agentId, {
//       id: result.notification.id,
//       title: result.notification.title,
//       message: result.notification.message,
//       type: result.notification.type,
//       isRead: result.notification.isRead,
//       createdAt: result.notification.createdAt,
//     });
//   }

//   if (result.paymentUpdate) {
//     emitAdminPaymentUpdated(result.paymentUpdate);
//   }

//   return {
//     success: true,
//     alreadyProcessed: result.alreadyProcessed,
//     paymentId: payment.id,
//   };
// };


export const handleXenditWebhookService = async (
  payload: any
) => {
  const event = payload.event;
  const data = payload.data ?? payload;

  if (event !== "payment_session.completed") {
    return {
      ignored: true,
      reason: "Unhandled event.",
    };
  }

  const paymentSessionId =
    data.payment_session_id ?? data.id;

  const referenceId = data.reference_id;

  if (!paymentSessionId && !referenceId) {
    throw new Error("Missing payment session identifier.");
  }

  const payment =
    await prisma.agentReactivationPayment.findFirst({
      where: {
        OR: [
          {
            xenditPaymentSessionId: paymentSessionId,
          },
          {
            xenditReferenceId: referenceId,
          },
        ],
      },
    });

  if (!payment) {
    throw new Error("Reactivation payment not found.");
  }

  const now = new Date();

  const result = await prisma.$transaction(async (tx) => {
    const currentPayment =
      await tx.agentReactivationPayment.findUnique({
        where: {
          id: payment.id,
        },
        select: {
          id: true,
          status: true,
          agentId: true,
          requestId: true,
          amount: true,
          xenditPaymentSessionId: true,
          xenditReferenceId: true,
        },
      });

    if (!currentPayment) {
      throw new Error("Payment not found.");
    }

    if (currentPayment.status === "PAID") {
      return {
        alreadyProcessed: true,
        notification: null,
        paymentUpdate: null,
      };
    }

    const updatedPayment =
      await tx.agentReactivationPayment.update({
        where: {
          id: currentPayment.id,
        },
        data: {
          status: "PAID",
          paidAt: now,
          rawWebhook: payload,
        },
        include: {
          agent: {
            select: {
              id: true,
              fullName: true,
              agentCode: true,
              level: true,
            },
          },
          request: {
            select: {
              id: true,
              status: true,
              requestType: true,
              requestedAt: true,
            },
          },
        },
      });

    await tx.agentReactivationRequest.update({
      where: {
        id: currentPayment.requestId,
      },
      data: {
        status: "PROBATION",
        requiredSales: 3,
        probationStartedAt: now,
        probationEndsAt: new Date(
          now.getTime() + 60 * 24 * 60 * 60 * 1000
        ),
      },
    });

    await tx.agent.update({
      where: {
        id: currentPayment.agentId,
      },
      data: {
        status: "PROBATION",
      },
    });

    await tx.agentNotification.updateMany({
      where: {
        actionType: NotificationActionType.PROCEED_PAYMENT,
        actionResult: ActionResult.PAYMENT_PENDING,
        entityId: currentPayment.requestId,
      },
      data: {
        actionResult: ActionResult.PAYMENT_COMPLETED,
      },
    });

    const notification =
      await tx.agentNotification.create({
        data: {
          agentId: currentPayment.agentId,
          type: NotificationType.MAINTENANCE_PROBATION,
          title: "REACTIVATION PAYMENT CONFIRMED",
          message:
            "Your ₱500 reactivation payment has been confirmed. You are now under probation period.",
        },
      });

    const paymentAmount =
      Number(currentPayment.amount ?? 500);

    const companyFee =
      calculateCompanyPaymentFee(paymentAmount);

    const existingExpense =
      await tx.companyExpenseLog.findFirst({
        where: {
          type: CompanyExpenseType.XENDIT_PAYMENT_FEE,
          sourceType:
            CompanyExpenseSource.REACTIVATION_PAYMENT,
          sourceId: currentPayment.id,
        },
      });

    if (!existingExpense) {
      await tx.companyExpenseLog.create({
        data: {
          type: CompanyExpenseType.XENDIT_PAYMENT_FEE,
          sourceType:
            CompanyExpenseSource.REACTIVATION_PAYMENT,
          sourceId: currentPayment.id,
          amount: companyFee,
          rate: XENDIT_PAYMENT_FEE_RATE,
          description: `Xendit payment fee for reactivation payment ${currentPayment.id}`,
          createdBy: null,
          rawData: {
            paymentAmount,
            agentId: currentPayment.agentId,
            requestId: currentPayment.requestId,
            xenditPaymentSessionId:
              paymentSessionId ??
              currentPayment.xenditPaymentSessionId,
            xenditReferenceId:
              referenceId ??
              currentPayment.xenditReferenceId,
          },
        },
      });
    }

    return {
      alreadyProcessed: false,
      notification,
      paymentUpdate: {
        paymentId: updatedPayment.id,
        requestId: updatedPayment.requestId,
        agentId: updatedPayment.agentId,
        status: updatedPayment.status,
        title: "Payment Updated",
        message: `${updatedPayment.agent.fullName}'s reactivation payment is now PAID.`,
        createdAt: now,
      },
    };
  });

  if (result.notification) {
    emitNotification(result.notification.agentId, {
      id: result.notification.id,
      title: result.notification.title,
      message: result.notification.message,
      type: result.notification.type,
      isRead: result.notification.isRead,
      createdAt: result.notification.createdAt,
    });
  }

  if (result.paymentUpdate) {
    emitAdminPaymentUpdated(result.paymentUpdate);
  }

  return {
    success: true,
    alreadyProcessed: result.alreadyProcessed,
    paymentId: payment.id,
  };
};