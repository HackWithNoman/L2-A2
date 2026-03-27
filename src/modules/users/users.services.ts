import { pool } from "../../config/db";

const getAllUsersFromDb = async () => {
  const result = await pool.query(`SELECT * FROM users`);
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
    throw new Error("Cannot delete user: They have active bookings.");
  }

  // 2. If no active bookings, proceed to delete the user
  const result = await pool.query(
    `DELETE FROM users WHERE id = $1 RETURNING *`,
    [id],
  );

  if (result.rowCount === 0) {
    throw new Error("User not found.");
  }

  return result;
};

export const userServices = {
  getAllUsersFromDb,
  updateUserInDb,
  deleteUserFromDb,
};
