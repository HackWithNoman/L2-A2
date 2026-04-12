import express, { Application, Request, Response } from "express";
import config from "./config/index.js";
import { initDB } from "./config/db.js";
import { authRoute } from "./modules/auth/auth.route.js";
import { bookingRoute } from "./modules/bookings/bookings.route.js";
import { userRoute } from "./modules/users/users.route.js";
import { vehicleRoute } from "./modules/vehicles/vehicles.route.js";

const port = config.port || 3000;

const app: Application = express();
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json("Assignment 2 - Backend (API)");
});

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/vehicles", vehicleRoute);
app.use("/api/v1/bookings", bookingRoute);

let dbInitialized = false;

async function ensureDbInitialized() {
  if (!dbInitialized && config.connection_str) {
    try {
      await initDB();
      dbInitialized = true;
    } catch (error) {
      console.error("DB init error:", error);
    }
  }
}

if (process.env.VERCEL === undefined) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app;

export const handler = async (req: Request, res: Response) => {
  await ensureDbInitialized();
  return app(req, res);
};