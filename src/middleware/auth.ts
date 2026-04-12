import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { pool } from "../config/db.js";

const auth = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const bearerHeader = req.headers.authorization;

    const bearer = bearerHeader!.split(" ");
    const token = bearer[1];

    if (!token) {
      throw new Error("You are not authorized!!");
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
      throw new Error("User's not found!!");
    }

    req.user = decoded;

    if (roles.length && !roles.includes(decoded.role)) {
      throw new Error("You are not authorized!!");
    }

    next();
  };
};

export default auth;
