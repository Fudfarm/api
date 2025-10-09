import express from "express";
import { AuthGuard } from "../../middleware/auth";
import { USER_ROLES } from "../../interface/user";
import { updatePassword } from "../../controllers/v1/user/updatePassword";
import { updateNotification } from "../../controllers/v1/user/updateNotification";
import { contactUs } from "../../controllers/v1/contactUs";
import { contactUsSchema } from "../../validators/contactUs";
import { validateM } from "../../middleware/validate";
import { feedbackBotContact } from "../../controllers/v1/feedback";

const userRouter = express.Router();


userRouter.use(AuthGuard([...USER_ROLES]));

userRouter.put("/update-password", AuthGuard([...USER_ROLES]), updatePassword);
userRouter.put("/update-notification", AuthGuard([...USER_ROLES]), updateNotification);

userRouter.post("/contact-us", validateM(contactUsSchema), AuthGuard([...USER_ROLES]), contactUs);
userRouter.post("/feedback", AuthGuard([...USER_ROLES]), feedbackBotContact);

export default userRouter;
