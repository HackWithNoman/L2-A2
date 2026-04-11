import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../../config/db";

const createUserIntoDb = async (payload: Record<string, unknown>) => {
  const { name, email, password, phone, role } = payload;

  const hashPassword = await bcrypt.hash(password as string, 12);

  const result = await pool.query(
    `
    INSERT INTO users(name, email, password, phone, role) VALUES($1, $2, $3, $4, $5) RETURNING name, email, phone, role, created_at, updated_at
    `,
    [name, email, hashPassword, phone, role],
  );

  return result;
};

const loginuserIntoDB = async (email: string, password: string) => {
  const user = await pool.query(
    `
      SELECT * FROM users WHERE email=$1
      `,
    [email],
  );

  if (user.rows.length === 0) {
    throw new Error("User not found!!");
  }

  const matchPasword = await bcrypt.compare(password, user.rows[0].password);

  if (!matchPasword) {
    throw new Error("Invalid Credentials!!");
  }

  const jwtPayload = {
    id: user.rows[0].id,
    name: user.rows[0].name,
    email: user.rows[0].email,
    role: user.rows[0].role,
  };

  const secret = process.env.JWT_SECRET as string;

  const token = jwt.sign(jwtPayload, secret, { expiresIn: "7d" });

  return {
    token,
    user: {
      id: user.rows[0].id,
      name: user.rows[0].name,
      email: user.rows[0].email,
      phone: user.rows[0].phone,
      role: user.rows[0].role,
      age: user.rows[0].age,
      created_at: user.rows[0].created_at,
      updated_at: user.rows[0].updated_at,
    },
  };
};

export const authServices = {
  createUserIntoDb,
  loginuserIntoDB,
};
