import { Router } from "express";
import { getDevices } from "../../controllers/v1/auth/devices";
import { forgotPassword } from "../../controllers/v1/auth/forgotPassword";
import { loginUser } from "../../controllers/v1/auth/login";
import { logout } from "../../controllers/v1/auth/logout";
import { logoutAll } from "../../controllers/v1/auth/logoutAll";
import { logoutOthers } from "../../controllers/v1/auth/logoutOthers";
import { refresh } from "../../controllers/v1/auth/refresh";
import { resetPassword } from "../../controllers/v1/auth/resetPassword";
import { validResetPwdToken } from "../../controllers/v1/auth/validResetPwdToken";
import { verifyTurnstile } from "../../middleware/turnstile";
import { validateM } from "../../middleware/validate";
import { emailSchema } from "../../validators/email";
import { loginSchema } from "../../validators/login";
import { resetPasswordSchema } from "../../validators/reset-password";

const authRouter = Router();

authRouter.post(
  "/login-mobile-xwshzm189nb2az2zw3xe",
  validateM(loginSchema),
  loginUser
);
authRouter.post(
  "/login-web-x3fvr45dnl8ilo73clvg",
  validateM(loginSchema),
  verifyTurnstile,
  loginUser
);
authRouter.post("/refresh", refresh);
authRouter.post("/logout", logout);
authRouter.post("/logout-all", logoutAll);
authRouter.post("/logout-others", logoutOthers);
authRouter.post("/devices", getDevices);

authRouter.post(
  "/forgot-password-mobile-hns9cqyzmqb0kislfccz",
  validateM(emailSchema),
  forgotPassword
);
authRouter.post(
  "/forgot-password-web-gt7yels9utz05plsncrd",
  validateM(emailSchema),
  verifyTurnstile,
  forgotPassword
);
authRouter.post("/valid-reset-password-token", validResetPwdToken);
authRouter.post(
  "/reset-password",
  validateM(resetPasswordSchema),
  resetPassword
);

export default authRouter;
