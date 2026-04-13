import { Request, Response, NextFunction } from "express";
import { authServices } from "./auth.service.js";

const createUserIntoDb = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authServices.createUserIntoDb(req.body);
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
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

const loginuserIntoDB = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authServices.loginuserIntoDB(
      req.body.email,
      req.body.password,
    );
    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

export const authController = {
  createUserIntoDb,
  loginuserIntoDB,
};
