import express from "express";
import { AuthGuard } from "../../middleware/auth";
import { USER_ROLES } from "../../interface/user";
import { updatePassword } from "../../controllers/v1/user/updatePassword";
import { updateNotification } from "../../controllers/v1/user/updateNotification";
import { contactUs } from "../../controllers/v1/contactUs";
import { contactUsSchema } from "../../validators/contactUs";
import { validateM } from "../../middleware/validate";

const userRouter = express.Router();

userRouter.use(AuthGuard([...USER_ROLES]));

userRouter.put("/update-password", updatePassword);
userRouter.put("/update-notification", updateNotification);

userRouter.post("/contact-us", validateM(contactUsSchema), contactUs);

export default userRouter;
