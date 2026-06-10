import {
  Request,
  Response,
} from "express";
import { createCommissionScan, scannedAgent, updateCommissionRuleService } from "./commission.service";


export const scannedAgentController =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const {
        agentCode,
        clientId
      } = req.query;

      if (
        typeof agentCode !==
        "string" || typeof clientId !== "string"
      ) {
        return res
          .status(400)
          .json({
            message:
              "Agent code is required",
          });
      }

      const result =
        await scannedAgent(
          agentCode,
          clientId
        );

      return res
        .status(200)
        .json(result);

    } catch (error) {

      console.error(
        "SCANNED AGENT ERROR:",
        error
      );

      if (
        error instanceof Error
      ) {
        return res
          .status(404)
          .json({
            message:
              error.message,
          });
      }

      return res
        .status(500)
        .json({
          message:
            "Failed to fetch scanned agent",
        });
    }
  };



  export const createCommissionScanController =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const {
        clientId,
        agentId,
        branchId,
        scannedBy,
      } = req.body;

      if (
        !clientId ||
        !agentId ||
        !branchId
      ) {
        return res
          .status(400)
          .json({
            message:
              "clientId, agentId and branchId are required",
          });
      }

      const result =
        await createCommissionScan({
          clientId,
          agentId,
          branchId,
          scannedBy,
        });

      return res
        .status(201)
        .json({
          message:
            "Commission successfully created",
          data: result,
        });

    } catch (error) {

      console.error(
        "CREATE COMMISSION ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          message:
            error instanceof Error
              ? error.message
              : "Failed to create commission",
        });
    }
  };





export const updateCommissionRuleController =
  async (
    req: Request,
    res: Response
  ) => {
    try {

      const {
        id,
        sspAmount,
        piraRate,
      } = req.body;

      const result =
        await updateCommissionRuleService({
          id,
          sspAmount,
          piraRate,
        });

      return res.status(200).json({
        success: true,
        message:
          "Commission rule updated successfully",
        data: result,
      });

    } catch (error) {

      console.error(
        "UPDATE COMMISSION RULE ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update commission rule",
      });
    }
  };