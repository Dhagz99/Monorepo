import cron from "node-cron";

import {
  processProbationRequests,
} from "./maintenanceWarning.processor";

export const maintenanceReactivationCron =
  cron.schedule(
   "55 15 * * *",
    async () => {

      try {

        await processProbationRequests();

      } catch (error) {

        console.error(
          "Probation Processing Cron Error:",
          error
        );
      }
    }
  );