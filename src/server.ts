import app from "./app";
import config from "./config";
import initDB from "./config/db";
import { authRoute } from "./modules/auth/auth.route";
import { bookingRoute } from "./modules/bookings/bookings.route";
import { userRoute } from "./modules/users/users.route";
import { vehicleRoute } from "./modules/vehicles/vehicles.route";

const port = config.port;

initDB();

app.use("/api/v1/auth", authRoute);

app.use("/api/v1/users", userRoute);

app.use("/api/v1/vehicles", vehicleRoute);

app.use("/api/v1/bookings", bookingRoute);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
