import express from "express";
import { AuthGuard } from "../../middleware/auth";
import { farmersUpload } from "../../controllers/v1/farmer/upload";

const farmerRouter = express.Router();

// Create a sub-router for protected routes
const protectedRoutes = express.Router();

// Field Officer–only routes
protectedRoutes.post("/upload", farmersUpload);

// Apply AuthGuard only to this subset
farmerRouter.use("/", AuthGuard(["Field Officer"]), protectedRoutes);

export default farmerRouter;
