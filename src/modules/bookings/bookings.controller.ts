import { Request, Response } from "express";
import { bookingServices } from "./bookings.service";

const createBooking = async (req: Request, res: Response) => {
  try {
    const { vehicle_id, rent_start_date, rent_end_date } = req.body;
    const customerId = req.user!.id as number;

    if (!vehicle_id || !rent_start_date || !rent_end_date) {
      res.status(400).json({
        success: false,
        message: "vehicle_id, rent_start_date and rent_end_date are required",
      });
      return;
    }

    const booking = await bookingServices.createBookingInDb(customerId, {
      vehicle_id,
      rent_start_date,
      rent_end_date,
    });

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error: any) {
    const knownErrors = [
      "Vehicle not found",
      "Vehicle data is incomplete",
      "Vehicle is already booked for these dates",
      "End date must be after start date",
    ];

    if (knownErrors.includes(error.message)) {
      res.status(400).json({
        success: false,
        message: error.message,
        errors: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      errors: error.message,
    });
  }
};

const getBookings = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const userId = user.id as number;
    const role = user.role as string;

    const bookings = await bookingServices.getBookingsFromDb(userId, role);

    res.status(200).json({
      success: true,
      message: "Bookings retrieved successfully",
      data: bookings,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      errors: error.message,
    });
  }
};

const updateBooking = async (req: Request, res: Response) => {
  try {
    const bookingId = req.params["bookingId"];
    if (!bookingId) {
      res.status(400).json({
        success: false,
        message: "bookingId is required",
      });
      return;
    }
    const user = req.user!;
    const userId = user.id as number;
    const role = user.role as string;

    const result = await bookingServices.updateBookingInDb(userId, {
      bookingId,
      role,
    });

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    const knownErrors = [
      "Booking not found",
      "You can only cancel your own bookings",
      "Cannot cancel booking after start date",
    ];

    if (knownErrors.includes(error.message)) {
      res.status(400).json({
        success: false,
        message: error.message,
        errors: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      errors: error.message,
    });
  }
};

export const bookingControllers = {
  createBooking,
  getBookings,
  updateBooking,
};
