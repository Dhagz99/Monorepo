// // cron/index.ts

// import { maintenanceResetCron } from "./maintenanceReset.cron";
// import { maintenanceWarningCron } from "./maintenanceWarning.cron";

// export const initializeCrons =
//   () => {

//     maintenanceResetCron.start();

//     maintenanceWarningCron.start();

//     console.log(
//       "Cron jobs initialized."
//     );
//   };/



// cron/index.ts

import { maintenanceResetCron }
  from "./maintenanceReset.cron";

import { maintenanceWarningCron }
  from "./maintenanceWarning.cron";

import { maintenanceReactivationCron }
  from "./maintenance.Reactivation";

import {
  processMaintenanceCycles
} from "./maintenance.processor";

import {
  processMaintenanceWarnings
} from "./maintenanceWarning.processor";

import {
  processProbationRequests
} from "./maintenanceWarning.processor";

export const initializeCrons =
  async () => {

    try {

      // Recover missed maintenance cycles
      await processMaintenanceCycles();

      // Recover missed warning notifications
      await processMaintenanceWarnings();

      // // Recover missed probation processing
      // await processProbationRequests();

      maintenanceResetCron.start();

      maintenanceWarningCron.start();

      maintenanceReactivationCron.start();

      console.log(
        "Cron jobs initialized."
      );

    } catch (error) {

      console.error(
        "Cron initialization failed:",
        error
      );
    }
  };