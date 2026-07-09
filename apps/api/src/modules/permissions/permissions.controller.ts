import { Request, Response, NextFunction } from "express";
import { getPermissionManagementService, updateRolePermissionsSettingService } from "./permissions.service";



export const getPermissionManagementController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await getPermissionManagementService();

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const updateRolePermissionsSettingController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const roleId = Number(req.body.roleId);
    const permissionIds = req.body.permissionIds;

    if (!roleId || Number.isNaN(roleId)) {
      return res.status(400).json({
        success: false,
        message: "Valid roleId is required.",
      });
    }

    if (!Array.isArray(permissionIds)) {
      return res.status(400).json({
        success: false,
        message: "permissionIds must be an array.",
      });
    }

    const data = await updateRolePermissionsSettingService(
      roleId,
      permissionIds
    );

    return res.status(200).json({
      success: true,
      message: "Role permissions updated successfully.",
      data,
    });
  } catch (error) {
    next(error);
  }
};