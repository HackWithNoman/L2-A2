import { pool } from "../../config/db";

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
  daily_rent_price?: number;
  availability_status?: boolean;
}

const updateVehicleInDb = async (id: string, payload: TUpdateVehicle) => {
  const { vehicle_name, daily_rent_price, availability_status } = payload;

  const result = await pool.query(
    `
    UPDATE vehicles
    SET
      vehicle_name = COALESCE($1, vehicle_name),
      daily_rent_price = COALESCE($2, daily_rent_price),
      availability_status = COALESCE($3, availability_status)
    WHERE id = $4
    RETURNING *;
    `,
    [vehicle_name, daily_rent_price, availability_status, id],
  );

  return result;
};

const deleteVehicleFromDb = async (id: string) => {
  const activeBookings = await pool.query(
    `SELECT * FROM vehicles WHERE id = $1 AND availability_status = 'booked'`,
    [id],
  );

  if (activeBookings.rows.length > 0) {
    throw new Error("Cannot delete vehicle: It is currently booked.");
  }

  const result = await pool.query(
    `DELETE FROM vehicles WHERE id = $1 RETURNING *`,
    [id],
  );

  if (result.rowCount === 0) {
    throw new Error("Vehicle not found.");
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
