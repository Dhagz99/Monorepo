// // maintenanceWarning.cron.ts

// import cron from "node-cron";

// import prisma from "../lib/prisma";

// import {
//   emitNotification
// } from "../socket/socketEmitter";

// export const maintenanceWarningCron =
//   cron.schedule(
//     "00 00 * * *",
//     async () => {

//       console.log(
//         "Running maintenance warning cron..."
//       );

//       const now = new Date();

//       const currentMonth =
//         now.getMonth() + 1;

//       const currentYear =
//         now.getFullYear();

//       const lastDay =
//         new Date(
//           currentYear,
//           currentMonth,
//           0
//         ).getDate();

//       const today =
//         now.getDate();

//       const remainingDays =
//         lastDay - today;

//       let title = "";

//       let message = "";


//       if (remainingDays === 7) {

//         title =
//           "Maintenance Reminder";

//         message =
//           "You have 7 days remaining to complete your sales maintenance.";
//       }


//       else if (
//         remainingDays === 3
//       ) {

//         title =
//           "Maintenance Warning";

//         message =
//           "You only have 3 days remaining to complete your sales maintenance.";
//       }


//       else if (
//         remainingDays === 1
//       ) {

//         title =
//           "Final Maintenance Notice";

//         message =
//           "Today is the final day to complete your sales maintenance.";
//       }

//       else {

//         return;
//       }

//       const cycles =
//         await prisma.agentMaintenanceCycle.findMany({

//           where: {

//             status: "ACTIVE",

//             isCompleted: false,

//             cycleMonth:
//               currentMonth,

//             cycleYear:
//               currentYear,
//           },
//         });

//       const notifications =
//         cycles.map(
//           (cycle) => ({
//             agentId:
//               cycle.agentId,

//             type:
//               "MAINTENANCE_WARNING" as const,

//             title,

//             message,
//           })
//         );


//     for (const notification of notifications) {

//       const createdNotification =
//         await prisma.agentNotification.create({

//           data: {
//             agentId:
//               notification.agentId,

//             type:
//               notification.type,

//             title:
//               notification.title,

//             message:
//               notification.message,
//           },
//         });

//       emitNotification(
//         notification.agentId,
//         createdNotification
//       );
//     }

//       console.log(
//         "Maintenance notifications sent."
//       );
//     }
//   );



import cron from "node-cron";

import {
  processMaintenanceWarnings,
} from "./maintenanceWarning.processor";

export const maintenanceWarningCron =
  cron.schedule(
    "0 0 * * *",
    async () => {

      try {

        await processMaintenanceWarnings();

      } catch (error) {

        console.error(
          "Maintenance Warning Cron Error:",
          error
        );
      }
    }
  );