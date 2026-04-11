import { Router } from "express";
import auth from "../../middleware/auth";
import { bookingControllers } from "./bookings.controller";

const router = Router();

router.post("/", auth("admin", "user"), bookingControllers.createBooking);
router.get("/", auth("admin", "user"), bookingControllers.getBookings);
router.put("/:bookingId", auth("admin", "user"), bookingControllers.updateBooking);

export const bookingRoute = router;
