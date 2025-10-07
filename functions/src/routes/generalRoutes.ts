import { Router } from "express";
import { getHealthStatus, getHomePage } from "../controllers/generalController";
const generalRouter = Router();

// Auth routes

// General routes
generalRouter.get("/", getHomePage);
generalRouter.get("/health", getHealthStatus);

export default generalRouter;
