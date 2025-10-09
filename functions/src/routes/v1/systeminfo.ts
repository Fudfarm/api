import express from "express";
import { getContactInfo, updateContactInfo } from "../../controllers/v1/system/contact";
import { getPrivacyPolicy, updatePrivacyPolicy } from "../../controllers/v1/system/privacy";
import { getAboutUs, updateAboutUs } from "../../controllers/v1/system/about";
import { getToc, updateToc } from "../../controllers/v1/system/toc";
import { AuthGuard } from "../../middleware/auth";

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

export default systemInfoRouter;
