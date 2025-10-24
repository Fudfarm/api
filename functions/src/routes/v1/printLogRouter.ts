import express from "express";
import { downloadSystemUsersReport } from "../../controllers/v1/log/systemUser";
import { AuthGuard } from "../../middleware/auth";

const systemLogRouter = express.Router();


systemLogRouter.put("/download-system-user", AuthGuard(["Admin"]), downloadSystemUsersReport);


export default systemLogRouter;
