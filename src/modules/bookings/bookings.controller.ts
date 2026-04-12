import { Request, Response } from "express";
import { bookingServices } from "./bookings.service.js";

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

    if (role === "admin") {
      res.status(200).json({
        success: true,
        message: "Bookings retrieved successfully",
        data: bookings.map((b: any) => ({
          id: b.id,
          customer_id: b.customer_id,
          vehicle_id: b.vehicle_id,
          rent_start_date: b.rent_start_date,
          rent_end_date: b.rent_end_date,
          total_price: b.total_price,
          status: b.status,
          customer: {
            name: b.customer_name,
            email: b.customer_email,
          },
          vehicle: {
            vehicle_name: b.vehicle_name,
            registration_number: b.registration_number,
          },
        })),
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Your bookings retrieved successfully",
      data: bookings.map((b: any) => ({
        id: b.id,
        vehicle_id: b.vehicle_id,
        rent_start_date: b.rent_start_date,
        rent_end_date: b.rent_end_date,
        total_price: b.total_price,
        status: b.status,
        vehicle: {
          vehicle_name: b.vehicle_name,
          registration_number: b.registration_number,
          type: b.type,
        },
      })),
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
    const { status } = req.body;
    const user = req.user!;
    const userId = user.id as number;
    const role = user.role as string;

    if (!bookingId) {
      res.status(400).json({
        success: false,
        message: "bookingId is required",
      });
      return;
    }

    if (role === "user" && status !== "cancelled") {
      res.status(400).json({
        success: false,
        message: "Customers can only cancel bookings",
      });
      return;
    }

    if (role === "admin" && status !== "returned") {
      res.status(400).json({
        success: false,
        message: "Admins can only mark bookings as returned",
      });
      return;
    }

    const result = await bookingServices.updateBookingInDb(userId, {
      bookingId,
      role,
    });

    if (role === "user") {
      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          ...result.booking,
          status: "cancelled"
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: result.message,
      data: result.booking,
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
