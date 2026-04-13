import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { pool } from "../config/db.js";

const auth = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const bearerHeader = req.headers.authorization;

      if (!bearerHeader) {
        const error = new Error("You are not authorized!!") as Error & { statusCode: number };
        error.statusCode = 401;
        throw error;
      }

      const bearer = bearerHeader.split(" ");
      const token = bearer[1];

      if (!token) {
        const error = new Error("You are not authorized!!") as Error & { statusCode: number };
        error.statusCode = 401;
        throw error;
      }

      const secret = "a-string-secret-at-least-256-bits-long";

      const decoded = jwt.verify(token, secret) as JwtPayload;

      const user = await pool.query(
        `
        SELECT * FROM users WHERE email=$1
        `,
        [decoded.email],
      );

      if (user.rows.length === 0) {
        const error = new Error("User not found!!") as Error & { statusCode: number };
        error.statusCode = 404;
        throw error;
      }

      req.user = decoded;

      if (roles.length && !roles.includes(decoded.role)) {
        const error = new Error("You are not authorized!!") as Error & { statusCode: number };
        error.statusCode = 403;
        throw error;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;