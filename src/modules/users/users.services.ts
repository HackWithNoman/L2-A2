import { pool } from "../../config/db.js";

const getAllUsersFromDb = async () => {
  const result = await pool.query(`SELECT id, name, email, phone, role, created_at, updated_at FROM users`);
  return result;
};

const updateUserInDb = async (id: string, payload: any) => {
  const { name, email, role } = payload;

  const result = await pool.query(
    `
    UPDATE users
    SET
      name = COALESCE($1, name),
      email = COALESCE($2, email),
      role = COALESCE($3, role)
    WHERE id = $4
    RETURNING *;
    `,
    [name, email, role, id],
  );

  return result;
};

const deleteUserFromDb = async (id: string) => {
  // 1. Check if the user has any active bookings
  const activeBookings = await pool.query(
    `SELECT * FROM bookings WHERE customer_id = $1 AND status = 'active'
`,
    [id],
  );

  if (activeBookings.rows.length > 0) {
    const error = new Error("Cannot delete user: They have active bookings.") as Error & { statusCode: number };
    error.statusCode = 400;
    throw error;
  }

  // 2. If no active bookings, proceed to delete the user
  const result = await pool.query(
    `DELETE FROM users WHERE id = $1 RETURNING *`,
    [id],
  );

  if (result.rowCount === 0) {
    const error = new Error("User not found.") as Error & { statusCode: number };
    error.statusCode = 404;
    throw error;
  }

  return result;
};

export const userServices = {
  getAllUsersFromDb,
  updateUserInDb,
  deleteUserFromDb,
};
