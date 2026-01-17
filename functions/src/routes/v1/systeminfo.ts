import express from "express";
import { getAboutUs, updateAboutUs } from "../../controllers/v1/system/about";
import {
  getContactInfo,
  updateContactInfo,
} from "../../controllers/v1/system/contact";
import {
  getPrivacyPolicy,
  updatePrivacyPolicy,
} from "../../controllers/v1/system/privacy";
import { getToc, updateToc } from "../../controllers/v1/system/toc";
import {
  createUnit,
  deleteUnit,
  getAllUnits,
  getUnitById,
  updateUnit,
} from "../../controllers/v1/system/unit";
import { AuthGuard } from "../../middleware/auth";
import { validateM } from "../../middleware/validate";
import { unitSchema } from "../../validators/unit";

const systemInfoRouter = express.Router();

// 🟩 Public routes
systemInfoRouter.get("/contact", getContactInfo);
systemInfoRouter.get("/privacy", getPrivacyPolicy);
systemInfoRouter.get("/about", getAboutUs);
systemInfoRouter.get("/toc", getToc);

// 🟦 Admin-only routes (guard applied per-route so they don't affect other routers)
systemInfoRouter.put("/contact", AuthGuard(["Admin"]), updateContactInfo);
systemInfoRouter.put("/privacy", AuthGuard(["Admin"]), updatePrivacyPolicy);
systemInfoRouter.put("/about", AuthGuard(["Admin"]), updateAboutUs);
systemInfoRouter.put("/toc", AuthGuard(["Admin"]), updateToc);

// units routes here
// Public unit routes
systemInfoRouter.get("/units", getAllUnits);
systemInfoRouter.get("/unit/:id", getUnitById);

// Admin-only unit routes
systemInfoRouter.post(
  "/unit",
  AuthGuard(["Admin"]),
  validateM(unitSchema),
  createUnit,
);
systemInfoRouter.put(
  "/unit/:id",
  AuthGuard(["Admin"]),
  validateM(unitSchema),
  updateUnit,
);
systemInfoRouter.delete("/unit/:id", AuthGuard(["Admin"]), deleteUnit);

export default systemInfoRouter;
