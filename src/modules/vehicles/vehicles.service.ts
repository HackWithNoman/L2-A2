import { pool } from "../../config/db.js";

interface TVehicle {
  vehicle_name: string;
  type: string;
  registration_number: string;
  daily_rent_price: number;
  availability_status: string;
}

const createVehicleIntoDb = async (payload: TVehicle) => {
  const {
    vehicle_name,
    type,
    registration_number,
    daily_rent_price,
    availability_status,
  } = payload;

  const result = await pool.query(
    `
    INSERT INTO vehicles (vehicle_name,
    type,
    registration_number,
    daily_rent_price,
    availability_status)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
    `,
    [
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status,
    ],
  );

  return result;
};

const getVehiclesFromDb = async () => {
  const result = await pool.query(
    `
    SELECT * FROM vehicles
    `,
  );
  return result;
};

const getVehicleFromDb = async (id: string) => {
  const result = await pool.query(`SELECT * FROM vehicles WHERE id = $1`, [id]);
  return result;
};

interface TUpdateVehicle {
  vehicle_name?: string;
  type?: string;
  registration_number?: string;
  daily_rent_price?: number;
  availability_status?: string;
}

const updateVehicleInDb = async (id: string, payload: TUpdateVehicle) => {
  const { vehicle_name, type, registration_number, daily_rent_price, availability_status } = payload;

  const result = await pool.query(
    `
    UPDATE vehicles
    SET
      vehicle_name = COALESCE($1, vehicle_name),
      type = COALESCE($2, type),
      registration_number = COALESCE($3, registration_number),
      daily_rent_price = COALESCE($4, daily_rent_price),
      availability_status = COALESCE($5, availability_status)
    WHERE id = $6
    RETURNING *;
    `,
    [vehicle_name, type, registration_number, daily_rent_price, availability_status, id],
  );

  return result;
};

const deleteVehicleFromDb = async (id: string) => {
  const activeBookings = await pool.query(
    `SELECT * FROM bookings WHERE vehicle_id = $1 AND status = 'active'`,
    [id],
  );

  if (activeBookings.rows.length > 0) {
    const error = new Error("Cannot delete vehicle: It has active bookings.") as Error & { statusCode: number };
    error.statusCode = 400;
    throw error;
  }

  const result = await pool.query(
    `DELETE FROM vehicles WHERE id = $1 RETURNING *`,
    [id],
  );

  if (result.rowCount === 0) {
    const error = new Error("Vehicle not found.") as Error & { statusCode: number };
    error.statusCode = 404;
    throw error;
  }

  return result;
};

export const vehicleServices = {
  createVehicleIntoDb,
  getVehiclesFromDb,
  getVehicleFromDb,
  updateVehicleInDb,
  deleteVehicleFromDb,
};
