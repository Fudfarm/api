import express from "express";
import { AuthGuard } from "../../middleware/auth";
import { farmersUpload } from "../../controllers/v1/farmer/upload";
import { USER_ROLES } from "../../interface/user";
import { farmersList } from "../../controllers/v1/farmer/list";
import { getFarmerBiodata } from "../../controllers/v1/farmer/details/biodata";

const farmerRouter = express.Router();

farmerRouter.post("/upload", AuthGuard(["Field Officer"]), farmersUpload);
farmerRouter.get("/list", AuthGuard([...USER_ROLES]), farmersList);

// route grouping with details as base path /api/v1/farmer
const details = express.Router();
details.use("/biodata/:id", getFarmerBiodata);

farmerRouter.use("/details", AuthGuard([...USER_ROLES]), details);

export default farmerRouter;
