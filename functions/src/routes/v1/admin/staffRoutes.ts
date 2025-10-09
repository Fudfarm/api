import { Router } from "express";
import { validateM } from "../../../middleware/validate";
import { onboardSchema } from "../../../validators/staff/onboard";
import { onboard } from "../../../controllers/v1/staff/onboard";
import { AuthGuard } from "../../../middleware/auth";
import { userEdit } from "../../../controllers/v1/staff/edit";
import { staffInfo } from "../../../controllers/v1/staff/get";
import { staffList } from "../../../controllers/v1/staff/allStaff";
import { updateUserStatus } from "../../../controllers/v1/staff/staffStatusUpdate";
import { userSchema } from "../../../validators/staff/status";

const staffRouter = Router();

// Admin-only section
staffRouter
  .route("/onboard")
  .post(AuthGuard(["Admin"]), validateM(onboardSchema), onboard)
  .put(AuthGuard(["Admin"]), validateM(onboardSchema), userEdit);

staffRouter.get("/:id", AuthGuard(["Admin"]), staffInfo);
staffRouter.put("/status/:id", AuthGuard(["Admin"]), validateM(userSchema), updateUserStatus);
staffRouter.get("", AuthGuard(["Admin"]), staffList);

export default staffRouter;
