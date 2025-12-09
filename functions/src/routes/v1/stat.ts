import express from "express";
import farmerDashboardStats from "../../controllers/v1/fieldOfficerStat/farmerStat";
import fieldOfficerEnrollmentGenStats from "../../controllers/v1/fieldOfficerStat/general";
import fieldOfficerEnrollmentRangeStats from "../../controllers/v1/fieldOfficerStat/range";
import { AuthGuard } from "../../middleware/auth";

const statRouter = express.Router();

statRouter.use(AuthGuard(["Admin"]));

statRouter.get("/field-officer-gen-enrollment-stats", AuthGuard(["Admin"]), fieldOfficerEnrollmentGenStats);

statRouter.get("/field-officer-range-enrollment-stats", AuthGuard(["Admin"]), fieldOfficerEnrollmentRangeStats);

statRouter.get("/farmer-stat", AuthGuard(["Admin"]), farmerDashboardStats);

export default statRouter;

