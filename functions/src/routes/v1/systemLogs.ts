import express from "express";
import { updatePassword } from "../../controllers/v1/user/updatePassword";
import { USER_ROLES } from "../../interface/user";
import { AuthGuard } from "../../middleware/auth";

const systemLogRouter = express.Router();


systemLogRouter.put("/update-password", AuthGuard([...USER_ROLES]), updatePassword);


export default systemLogRouter;
