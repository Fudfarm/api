import { Router } from "express";
import { validateM } from "../../middleware/validate";
import { loginSchema } from "../../validators/login";
import { loginUser } from "../../controllers/v1/auth/login";

const authRouter = Router();

authRouter.post("/login", validateM(loginSchema), loginUser);

export default authRouter;
