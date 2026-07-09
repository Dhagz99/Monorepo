import { Request, Response } from "express";
import { getAvailableReassignmentUplines, getDroppedAgentDownlines, getDroppedAgents, reassignDownlines } from "./reassignment.service";

export const getDroppedAgentsController = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      page,
      limit,
      search,
    } = req.query;

    const result =
      await getDroppedAgents({
        page: page
          ? Number(page)
          : 1,

        limit: limit
          ? Number(limit)
          : 10,

        search:
          typeof search === "string"
            ? search
            : undefined,
      });

    return res.status(200).json(result);

  } catch (error) {
    return res.status(400).json({
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch dropped agents.",
    });
  }
};

export const getDroppedAgentDownlinesController =
  async (req: Request, res: Response) => {
    try {
      const { droppedAgentId } = req.params;

      const result =
        await getDroppedAgentDownlines(droppedAgentId);

      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch affected downlines.",
      });
    }
  };
export const getAvailableReassignmentUplinesController =
  async (req: Request, res: Response) => {
    try {
      const { droppedAgentId } = req.params;

      const rawDownlineAgentIds =
        req.query.downlineAgentIds;

      const downlineAgentIds =
        typeof rawDownlineAgentIds === "string" &&
        rawDownlineAgentIds.trim()
          ? rawDownlineAgentIds.split(",")
          : [];

      const result =
        await getAvailableReassignmentUplines(
          droppedAgentId,
          downlineAgentIds
        );

      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch available uplines.",
      });
    }
  };

export const reassignDownlinesController =
  async (req: Request, res: Response) => {
    try {
      const adminUserId = (req as any).user.id;

      const {
        droppedAgentId,
        newUplineId,
        downlineAgentIds,
        reason,
      } = req.body;

      if (!droppedAgentId) {
        return res.status(400).json({
          message: "Dropped agent ID is required.",
        });
      }

      if (!newUplineId) {
        return res.status(400).json({
          message: "New upline ID is required.",
        });
      }

      if (
        !Array.isArray(downlineAgentIds) ||
        downlineAgentIds.length === 0
      ) {
        return res.status(400).json({
          message: "Please select at least one downline.",
        });
      }

      const result = await reassignDownlines({
        droppedAgentId,
        newUplineId,
        downlineAgentIds,
        reassignedById: adminUserId,
        reason,
      });

      return res.status(200).json({
        message: "Downlines reassigned successfully.",
        data: result,
      });
    } catch (error) {
      return res.status(400).json({
        message:
          error instanceof Error
            ? error.message
            : "Failed to reassign downlines.",
      });
    }
  };