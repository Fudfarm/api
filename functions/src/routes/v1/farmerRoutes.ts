import express from "express";
import { AuthGuard } from "../../middleware/auth";
import { farmersUpload } from "../../controllers/v1/farmer/upload";

const farmerRouter = express.Router();

farmerRouter.use(AuthGuard(["Field Officer"]));

farmerRouter.post("/upload", farmersUpload);

export default farmerRouter;
