import { Router } from "express";
import { validateM } from "../../middleware/validate";
import { loginSchema } from "../../validators/login";
import { loginUser } from "../../controllers/v1/auth/login";
import { refresh } from "../../controllers/v1/auth/refresh";
import { logout } from "../../controllers/v1/auth/logout";
import { logoutAll } from "../../controllers/v1/auth/logoutAll";
import { logoutOthers } from "../../controllers/v1/auth/logoutOthers";
import { getDevices } from "../../controllers/v1/auth/devices";
import { emailSchema } from "../../validators/email";
import { forgotPassword } from "../../controllers/v1/auth/forgotPassword";
import { validResetPwdToken } from "../../controllers/v1/auth/validResetPwdToken";
import { resetPasswordSchema } from "../../validators/reset-password";
import { resetPassword } from "../../controllers/v1/auth/resetPassword";

const authRouter = Router();

authRouter.post("/login", validateM(loginSchema), loginUser);
authRouter.post("/refresh", refresh);
authRouter.post("/logout", logout);
authRouter.post("/logout-all", logoutAll);
authRouter.post("/logout-others", logoutOthers);
authRouter.post("/devices", getDevices);

authRouter.post("/forgot-password", validateM(emailSchema), forgotPassword);
authRouter.post("/valid-reset-password-token", validResetPwdToken);
authRouter.post(
  "/reset-password",
  validateM(resetPasswordSchema),
  resetPassword
);

export default authRouter;
