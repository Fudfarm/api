import express from "express";
import { AuthGuard } from "../../middleware/auth";
import { USER_ROLES } from "../../interface/user";
import { updatePassword } from "../../controllers/v1/user/updatePassword";

export const userRouter = express.Router();

userRouter.use(AuthGuard([...USER_ROLES]));

userRouter.put("/update-password", updatePassword);
