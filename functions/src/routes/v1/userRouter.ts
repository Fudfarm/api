import express from "express";
import { AuthGuard } from "../../middleware/auth";
import { USER_ROLES } from "../../interface/user";
import { updatePassword } from "../../controllers/v1/user/updatePassword";
import { updateNotification } from "../../controllers/v1/user/updateNotification";

const userRouter = express.Router();

userRouter.use(AuthGuard([...USER_ROLES]));

userRouter.put("/update-password", updatePassword);
userRouter.put("/update-notification", updateNotification);

export default userRouter;
