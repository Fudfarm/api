import express from "express";
import fieldOfficerEnrollmentGenStats from "../../controllers/v1/fieldOfficerStat/general";
import { AuthGuard } from "../../middleware/auth";

const statRouter = express.Router();

statRouter.use(AuthGuard(["Admin"]));

statRouter.get("/field-officer-gen-enrollment-stats", AuthGuard(["Admin"]), fieldOfficerEnrollmentGenStats);

export default statRouter;

