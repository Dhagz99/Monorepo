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

import { maintenanceResetCron } from "./maintenanceReset.cron";
import { maintenanceWarningCron } from "./maintenanceWarning.cron";

import { processMaintenanceCycles }
  from "./maintenance.processor";
import { processMaintenanceWarnings } from "./maintenanceWarning.processor";

export const initializeCrons =
  async () => {

    // Recover missed maintenance cycles
    await processMaintenanceCycles();

    await processMaintenanceWarnings();

    maintenanceResetCron.start();

    maintenanceWarningCron.start();

    console.log(
      "Cron jobs initialized."
    );
  };