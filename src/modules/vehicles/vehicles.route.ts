import { Router } from "express";
import { vehicleController } from "./vehicles.controller.js";
import auth from "../../middleware/auth.js";
import { Roles } from "../auth/auth.constant.js";

const router = Router();

router.post("/", auth(Roles.admin), vehicleController.createVehicleIntoDb);

router.get("/", vehicleController.getVehiclesFromDb);

router.get("/:vehicleId", vehicleController.getSingleVehicle);

router.put("/:vehicleId", auth(Roles.admin), vehicleController.updateVehicle);

router.delete(
  "/:vehicleId",
  auth(Roles.admin),
  vehicleController.deleteVehicle,
);

export const vehicleRoute = router;
