import { Router } from "express";
import { validateM } from "../../../middleware/validate";
import { onboardSchema } from "../../../validators/staff/onboard";
import { onboard } from "../../../controllers/v1/staff/onboard";
import { AuthGuard } from "../../../middleware/auth";
import { userEdit } from "../../../controllers/v1/staff/edit";

const staffRouter = Router();

// Apply auth middleware to all routes below
staffRouter.use(AuthGuard);

staffRouter
  .route("/onboard")
  .post(validateM(onboardSchema), onboard)
  .put(validateM(onboardSchema), userEdit);


export default staffRouter;
