import { Router } from "express";
import { validateM } from "../../../middleware/validate";
import { onboardSchema } from "../../../validators/staff/onboard";
import { onboard } from "../../../controllers/v1/staff/onboard";
import { AuthGuard } from "../../../middleware/auth";
import { userEdit } from "../../../controllers/v1/staff/edit";
import { staffInfo } from "../../../controllers/v1/staff/get";

const staffRouter = Router();

// Apply auth middleware for Admins only
staffRouter.use(AuthGuard(["Admin"]));

staffRouter
  .route("/onboard")
  .post(validateM(onboardSchema), onboard)
  .put(validateM(onboardSchema), userEdit);

staffRouter.get("/onboard/:id", staffInfo);

export default staffRouter;
