import { pool } from "../../config/db.js";

interface BookingPayload {
  vehicle_id: number;
  rent_start_date: string;
  rent_end_date: string;
}

const createBookingInDb = async (customerId: number, payload: BookingPayload) => {
  const { vehicle_id, rent_start_date, rent_end_date } = payload;

  // 1. Check if vehicle exists and is available
  const vehicleResult = await pool.query(
    "SELECT * FROM vehicles WHERE id = $1",
    [vehicle_id],
  );

  if (vehicleResult.rowCount === 0) {
    const error = new Error("Vehicle not found") as Error & { statusCode: number };
    error.statusCode = 404;
    throw error;
  }

  const vehicle = vehicleResult.rows[0];

  if (!vehicle.vehicle_name) {
    const error = new Error("Vehicle data is incomplete") as Error & { statusCode: number };
    error.statusCode = 400;
    throw error;
  }

  if (vehicle.availability_status !== "available") {
    const error = new Error("Vehicle is already booked for these dates") as Error & { statusCode: number };
    error.statusCode = 400;
    throw error;
  }

  // 2. Calculate total price
  const start = new Date(rent_start_date);
  const end = new Date(rent_end_date);
  const diffInTime = end.getTime() - start.getTime();
  const diffInDays = Math.ceil(diffInTime / (1000 * 3600 * 24));

  if (diffInDays <= 0) {
    const error = new Error("End date must be after start date") as Error & { statusCode: number };
    error.statusCode = 400;
    throw error;
  }

  const totalPrice = diffInDays * vehicle.daily_rent_price; // ✅ fixed field name

  // 3. Create the booking
  const newBooking = await pool.query(
    `INSERT INTO bookings (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status)
     VALUES ($1, $2, $3, $4, $5, 'active') RETURNING *`,
    [customerId, vehicle_id, rent_start_date, rent_end_date, totalPrice],
  );

  // 4. Update vehicle status to 'booked'
  await pool.query(
    "UPDATE vehicles SET availability_status = 'booked' WHERE id = $1",
    [vehicle_id],
  );

  // 5. Return shaped response matching API spec
  return {
    ...newBooking.rows[0],
    vehicle: {
      vehicle_name: vehicle.vehicle_name,
      daily_rent_price: vehicle.daily_rent_price,
    },
  };
};

const getBookingsFromDb = async (userId: number, role: string) => {
  let query = `
    SELECT 
      b.id, b.rent_start_date, b.rent_end_date, b.total_price, b.status,
      c.name as customer_name, c.email as customer_email, c.phone as customer_phone,
      v.vehicle_name, v.type, v.registration_number, v.daily_rent_price
    FROM bookings b
    JOIN users c ON b.customer_id = c.id
    JOIN vehicles v ON b.vehicle_id = v.id
  `;

  if (role === "user") {
    query += ` WHERE b.customer_id = $1 ORDER BY b.id DESC`;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  query += ` ORDER BY b.id DESC`;
  const result = await pool.query(query);
  return result.rows;
};

interface UpdatePayload {
  bookingId: string;
  role: string;
}

const updateBookingInDb = async (userId: number, payload: UpdatePayload) => {
  const { bookingId, role } = payload;

  const bookingResult = await pool.query(
    "SELECT * FROM bookings WHERE id = $1",
    [bookingId],
  );

  if (bookingResult.rowCount === 0) {
    const error = new Error("Booking not found") as Error & { statusCode: number };
    error.statusCode = 404;
    throw error;
  }

  const booking = bookingResult.rows[0];

  if (role === "user") {
    if (booking.customer_id !== userId) {
      const error = new Error("You can only cancel your own bookings") as Error & { statusCode: number };
      error.statusCode = 403;
      throw error;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(booking.rent_start_date);

    if (today >= startDate) {
      const error = new Error("Cannot cancel booking after start date") as Error & { statusCode: number };
      error.statusCode = 400;
      throw error;
    }

    await pool.query(
      "UPDATE bookings SET status = 'cancelled' WHERE id = $1",
      [bookingId],
    );

    await pool.query(
      "UPDATE vehicles SET availability_status = 'available' WHERE id = $1",
      [booking.vehicle_id],
    );

    return { 
      message: "Booking cancelled successfully",
      booking: {
        ...booking,
        status: "cancelled"
      }
    };
  }

  if (role === "admin") {
    await pool.query(
      "UPDATE bookings SET status = 'returned' WHERE id = $1",
      [bookingId],
    );

    await pool.query(
      "UPDATE vehicles SET availability_status = 'available' WHERE id = $1",
      [booking.vehicle_id],
    );

    return { 
      message: "Booking marked as returned. Vehicle is now available",
      booking: {
        ...booking,
        status: "returned",
        vehicle: {
          availability_status: "available"
        }
      }
    };
  }

  const error = new Error("Invalid role") as Error & { statusCode: number };
  error.statusCode = 400;
  throw error;
};

export const bookingServices = {
  createBookingInDb,
  getBookingsFromDb,
  updateBookingInDb,
};
