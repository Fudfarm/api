import express from "express";
import { AuthGuard } from "../../middleware/auth";
import { farmersUpload } from "../../controllers/v1/farmer/upload";
import { USER_ROLES } from "../../interface/user";
import { farmersList } from "../../controllers/v1/farmer/list";

const farmerRouter = express.Router();

farmerRouter.post("/upload", AuthGuard(["Field Officer"]), farmersUpload);
farmerRouter.get("/list", AuthGuard([...USER_ROLES]), farmersList);

export default farmerRouter;
