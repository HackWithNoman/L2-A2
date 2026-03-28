import { Request, Response } from "express";
import { vehicleServices } from "./vehicles.service";

const createVehicleIntoDb = async (req: Request, res: Response) => {
  try {
    const result = await vehicleServices.createVehicleIntoDb(req.body);

    return res.status(201).json({
      success: true,
      message: "Vehicle created successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

const getVehiclesFromDb = async (req: Request, res: Response) => {
  try {
    const result = await vehicleServices.getVehiclesFromDb();

    return res.status(200).json({
      success: true,
      message: "Vehicle retrived successfully",
      data: result.rows,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

const getSingleVehicle = async (req: Request, res: Response) => {
  try {
    const { vehicleId } = req.params;
    const result = await vehicleServices.getVehicleFromDb(vehicleId as string);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vehicle retrieved successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateVehicle = async (req: Request, res: Response) => {
  try {
    const { vehicleId } = req.params;
    const updateData = req.body;

    const result = await vehicleServices.updateVehicleInDb(
      vehicleId as string,
      updateData,
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteVehicle = async (req: Request, res: Response) => {
  try {
    const { vehicleId } = req.params;

    const result = await vehicleServices.deleteVehicleFromDb(
      vehicleId as string,
    );

    return res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    const statusCode = error.message.includes("active bookings") ? 400 : 500;

    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

export const vehicleController = {
  createVehicleIntoDb,
  getVehiclesFromDb,
  getSingleVehicle,
  updateVehicle,
  deleteVehicle,
};
