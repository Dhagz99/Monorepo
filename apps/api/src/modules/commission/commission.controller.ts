import {
  Request,
  Response,
} from "express";
import { createCommissionScan, scannedAgent, updateCommissionRuleService } from "./commission.service";
import { WithdrawalStatus } from "../../../generated/prisma";


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
        payoutChannel,
        gcashNumber,
        checkNumber,
      } = req.body;

      if (
        !clientId ||
        !agentId ||
        !branchId ||
        !scannedBy
      ) {
        return res.status(400).json({
          message:
            "clientId, agentId, branchId, and scannedBy are required.",
        });
      }

      if (
        payoutChannel !== "GCASH" &&
        payoutChannel !== "CHECK"
      ) {
        return res.status(400).json({
          message:
            "Payout channel must be GCASH or CHECK.",
        });
      }

      const normalizedCheckNumber =
        typeof checkNumber === "string"
          ? checkNumber.trim()
          : "";

      if (
        payoutChannel === "CHECK" &&
        !normalizedCheckNumber
      ) {
        return res.status(400).json({
          message:
            "Check number is required for CHECK payouts.",
        });
      }

      const result =
        await createCommissionScan({
          clientId,
          agentId,
          branchId,
          scannedBy,
          payoutChannel,
          gcashNumber: 
            payoutChannel === "GCASH"
            ? gcashNumber
            : undefined,
          checkNumber:
            payoutChannel === "CHECK"
              ? normalizedCheckNumber
              : undefined,
        });

        return res.status(201).json({
          success: true,
          message:
            result.payoutStatus ===
            WithdrawalStatus.FAILED
              ? "Commission created, but the GCash payout failed."
              : "Commission created successfully.",
          data: result,
        });
    } catch (error) {
      console.error(
        "CREATE COMMISSION ERROR:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Failed to create commission.";

      const badRequestErrors = [
        "Agent not found",
        "Client not found",
        "Invalid payout channel",
        "Check number is required for CHECK payouts",
        "No active maintenance cycle found",
        "No active probation request found",
      ];

      const statusCode =
        badRequestErrors.includes(message)
          ? 400
          : 500;

      return res.status(statusCode).json({
        message,
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