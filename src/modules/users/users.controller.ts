import { Request, Response } from "express";
import { userServices } from "./users.services.js";

const getAllUsersFromDb = async (req: Request, res: Response) => {
  try {
    const result = await userServices.getAllUsersFromDb();

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: result.rows,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params; // string | undefined
    const loggedInUser = req.user; // Might be undefined
    const updateData = req.body;

    // Fix 1 & 2: Guard check to satisfy TypeScript
    if (!loggedInUser || !userId) {
      return res.status(400).json({
        success: false,
        message: "User context or ID missing",
      });
    }

    // Now TypeScript knows loggedInUser and userId are safe to use
    if (loggedInUser.role !== "admin" && loggedInUser.id !== Number(userId)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this profile",
      });
    }

    // Logic: Prevent non-admins from changing roles
    if (loggedInUser.role !== "admin" && updateData.role) {
      delete updateData.role;
    }

    // Pass userId as a guaranteed string
    const result = await userServices.updateUserInDb(
      userId as string,
      updateData,
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Call service to handle the logic
    const result = await userServices.deleteUserFromDb(userId as string);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

export const userController = {
  getAllUsersFromDb,
  updateUser,
  deleteUser,
};
