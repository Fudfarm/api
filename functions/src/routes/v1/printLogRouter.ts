import express from "express";
import { downloadFarmerUpdatesReport } from "../../controllers/v1/log/farmerUpdate";
import { downloadSystemUsersReport } from "../../controllers/v1/log/systemUser";
import { AuthGuard } from "../../middleware/auth";

const systemLogRouter = express.Router();


systemLogRouter.get("/download-system-user", AuthGuard(["Admin"]), downloadSystemUsersReport);
systemLogRouter.get("/download-farmer-update-changes", AuthGuard(["Admin"]), downloadFarmerUpdatesReport);


export default systemLogRouter;
